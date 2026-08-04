import { createFileRoute } from '@tanstack/react-router'

export const Route = createFileRoute('/api/public/setup-admin')({
  server: {
    handlers: {
      GET: async () => {
        try {
          const { supabaseAdmin } = await import('@/integrations/supabase/client.server');
          
          const email = 'nobreacademy2026@gmail.com';
          
          // 1. Get user ID
          const { data: { users }, error: listError } = await supabaseAdmin.auth.admin.listUsers();
          if (listError) throw listError;
          
          const user = users.find(u => u.email === email);
          if (!user) {
             return new Response(JSON.stringify({ error: 'User not found' }), { status: 404 });
          }
          
          // 2. Ensure user has admin role
          const { error: roleError } = await supabaseAdmin
            .from('user_roles' as any)
            .upsert({ user_id: user.id, role: 'admin' }, { onConflict: 'user_id,role' });
            
          if (roleError) throw roleError;

          // 3. Confirm email just in case
          const { error: confirmError } = await supabaseAdmin.auth.admin.updateUserById(
            user.id,
            { email_confirm: true }
          );
          
          if (confirmError) throw confirmError;

          return new Response(JSON.stringify({ 
            success: true, 
            message: 'Admin role verified/updated for ' + email,
            userId: user.id
          }), { status: 200 });
          
        } catch (error: any) {
          console.error('Setup error:', error);
          return new Response(JSON.stringify({ error: error.message }), { status: 500 });
        }
      }
    }
  }
})
