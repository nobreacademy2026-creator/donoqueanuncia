import { createServerFn } from "@tanstack/react-start";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";

export const checkAdminRole = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    try {
      const { supabaseAdmin } = await import('@/integrations/supabase/client.server');
      const userId = context.userId;

      if (!userId) {
        return { hasAdmin: false };
      }

      const { data: roles, error } = await (supabaseAdmin
        .from('user_roles' as any)
        .select('role')
        .eq('user_id', userId)
        .eq('role', 'admin') as any);

      if (error) {
        console.error('Database error in checkAdminRole:', error);
        return { hasAdmin: false };
      }

      return { hasAdmin: roles && roles.length > 0 };
    } catch (error) {
      console.error('Error in checkAdminRole handler:', error);
      return { hasAdmin: false };
    }
  });
