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
        console.log("Verificando permissões de admin via API...");
        
        // Use absolute URL to avoid relative path issues during SSR/CSR transitions
        const baseUrl = typeof window !== 'undefined' ? window.location.origin : process.env['VITE_APP_URL'] || '';
        const apiUrl = `${baseUrl}/api/public/check-auth`;

        const res = await fetch(apiUrl, {
          headers: {
            'Authorization': `Bearer ${session.access_token}`
          }
        });

        if (!res.ok) {
          console.error("Erro na verificação de admin (API status):", res.status);
          throw redirect({ to: "/" });
        }

        const data = await res.json();
        
        if (!data.hasAdmin) {
          console.warn("Acesso negado: Usuário não possui papel de admin");
          throw redirect({ to: "/" });
        }
        
        console.log("Acesso admin concedido");
      } catch (e: any) {
        if (e && (e.to || e.isRedirect)) throw e;
        console.error("Exceção na verificação de admin:", e);
        throw redirect({ to: "/" });
      }
    }
  },
  component: () => <Outlet />,
});
