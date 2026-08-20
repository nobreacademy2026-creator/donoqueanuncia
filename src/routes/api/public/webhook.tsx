import { createFileRoute } from "@tanstack/react-router";
import { supabaseAdmin } from "@/integrations/supabase/client.server";

export const Route = createFileRoute("/api/public/webhook")({
  server: {
    handlers: {
      POST: async ({ request }) => {
        try {
          const body = await request.json();
          
          // Mapeamento básico para eventos de compra (Hotmart/Kiwify/Cacto/Braip/Eduzz)
          const rawStatus = (body.status || body.event || body.event_name || body.transaction_status || body.transaction?.status || "unknown").toString().toLowerCase();
          const email = body.email || body.customer?.email || body.data?.customer?.email || body.buyer?.email || body.cus_email;
          const value = body.amount || body.value || body.data?.amount || body.price || body.purchase?.price || body.total_price || body.trans_value || body.amount_paid;
          
          // Mapeamento dinâmico do nome do evento
          let eventName = "Purchase";
          
          // Se for abandono ou início de checkout
          if (rawStatus.includes("abandon") || rawStatus.includes("carrinho_abandonado") || rawStatus.includes("started") || rawStatus.includes("iniciado") || rawStatus.includes("checkout")) {
            // Se for explicitamente abandono, é InitiateCheckout
            eventName = "InitiateCheckout";
          } else if (rawStatus.includes("lead") || rawStatus.includes("contact")) {
            eventName = "Lead";
          } else if (rawStatus.includes("refund") || rawStatus.includes("chargeback") || rawStatus.includes("reembolso") || rawStatus.includes("estorno")) {
            eventName = "Other";
          } else if (rawStatus.includes("aprovada") || rawStatus.includes("pago") || rawStatus.includes("paid") || rawStatus.includes("approved") || rawStatus.includes("complete") || rawStatus.includes("processamento") || rawStatus.includes("analise") || rawStatus.includes("pending") || rawStatus.includes("aguardando") || rawStatus.includes("pix") || rawStatus.includes("boleto")) {
            // Eventos de compra ou intenção de compra forte
            eventName = "Purchase";
          } else {
            eventName = "Purchase";
          }

          // Mapeamento de status amigável para o dashboard
          let friendlyStatus = rawStatus;
          if (rawStatus.includes("printed") || rawStatus.includes("boleto")) friendlyStatus = "boleto_printed";
          else if (rawStatus.includes("pix")) friendlyStatus = "pix_generated";
          else if (rawStatus.includes("gerado")) friendlyStatus = "pix_generated";
          else if (rawStatus.includes("aguardando")) friendlyStatus = "waiting_payment";
          else if (rawStatus.includes("aprovada") || rawStatus.includes("pago") || rawStatus.includes("paid") || rawStatus.includes("approved") || rawStatus.includes("complete") || rawStatus.includes("sucesso")) friendlyStatus = "approved";
          else if (rawStatus.includes("abandon") || rawStatus.includes("abandonado")) friendlyStatus = "abandoned_checkout";
          else if (rawStatus.includes("refund") || rawStatus.includes("reembolso")) friendlyStatus = "refunded";
          else if (rawStatus.includes("chargeback")) friendlyStatus = "chargeback";
          else if (rawStatus.includes("cancel")) friendlyStatus = "subscription_canceled";

          const eventId = `webhook_${Date.now()}_${crypto.randomUUID()}`;

          // Extrair UTMs se presentes no payload (comum em Kiwify/Hotmart)
          const utm_source = body.utm_source || body.src || body.data?.utm_source;
          const utm_medium = body.utm_medium || body.data?.utm_medium;
          const utm_campaign = body.utm_campaign || body.data?.utm_campaign;

          // Registrar no banco de dados local via RPC
          const { error } = await supabaseAdmin.rpc("record_tracking_event", {
            p_event: {
              event_name: eventName,
              payload: {
                ...body,
                origem_externa: request.headers.get("user-agent") || "webhook",
                raw_status: rawStatus,
                status_amigavel: friendlyStatus
              },
              client_name: body.name || body.customer?.name || body.data?.customer?.name || body.buyer?.name || email || "Cliente Externo",
              value: typeof value === "number" ? value : parseFloat(value) || null,
              currency: body.currency || "BRL",
              source: "webhook_externo",
              utm_source,
              utm_medium,
              utm_campaign,
              page_url: request.url,
              event_id: eventId,
              meta_pixel_status: "not_sent",
              meta_api_status: "pending"
            }
          });

          if (error) {
            console.error("[Webhook] Erro ao registrar evento no Supabase:", error);
          }

          // Enviar para a Meta via Conversions API se configurado
          try {
            const { sendMetaConversion } = await import("@/lib/meta-conversions.functions");
            await sendMetaConversion({
              data: {
                eventName,
                eventId,
                eventSourceUrl: request.url,
                customData: {
                  value: typeof value === "number" ? value : parseFloat(value) || 0,
                  currency: body.currency || "BRL",
                  email: email || ""
                }
              }
            });
          } catch (metaError) {
            console.error("[Webhook] Erro ao enviar para Meta CAPI:", metaError);
          }

          return new Response(JSON.stringify({ status: "ok", eventId }), {
            status: 200,
            headers: { "Content-Type": "application/json" }
          });
        } catch (err) {
          console.error("[Webhook] Erro ao processar payload:", err);
          return new Response(JSON.stringify({ error: "Invalid payload" }), { 
            status: 400,
            headers: { "Content-Type": "application/json" }
          });
        }
      }
    }
  }
});