import { createFileRoute, Outlet, redirect } from "@tanstack/react-router";
import { supabase } from "@/integrations/supabase/client";

export const Route = createFileRoute("/_authenticated")({
  beforeLoad: async ({ location }) => {
    const { data: { session } } = await supabase.auth.getSession();
    
    if (!session) {
      throw redirect({
        to: "/auth",
        search: {
          redirect: location.href,
        },
      });
    }

    // Use a generic query to check admin role if the route is /admin
    if (location.pathname.startsWith("/admin")) {
      try {
        const { data: roles, error } = await supabase
          .from("user_roles" as any)
          .select("role")
          .eq("user_id", session.user.id)
          .eq("role", "admin")
          .maybeSingle();

        if (error) {
          console.error("Erro ao verificar papel de admin:", error);
          // Em caso de erro de rede ou banco, não redirecionamos imediatamente
          // para evitar loops se for um problema temporário, mas aqui a 
          // decisão segura é tratar como não-admin se a verificação falhar.
        }

        if (!roles) {
          console.log("Usuário não tem papel de admin ou erro na consulta, redirecionando para home");
          throw redirect({ to: "/" });
        }
      } catch (e) {
        // Se o erro for um redirecionamento do TanStack, relançamos
        if (e && typeof e === 'object' && 'to' in e) throw e;
        console.error("Erro capturado na verificação de admin:", e);
        throw redirect({ to: "/" });
      }
    }

  },
  component: () => <Outlet />,
});
