import { createFileRoute, Outlet, redirect } from "@tanstack/react-router";
import { supabase } from "@/integrations/supabase/client";

export const Route = createFileRoute("/_authenticated")({
  beforeLoad: async ({ location }) => {
    // 1. No SSR para autenticação baseada em localStorage
    // Como o Supabase está configurado para usar localStorage, o servidor (SSR)
    // nunca terá a sessão. Para evitar o loop de redirecionamento infinito,
    // pulamos a verificação no servidor e deixamos o cliente lidar com isso.
    if (typeof window === 'undefined') {
      console.log("[Auth] SSR detected, skipping check...");
      return;
    }

    // 2. Verificar sessão no cliente
    const { data: { session } } = await supabase.auth.getSession();
    console.log("[Auth] Session check result:", !!session);
    
    if (!session) {
      console.log("[Auth] Sem sessão no cliente, redirecionando para login");
      throw redirect({
        to: "/auth",
        search: {
          redirect: location.href,
        },
      });
    }

    // 3. Se for uma rota de admin, verificar permissão
    if (location.pathname.startsWith("/admin")) {
      try {
        console.log("[Auth] Verificando permissões de admin via server function...");
        
        const { checkAdminRole } = await import("@/lib/auth.functions");
        const data = await checkAdminRole();

        if (!data || !data.hasAdmin) {
          console.warn("[Auth] Usuário não é admin ou erro na validação:", data?.error);
          throw redirect({ to: "/auth" });
        }
        
        console.log("[Auth] Acesso admin confirmado com sucesso");
      } catch (e: any) {
        if (e && (e.to || e.isRedirect)) throw e;
        
        console.error("[Auth] Falha crítica na proteção de rota admin:", e);
        throw redirect({ to: "/auth" });
      }
    }
  },
  component: () => <Outlet />,
});
