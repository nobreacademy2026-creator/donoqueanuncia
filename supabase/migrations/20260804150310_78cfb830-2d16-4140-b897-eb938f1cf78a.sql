-- Adiciona o usuário como admin
INSERT INTO public.user_roles (user_id, role) 
VALUES ('25a4a73a-3b54-4f73-98d4-e2c032066d6c', 'admin')
ON CONFLICT (user_id, role) DO NOTHING;