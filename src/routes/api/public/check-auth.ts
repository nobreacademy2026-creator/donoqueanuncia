import { createFileRoute } from '@tanstack/react-router'

export const Route = createFileRoute('/api/public/check-auth')({
  server: {
    handlers: {
      GET: async ({ request }) => {
        try {
          const { supabaseAdmin } = await import('@/integrations/supabase/client.server');
          
          // Pegar o token do header
          const authHeader = request.headers.get('Authorization');
          if (!authHeader) return new Response(JSON.stringify({ error: 'No token' }), { status: 401 });
          
          const token = authHeader.replace('Bearer ', '');
          
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

          if (!userId) return new Response(JSON.stringify({ error: 'No user ID in token' }), { status: 401 });
          
          // 2. Verificar o papel no banco ignorando RLS via supabaseAdmin
          const { data: roles, error: roleError } = await supabaseAdmin
            .from('user_roles' as any)
            .select('role')
            .eq('user_id', userId)
            .eq('role', 'admin');
            
          if (roleError) {
            console.error('Database error in check-auth:', roleError);
            throw roleError;
          }

          return new Response(JSON.stringify({ 
            userId: userId,
            hasAdmin: roles && roles.length > 0
          }), { 
            status: 200,
            headers: { 'Content-Type': 'application/json' }
          });
          
        } catch (error: any) {
          console.error('Critical error in check-auth:', error);
          return new Response(JSON.stringify({ error: error.message }), { status: 500 });
        }
      }
    }
  }
})
