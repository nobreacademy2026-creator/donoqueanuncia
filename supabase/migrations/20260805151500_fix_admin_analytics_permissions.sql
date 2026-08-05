-- Keep analytics readable only by authorized administrators.
-- The initial migrations revoked EXECUTE from authenticated while the RLS
-- policies still depend on has_role(), which makes admin reads fail with 42501.

GRANT SELECT, INSERT ON public.analytics_events TO authenticated;
GRANT INSERT ON public.analytics_events TO anon;
GRANT EXECUTE ON FUNCTION public.has_role(uuid, public.app_role) TO authenticated;
GRANT EXECUTE ON FUNCTION public.has_role(uuid, public.app_role) TO service_role;

DROP POLICY IF EXISTS "Admins can view events" ON public.analytics_events;
CREATE POLICY "Admins can view events"
ON public.analytics_events
FOR SELECT
TO authenticated
USING ((select public.has_role((select auth.uid()), 'admin'::public.app_role)));
