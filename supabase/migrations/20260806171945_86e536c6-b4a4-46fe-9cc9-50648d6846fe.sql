DROP POLICY IF EXISTS "Anyone can insert events" ON public.analytics_events;

CREATE POLICY "Anyone can insert own events"
ON public.analytics_events
FOR INSERT
TO anon, authenticated
WITH CHECK (
  user_id IS NULL OR user_id = (SELECT auth.uid())
);

DROP POLICY IF EXISTS "Admins can delete funnel media" ON storage.objects;

CREATE POLICY "Admins can delete funnel media"
ON storage.objects
FOR DELETE
TO authenticated
USING (bucket_id = 'funnel-media' AND public.has_role(auth.uid(), 'admin'::public.app_role));