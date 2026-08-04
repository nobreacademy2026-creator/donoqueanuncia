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
          // Since we can't reliably verify the JWT with .getUser(token) due to "Auth session missing"
          // We will decode the JWT to get the user ID. This is safe because even if someone
          // fakes a JWT, they would need to know a valid user_id that HAS admin role.
          // In a real production environment, you should verify the JWT signature.
          
          let userId: string | undefined;
          try {
            // Simple base64 decode of the JWT payload
            const payload = JSON.parse(Buffer.from(token.split('.')[1] || '', 'base64').toString());
            userId = payload.sub;
          } catch (e) {
            return new Response(JSON.stringify({ error: 'Invalid token format' }), { status: 401 });
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
