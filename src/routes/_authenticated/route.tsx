import { createFileRoute, Outlet, redirect } from "@tanstack/react-router";
import { supabase } from "@/integrations/supabase/client";

export const Route = createFileRoute("/_authenticated")({
  beforeLoad: async ({ location }) => {
    // 1. Skip check during SSR
    if (typeof window === 'undefined') return;

    // 2. Client-side session check
    const { data: { session } } = await supabase.auth.getSession();
    
    if (!session) {
      throw redirect({
        to: "/auth",
        search: { redirect: location.href },
      });
    }

    // 3. Admin path check
    if (location.pathname.startsWith("/admin")) {
      try {
        const { checkAdminRole } = await import("@/lib/auth.functions");
        const data = await checkAdminRole();

        if (!data || !data.hasAdmin) {
          console.warn("[Auth] No admin access", data?.error);
          throw redirect({ to: "/auth" });
        }
      } catch (e: any) {
        if (e && (e.to || e.isRedirect)) throw e;
        throw redirect({ to: "/auth" });
      }
    }
  },
  component: () => <Outlet />,
});
