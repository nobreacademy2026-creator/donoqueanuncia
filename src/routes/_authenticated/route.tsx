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
        console.log("Verificando permissões de admin via server function...");
        
        const { checkAdminRole } = await import("@/lib/auth.functions");
        const data = await checkAdminRole();

        if (!data.hasAdmin) {
          console.warn("Usuário não é admin");
          throw redirect({ to: "/" });
        }
        
        console.log("Acesso admin confirmado");
      } catch (e: any) {
        if (e && (e.to || e.isRedirect)) throw e;
        
        // Se falhar por não estar autenticado (401), o middleware do serverFn vai lançar um erro
        // que podemos capturar aqui.
        console.error("Falha na proteção de rota admin:", e);
        throw redirect({ to: "/auth" });
      }
    }
  },
  component: () => <Outlet />,
});
