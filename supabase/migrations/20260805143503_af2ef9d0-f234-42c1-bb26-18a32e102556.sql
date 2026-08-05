-- Limit anonymous read of quiz_config to the public funnel content key only
DROP POLICY IF EXISTS "Public read quiz_config" ON public.quiz_config;

CREATE POLICY "Public read funnel content"
ON public.quiz_config
FOR SELECT
TO anon, authenticated
USING (key = 'funnel_content');

-- Restrict who can execute the SECURITY DEFINER role-check helper
REVOKE ALL ON FUNCTION public.has_role(uuid, public.app_role) FROM PUBLIC;
REVOKE ALL ON FUNCTION public.has_role(uuid, public.app_role) FROM anon;
GRANT EXECUTE ON FUNCTION public.has_role(uuid, public.app_role) TO authenticated, service_role;

-- Ensure anonymous visitors cannot read analytics events
REVOKE SELECT ON public.analytics_events FROM anon;
GRANT INSERT ON public.analytics_events TO anon;
GRANT SELECT, INSERT ON public.analytics_events TO authenticated;
GRANT ALL ON public.analytics_events TO service_role;