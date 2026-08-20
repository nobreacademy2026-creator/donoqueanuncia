import { createFileRoute } from "@tanstack/react-router";
import { supabase } from "@/integrations/supabase/client";

export const Route = createFileRoute("/api/public/webhook")({
  server: {
    handlers: {
      POST: async ({ request }) => {
        try {
          const body = await request.json();
          
          // Mapeamento básico para eventos de compra (Hotmart/Kiwify/Cacto)
          const status = body.status || body.event || body.event_name || "unknown";
          const email = body.email || body.customer?.email || body.data?.customer?.email || body.buyer?.email;
          const value = body.amount || body.value || body.data?.amount || body.price || body.purchase?.price;
          
          const eventName = "Purchase";
          const eventId = `webhook_${Date.now()}_${crypto.randomUUID()}`;

          // Registrar no banco de dados local via RPC
          const { error } = await supabase.rpc("record_tracking_event", {
            p_event: {
              event_name: eventName,
              payload: {
                ...body,
                origem_externa: request.headers.get("user-agent") || "webhook",
                raw_status: status
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