-- Restoring all necessary GRANTS for the public schema tables
-- This is critical for Supabase Data API (PostgREST) to access the tables

-- 1. quiz_config
GRANT SELECT ON public.quiz_config TO anon, authenticated;
GRANT ALL ON public.quiz_config TO service_role;
GRANT INSERT, UPDATE, DELETE ON public.quiz_config TO authenticated;

-- 2. analytics_events
GRANT INSERT ON public.analytics_events TO anon, authenticated;
GRANT SELECT ON public.analytics_events TO authenticated;
GRANT ALL ON public.analytics_events TO service_role;

-- 3. user_roles
-- user_roles is auth-only and read by the has_role security-definer function
GRANT SELECT ON public.user_roles TO authenticated;
GRANT ALL ON public.user_roles TO service_role;

-- 4. Re-enable RLS just to be sure
ALTER TABLE public.quiz_config ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.analytics_events ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;

-- 5. Ensure the admin user exists (redundant but safe)
-- The user_id 25a4a73a-3b54-4f73-98d4-e2c032066d6c was found in previous check
INSERT INTO public.user_roles (user_id, role)
VALUES ('25a4a73a-3b54-4f73-98d4-e2c032066d6c', 'admin')
ON CONFLICT (user_id, role) DO NOTHING;
