GRANT SELECT ON public.quiz_config TO anon;
GRANT SELECT ON public.quiz_config TO authenticated;
GRANT INSERT ON public.analytics_events TO anon;
GRANT INSERT ON public.analytics_events TO authenticated;
GRANT ALL ON public.quiz_config TO service_role;
GRANT ALL ON public.analytics_events TO service_role;
GRANT ALL ON public.user_roles TO service_role;
GRANT SELECT ON public.user_roles TO authenticated;
