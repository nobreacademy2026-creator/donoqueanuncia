import { createServerFn } from "@tanstack/react-start";
import { serverSessionMiddleware } from "./auth-middleware.server";

export const checkAdminRole = createServerFn({ method: "GET" })
  .middleware([serverSessionMiddleware])
  .handler(async ({ context }) => {
    try {
      const userId = context.userId;
      if (!userId) return { hasAdmin: false, error: 'Unauthenticated' };

      const { supabaseAdmin } = await import('@/integrations/supabase/client.server');
      const { data, error } = await supabaseAdmin
        .from('user_roles' as any)
        .select('role')
        .eq('user_id', userId)
        .eq('role', 'admin');

      if (error) return { hasAdmin: false, error: error.message };
      return { hasAdmin: data && data.length > 0, userId };
    } catch (error: any) {
      return { hasAdmin: false, error: error.message };
    }
  });
