CREATE SCHEMA IF NOT EXISTS private;

CREATE OR REPLACE FUNCTION private.has_role(_user_id uuid, _role public.app_role)
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  select exists (
    select 1 from public.user_roles
    where user_id = _user_id and role = _role
  )
$$;

REVOKE ALL ON FUNCTION private.has_role(uuid, public.app_role) FROM PUBLIC;
GRANT USAGE ON SCHEMA private TO authenticated, service_role;
GRANT EXECUTE ON FUNCTION private.has_role(uuid, public.app_role) TO authenticated, service_role;

DROP POLICY IF EXISTS "Admins can manage quiz_config" ON public.quiz_config;
DROP POLICY IF EXISTS "Admins can manage all config" ON public.quiz_config;
DROP POLICY IF EXISTS "Admins can view events" ON public.analytics_events;
DROP POLICY IF EXISTS "Admins can select all events" ON public.analytics_events;
DROP POLICY IF EXISTS "Admins can upload funnel media" ON storage.objects;
DROP POLICY IF EXISTS "Admins can update funnel media" ON storage.objects;
DROP POLICY IF EXISTS "Admins can delete funnel media" ON storage.objects;

CREATE POLICY "Admins can manage all config" ON public.quiz_config
  FOR ALL TO authenticated
  USING (private.has_role(auth.uid(), 'admin'::public.app_role))
  WITH CHECK (private.has_role(auth.uid(), 'admin'::public.app_role));

CREATE POLICY "Admins can select all events" ON public.analytics_events
  FOR SELECT TO authenticated
  USING (private.has_role(auth.uid(), 'admin'::public.app_role));

CREATE POLICY "Admins can upload funnel media" ON storage.objects
  FOR INSERT TO authenticated
  WITH CHECK (bucket_id = 'funnel-media' AND private.has_role(auth.uid(), 'admin'::public.app_role));

CREATE POLICY "Admins can update funnel media" ON storage.objects
  FOR UPDATE TO authenticated
  USING (bucket_id = 'funnel-media' AND private.has_role(auth.uid(), 'admin'::public.app_role))
  WITH CHECK (bucket_id = 'funnel-media' AND private.has_role(auth.uid(), 'admin'::public.app_role));

CREATE POLICY "Admins can delete funnel media" ON storage.objects
  FOR DELETE TO authenticated
  USING (bucket_id = 'funnel-media' AND private.has_role(auth.uid(), 'admin'::public.app_role));

DROP FUNCTION IF EXISTS public.has_role(uuid, public.app_role);