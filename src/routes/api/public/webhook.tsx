import { createFileRoute } from "@tanstack/react-router";
import { supabaseAdmin } from "@/integrations/supabase/client.server";

export const Route = createFileRoute("/api/public/webhook")({
  server: {
    handlers: {
      OPTIONS: async () => {
        return new Response(null, {
          status: 204,
          headers: {
            "Access-Control-Allow-Origin": "*",
            "Access-Control-Allow-Methods": "POST, OPTIONS",
            "Access-Control-Allow-Headers": "Content-Type, Authorization",
          },
        });
      },
      POST: async ({ request }) => {
        const corsHeaders = {
          "Access-Control-Allow-Origin": "*",
          "Access-Control-Allow-Methods": "POST, OPTIONS",
          "Access-Control-Allow-Headers": "Content-Type, Authorization",
          "Content-Type": "application/json",
        };

        try {
          const body = await request.json();
          
          if (!body || typeof body !== "object") {
            return new Response(JSON.stringify({ error: "Empty or invalid body" }), { 
              status: 400, 
              headers: corsHeaders 
            });
          }

          // Mapeamento básico para eventos de compra (Hotmart/Kiwify/Cacto/Braip/Eduzz/Appmax)
          const rawStatus = (
            body.status || 
            body.event || 
            body.event_name || 
            body.transaction_status || 
            body.transaction?.status || 
            body.data?.status || 
            body.checkout_status || 
            body.status_name ||
            body.data?.transaction?.status ||
            body.data?.event_name ||
            body.data?.transaction_status ||
            "unknown"
          ).toString().toLowerCase();

          const email = 
            body.email || 
            body.customer?.email || 
            body.data?.customer?.email || 
            body.buyer?.email || 
            body.cus_email || 
            body.data?.buyer?.email ||
            body.client?.email ||
            body.data?.email ||
            body.data?.client?.email;
          
          const phone = 
            body.phone || 
            body.customer?.phone || 
            body.data?.customer?.phone || 
            body.buyer?.phone || 
            body.cus_phone || 
            body.data?.buyer?.phone ||
            body.client?.phone ||
            body.data?.phone ||
            body.data?.client?.phone ||
            body.cellphone ||
            body.data?.cellphone;

          const fullName = 
            body.name || 
            body.customer?.name || 
            body.data?.customer?.name || 
            body.buyer?.name || 
            body.data?.name || 
            body.client?.name ||
            body.data?.client?.name;
            
          let firstName = "";
          let lastName = "";
          if (fullName && typeof fullName === "string") {
            const parts = fullName.trim().split(/\s+/);
            firstName = parts[0];
            lastName = parts.slice(1).join(" ");
          }

          const value = 
            body.amount || 
            body.value || 
            body.data?.amount || 
            body.price || 
            body.purchase?.price || 
            body.total_price || 
            body.trans_value || 
            body.amount_paid || 
            body.data?.total_price || 
            body.full_price ||
            body.data?.value ||
            body.data?.transaction?.total_value ||
            body.data?.total_value;

          const eventIdInput = 
            body.id || 
            body.transaction_id || 
            body.event_id || 
            body.data?.id || 
            body.data?.transaction?.id ||
            body.data?.transaction_id;

          // Garantir que o eventId atende ao regex da Meta: ^[a-zA-Z0-9_-]{8,120}$
          let finalEventId = "";
          if (eventIdInput) {
            const sanitized = eventIdInput.toString().replace(/[^a-zA-Z0-9_-]/g, "_");
            if (sanitized.length >= 8) {
              finalEventId = sanitized.slice(0, 120);
            }
          }
          
          if (!finalEventId) {
            finalEventId = `wb_${Date.now()}_${crypto.randomUUID().replace(/-/g, "").slice(0, 12)}`;
          }
          
          // Mapeamento dinâmico do nome do evento
          let eventName = "Purchase";
          
          // Se for abandono ou início de checkout
          if (rawStatus.includes("abandon") || rawStatus.includes("carrinho_abandonado") || rawStatus.includes("started") || rawStatus.includes("iniciado") || rawStatus.includes("checkout")) {
            eventName = "InitiateCheckout";
          } else if (rawStatus.includes("lead") || rawStatus.includes("contact")) {
            eventName = "Lead";
          } else if (rawStatus.includes("refund") || rawStatus.includes("chargeback") || rawStatus.includes("reembolso") || rawStatus.includes("estorno")) {
            eventName = "Other";
          } else if (
            rawStatus.includes("aprovada") || 
            rawStatus.includes("pago") || 
            rawStatus.includes("paid") || 
            rawStatus.includes("approved") || 
            rawStatus.includes("complete") || 
            rawStatus.includes("processamento") || 
            rawStatus.includes("analise") || 
            rawStatus.includes("pending") || 
            rawStatus.includes("aguardando") || 
            rawStatus.includes("pix") || 
            rawStatus.includes("boleto") ||
            rawStatus.includes("integral") ||
            rawStatus.includes("confirmado") ||
            rawStatus.includes("concluído") ||
            rawStatus.includes("sucesso")
          ) {
            eventName = "Purchase";
          }

          // Mapeamento de status amigável para o dashboard
          let friendlyStatus = rawStatus;
          if (rawStatus.includes("printed") || rawStatus.includes("boleto")) friendlyStatus = "boleto_printed";
          else if (rawStatus.includes("pix") || rawStatus.includes("gerado")) friendlyStatus = "pix_generated";
          else if (rawStatus.includes("aguardando")) friendlyStatus = "waiting_payment";
          else if (
            rawStatus.includes("aprovada") || 
            rawStatus.includes("pago") || 
            rawStatus.includes("paid") || 
            rawStatus.includes("approved") || 
            rawStatus.includes("complete") || 
            rawStatus.includes("sucesso") || 
            rawStatus.includes("integral") || 
            rawStatus.includes("confirmado") || 
            rawStatus.includes("concluído")
          ) friendlyStatus = "approved";
          else if (rawStatus.includes("abandon") || rawStatus.includes("abandonado")) friendlyStatus = "abandoned_checkout";
          else if (rawStatus.includes("refund") || rawStatus.includes("reembolso")) friendlyStatus = "refunded";
          else if (rawStatus.includes("chargeback")) friendlyStatus = "chargeback";
          else if (rawStatus.includes("cancel")) friendlyStatus = "subscription_canceled";

          // Extrair UTMs
          const utm_source = body.utm_source || body.src || body.data?.utm_source || body.data?.src;
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
                status_amigavel: friendlyStatus,
                webhook_provider: "externo"
              },
              client_name: body.name || body.customer?.name || body.data?.customer?.name || body.buyer?.name || body.data?.name || body.data?.client?.name || email || "Cliente Externo",
              value: typeof value === "number" ? value : parseFloat(String(value || "")) || null,
              currency: body.currency || body.data?.currency || "BRL",
              source: "webhook_externo",
              utm_source,
              utm_medium,
              utm_campaign,
              page_url: request.url,
              event_id: finalEventId,
              meta_pixel_status: "not_sent",
              meta_api_status: "pending"
            }
          });

          if (error) {
            console.error("[Webhook] Erro ao registrar evento no Supabase:", error);
          }

          // Enviar para a Meta via Conversions API
          try {
            const { sendMetaConversion } = await import("@/lib/meta-conversions.functions");
            await sendMetaConversion({
              data: {
                eventName,
                eventId: finalEventId,
                eventSourceUrl: request.url,
                customData: {
                  value: typeof value === "number" ? value : parseFloat(String(value || "")) || 0,
                  currency: body.currency || body.data?.currency || "BRL",
                  email: email || "",
                  webhook: true
                }
              }
            });
          } catch (metaError) {
            console.error("[Webhook] Erro ao enviar para Meta CAPI:", metaError);
          }

          return new Response(JSON.stringify({ status: "ok", eventId: finalEventId }), {
            status: 200,
            headers: corsHeaders
          });
        } catch (err) {
          console.error("[Webhook] Erro ao processar payload:", err);
          return new Response(JSON.stringify({ 
            error: "Invalid payload", 
            detail: err instanceof Error ? err.message : String(err) 
          }), { 
            status: 400,
            headers: corsHeaders
          });
        }
      }
    }
  }
});