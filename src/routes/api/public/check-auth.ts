import { createFileRoute } from '@tanstack/react-router'

export const Route = createFileRoute('/api/public/check-auth')({
  server: {
    handlers: {
      GET: async ({ request }) => {
        try {
          const { supabaseAdmin } = await import('@/integrations/supabase/client.server');
          
          // Pegar o token do header
          const authHeader = request.headers.get('Authorization');
          if (!authHeader) return new Response('No token', { status: 401 });
          
          const token = authHeader.replace('Bearer ', '');
          
          // 1. Verificar o token e pegar o user
          const { data: { user }, error: authError } = await supabaseAdmin.auth.getUser(token);
          if (authError || !user) return new Response('Invalid token', { status: 401 });
          
          // 2. Verificar o papel no banco ignorando RLS via supabaseAdmin
          const { data: roles, error: roleError } = await supabaseAdmin
            .from('user_roles' as any)
            .select('role')
            .eq('user_id', user.id)
            .eq('role', 'admin');
            
          if (roleError) throw roleError;

          return new Response(JSON.stringify({ 
            user: user.email,
            roles: roles,
            hasAdmin: roles && roles.length > 0
          }), { status: 200 });
          
        } catch (error: any) {
          return new Response(error.message, { status: 500 });
        }
      }
    }
  }
})
