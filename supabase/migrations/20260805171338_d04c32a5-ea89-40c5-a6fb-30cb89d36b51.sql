-- Restore missing GRANTS for all roles on required tables
GRANT SELECT, INSERT, UPDATE, DELETE ON public.quiz_config TO authenticated;
GRANT SELECT ON public.quiz_config TO anon;
GRANT ALL ON public.quiz_config TO service_role;

GRANT SELECT, INSERT, UPDATE, DELETE ON public.analytics_events TO authenticated;
GRANT INSERT ON public.analytics_events TO anon;
GRANT ALL ON public.analytics_events TO service_role;

GRANT SELECT ON public.user_roles TO authenticated;
GRANT ALL ON public.user_roles TO service_role;

-- Re-verify RLS is enabled correctly
ALTER TABLE public.quiz_config ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.analytics_events ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;
