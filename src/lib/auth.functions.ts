import { createServerFn } from "@tanstack/react-start";
import { getRequest } from "@tanstack/react-start/server";

export const checkAdminRole = createServerFn({ method: "GET" })
  .handler(async () => {
    try {
      const request = getRequest();
      const authHeader = request.headers.get('Authorization') || request.headers.get('authorization');
      
      if (!authHeader) return { hasAdmin: false, error: 'No header' };
      
      const token = authHeader.replace('Bearer ', '');
      const payload = JSON.parse(Buffer.from(token.split('.')[1] || '', 'base64').toString());
      const userId = payload.sub;
      
      if (!userId) return { hasAdmin: false, error: 'No user id' };

      // Direct check without extra imports
      const { supabaseAdmin } = await import('@/integrations/supabase/client.server');
      const { data, error } = await supabaseAdmin
        .from('user_roles' as any)
        .select('role')
        .eq('user_id', userId)
        .eq('role', 'admin');

      if (error) return { hasAdmin: false, error: error.message };
      
      return { hasAdmin: data && data.length > 0, userId };
    } catch (error: any) {
      console.error('[checkAdminRole] Error:', error);
      return { hasAdmin: false, error: error.message };
    }
  });
