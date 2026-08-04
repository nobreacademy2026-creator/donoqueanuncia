import { createFileRoute } from '@tanstack/react-router'

export const Route = createFileRoute('/api/public/setup-admin')({
  server: {
    handlers: {
      GET: async () => {
        try {
          const { supabaseAdmin } = await import('@/integrations/supabase/client.server');
          
          const email = 'nobreacademy2026@gmail.com';
          
          // 1. Garantir que o usuário existe no auth.users
          const { data: { users }, error: listError } = await supabaseAdmin.auth.admin.listUsers();
          if (listError) throw listError;
          
          let user = users.find(u => u.email === email);
          
          if (!user) {
             const { data: { user: newUser }, error: createError } = await supabaseAdmin.auth.admin.createUser({
                email,
                password: 'admin12345',
                email_confirm: true
             });
             if (createError) throw createError;
             user = newUser!;
          } else {
             // Confirmar email e resetar senha se necessário
             await supabaseAdmin.auth.admin.updateUserById(user.id, {
                email_confirm: true,
                password: 'admin12345'
             });
          }

          // 2. Garantir o papel na tabela user_roles
          const { error: roleError } = await supabaseAdmin
            .from('user_roles' as any)
            .upsert({ 
                user_id: user.id, 
                role: 'admin' 
            }, { 
                onConflict: 'user_id,role' 
            });

          if (roleError) throw roleError;

          return new Response(JSON.stringify({ 
            status: 'success', 
            message: `Usuário ${email} configurado como admin.`,
            userId: user.id
          }), { status: 200 });
          
        } catch (error: any) {
          return new Response(error.message, { status: 500 });
        }
      }
    }
  }
})
