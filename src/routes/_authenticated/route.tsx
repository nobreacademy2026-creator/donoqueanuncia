import { createFileRoute, Outlet, redirect } from "@tanstack/react-router";
import { supabase } from "@/integrations/supabase/client";

export const Route = createFileRoute("/_authenticated")({
  beforeLoad: async ({ location }) => {
    // 1. Verificar sessão
    const { data: { session } } = await supabase.auth.getSession();
    
    if (!session) {
      console.log("Sem sessão, redirecionando para login");
      throw redirect({
        to: "/auth",
        search: {
          redirect: location.href,
        },
      });
    }

    // 2. Se for uma rota de admin, verificar permissão
    if (location.pathname.startsWith("/admin")) {
      try {
        console.log("Verificando permissões de admin localmente...");
        
        // Verificação rápida no cliente se possível, ou via fetch
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) throw redirect({ to: "/auth" });

        const baseUrl = typeof window !== 'undefined' ? window.location.origin : process.env['VITE_APP_URL'] || '';
        const apiUrl = `${baseUrl}/api/public/check-auth`;

        console.log("Chamando API de validação:", apiUrl);
        const res = await fetch(apiUrl, {
          headers: {
            'Authorization': `Bearer ${session.access_token}`
          }
        });

        if (!res.ok) {
          const errorData = await res.json().catch(() => ({}));
          console.error("Erro na API de admin:", res.status, errorData);
          throw redirect({ to: "/auth" });
        }

        const data = await res.json();
        if (!data.hasAdmin) {
          console.warn("Usuário não é admin:", user.email);
          throw redirect({ to: "/" });
        }
        
        console.log("Acesso admin confirmado para:", user.email);
      } catch (e: any) {
        if (e && (e.to || e.isRedirect)) throw e;
        console.error("Falha crítica na proteção de rota admin:", e);
        throw redirect({ to: "/auth" });
      }
    }
  },
  component: () => <Outlet />,
});
