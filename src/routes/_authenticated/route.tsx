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
        console.log("Verificando permissões de admin para:", session.user.email);
        
        // Tentativa direta de leitura com RLS
        const { data: roles, error } = await supabase
          .from("user_roles" as any)
          .select("role")
          .eq("user_id", session.user.id)
          .eq("role", "admin");

        if (error) {
          console.error("Erro na consulta de roles:", error);
          // Se houver erro de permissão (ex: RLS bloqueando), assumimos sem acesso
          throw redirect({ to: "/" });
        }

        const hasAdminRole = roles && roles.length > 0;
        
        if (!hasAdminRole) {
          console.warn("Acesso negado: Usuário não possui papel de admin");
          throw redirect({ to: "/" });
        }
        
        console.log("Acesso admin concedido");
      } catch (e: any) {
        // Preservar redirecionamentos do TanStack
        if (e && e.to) throw e;
        
        console.error("Exceção na verificação de admin:", e);
        throw redirect({ to: "/" });
      }
    }
  },
  component: () => <Outlet />,
});
