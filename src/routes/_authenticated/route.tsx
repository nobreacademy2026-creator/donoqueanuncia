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
      const { data: roles } = await supabase
        .from("user_roles" as any)
        .select("role")
        .eq("user_id", session.user.id)
        .eq("role", "admin")
        .single();

      if (!roles) {
        // Not an admin, redirect to home
        throw redirect({ to: "/" });
      }
    }
  },
  component: () => <Outlet />,
});
