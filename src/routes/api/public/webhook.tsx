import { createFileRoute } from "@tanstack/react-router";
import { supabase } from "@/integrations/supabase/client";

export const Route = createFileRoute("/api/public/webhook")({
  server: {
    handlers: {
      POST: async ({ request }) => {
        try {
          const body = await request.json();
          
          // Mapeamento básico para eventos de compra (Hotmart/Kiwify/Cacto)
          // Hotmart: status 'approved'
          // Kiwify: status 'paid'
          // Cacto: status 'paid'
          const status = body.status || body.event || body.event_name || "unknown";
          const email = body.email || body.customer?.email || body.data?.customer?.email || body.buyer?.email;
          const value = body.amount || body.value || body.data?.amount || body.price || body.purchase?.price;
          
          // Registrar como uma compra (Purchase) na nossa plataforma
          const { error } = await supabase.rpc("record_tracking_event", {
            p_event: {
              event_name: "Purchase",
              payload: {
                ...body,
                origem_externa: request.headers.get("user-agent") || "webhook",
                raw_status: status
              },
              client_name: body.name || body.customer?.name || email || "Cliente Externo",
              value: typeof value === "number" ? value : parseFloat(value) || null,
              currency: body.currency || "BRL",
              source: "webhook_externo",
              page_url: request.url
            }
          });

          if (error) {
            console.error("[Webhook] Erro ao gravar evento:", error);
            return new Response(JSON.stringify({ error: error.message }), { status: 500 });
          }

          return new Response(JSON.stringify({ status: "success" }), {
            status: 200,
            headers: { "Content-Type": "application/json" }
          });
        } catch (err) {
          console.error("[Webhook] Erro no processamento:", err);
          return new Response(JSON.stringify({ error: "Invalid payload" }), { status: 400 });
        }
      }
    }
  }
});
