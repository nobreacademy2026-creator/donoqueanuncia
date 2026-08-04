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
        console.log("Verificando permissões de admin para:", session.user.id);
        
        // Usando a API REST diretamente se houver problemas com o SDK
        const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
        const supabaseAnonKey = import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY;
        
        const res = await fetch(`${supabaseUrl}/rest/v1/user_roles?select=role&role=eq.admin&user_id=eq.${session.user.id}`, {
          headers: {
            'apikey': supabaseAnonKey,
            'Authorization': `Bearer ${session.access_token}`
          }
        });

        if (!res.ok) {
          console.error("Erro na resposta da verificação de admin:", res.status);
          throw redirect({ to: "/" });
        }

        const roles = await res.json();
        const hasAdminRole = roles && roles.length > 0;
        
        if (!hasAdminRole) {
          console.warn("Acesso negado: Usuário não possui papel de admin");
          throw redirect({ to: "/" });
        }
        
        console.log("Acesso admin concedido");
      } catch (e: any) {
        if (e && e.to) throw e;
        console.error("Exceção na verificação de admin:", e);
        throw redirect({ to: "/" });
      }
    }
  },
  component: () => <Outlet />,
});
