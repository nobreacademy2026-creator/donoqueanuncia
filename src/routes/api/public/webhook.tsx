import { createFileRoute } from "@tanstack/react-router";
import { supabase } from "@/integrations/supabase/client";

export const Route = createFileRoute("/api/public/webhook")({
  server: {
    handlers: {
      POST: async ({ request }) => {
        try {
          const body = await request.json();
          
          // Mapeamento básico para eventos de compra (Hotmart/Kiwify/Cacto)
          let status = body.status || body.event || body.event_name || body.transaction_status || body.transaction?.status || "unknown";
          const email = body.email || body.customer?.email || body.data?.customer?.email || body.buyer?.email;
          const value = body.amount || body.value || body.data?.amount || body.price || body.purchase?.price || body.total_price;
          
          // Mapeamento dinâmico do nome do evento
          let eventName = "Purchase";
          const rawEvent = (body.event || body.event_name || body.status || "").toLowerCase();
          
          if (rawEvent.includes("abandon") || rawEvent.includes("carrinho_abandonado")) eventName = "InitiateCheckout";
          else if (rawEvent.includes("lead") || rawEvent.includes("contact")) eventName = "Lead";
          else if (rawEvent.includes("checkout") || rawEvent.includes("cart")) eventName = "InitiateCheckout";
          else if (rawEvent.includes("upsell")) eventName = "AddToCart";
          else if (rawEvent.includes("refund") || rawEvent.includes("chargeback")) eventName = "Other";

          // Mapeamento de status amigável para o dashboard
          let friendlyStatus = status.toLowerCase();
          if (status.includes("printed") || status.includes("boleto")) friendlyStatus = "boleto_printed";
          if (status.includes("pix")) friendlyStatus = "pix_generated";
          if (status.includes("picpay")) friendlyStatus = "picpay_generated";
          if (status.includes("abandon")) friendlyStatus = "abandoned_checkout";
          if (status.includes("refund")) friendlyStatus = "refunded";
          if (status.includes("chargeback")) friendlyStatus = "chargeback";
          if (status.includes("cancel")) friendlyStatus = "subscription_canceled";


          const eventId = `webhook_${Date.now()}_${crypto.randomUUID()}`;

          // Registrar no banco de dados local via RPC
          const { error } = await supabase.rpc("record_tracking_event", {
            p_event: {
              event_name: eventName,
              payload: {
                ...body,
                origem_externa: request.headers.get("user-agent") || "webhook",
                raw_status: status,
                status_amigavel: friendlyStatus
              },
              client_name: body.name || body.customer?.name || email || "Cliente Externo",
              value: typeof value === "number" ? value : parseFloat(value) || null,
              currency: body.currency || "BRL",
              source: "webhook_externo",
              page_url: request.url,
              event_id: eventId,
              meta_pixel_status: "not_sent",
              meta_api_status: "pending"
            }
          });

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

          if (error && error.code !== "23505") {
            return new Response(JSON.stringify({ error: error.message }), { 
              status: 500,
              headers: { "Content-Type": "application/json" }
            });
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