import { createFileRoute } from '@tanstack/react-router'

export const Route = createFileRoute('/api/public/check-auth')({
  server: {
    handlers: {
      GET: async ({ request }) => {
        try {
          console.log('[API/check-auth] Request received');
          const { supabaseAdmin } = await import('@/integrations/supabase/client.server');
          console.log('[API/check-auth] Client server imported');
          
          const authHeader = request.headers.get('Authorization');
          if (!authHeader) {
            console.log('[API/check-auth] No authorization header');
            return new Response(JSON.stringify({ error: 'No token' }), { 
              status: 401,
              headers: { 'Content-Type': 'application/json' }
            });
          }
          
          const token = authHeader.replace('Bearer ', '');
          console.log('[API/check-auth] Token received');
          
          // Use the service role client to directly check user_roles table
          // We decode the JWT to get the user ID and then verify with the DB
          
          let userId: string | undefined;
          try {
            const payload = JSON.parse(Buffer.from(token.split('.')[1] || '', 'base64').toString());
            userId = payload.sub;
          } catch (e) {
            console.error('JWT Decode failed:', e);
            return new Response(JSON.stringify({ error: 'Invalid token format' }), { 
              status: 401,
              headers: { 'Content-Type': 'application/json' }
            });
          }

          console.log('[API/check-auth] User ID:', userId);
          
          const { data: roles, error: roleError } = await supabaseAdmin
            .from('user_roles')
            .select('role')
            .eq('user_id', userId)
            .eq('role', 'admin');
            
          if (roleError) {
            console.error('[API/check-auth] Database error:', roleError);
            throw roleError;
          }
          
          const hasAdmin = roles && roles.length > 0;
          console.log('[API/check-auth] Has admin role:', hasAdmin);

          return new Response(JSON.stringify({ 
            userId: userId,
            hasAdmin: roles && roles.length > 0
          }), { 
            status: 200,
            headers: { 
              'Content-Type': 'application/json',
              'Cache-Control': 'no-store, max-age=0'
            }
          });
          
        } catch (error: any) {
          console.error('Critical error in check-auth:', error);
          return new Response(JSON.stringify({ error: error.message }), { status: 500 });
        }
      }
    }
  }
})
