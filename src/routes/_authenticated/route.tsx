import { createFileRoute, Outlet, redirect } from "@tanstack/react-router";
import { supabase } from "@/integrations/supabase/client";

export const Route = createFileRoute("/_authenticated")({
  ssr: false,
  beforeLoad: async ({ location }) => {
    // Client-side session check (route is client-only)
    const { data, error } = await supabase.auth.getUser();

    if (error || !data?.user) {
      throw redirect({
        to: "/auth",
        search: { redirect: location.href },
      });
    }

    // 3. Admin path check
    if (location.pathname.startsWith("/admin")) {
      try {
        const { checkCurrentUserAdmin } = await import("@/lib/auth-client");
        const data = await checkCurrentUserAdmin();

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
