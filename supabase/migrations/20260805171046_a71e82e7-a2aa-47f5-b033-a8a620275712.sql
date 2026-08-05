-- Setting up policies for the already created funnel-media bucket
DROP POLICY IF EXISTS "Public can view funnel media" ON storage.objects;
CREATE POLICY "Public can view funnel media"
ON storage.objects FOR SELECT
TO public
USING (bucket_id = 'funnel-media');

DROP POLICY IF EXISTS "Admins can upload funnel media" ON storage.objects;
CREATE POLICY "Admins can upload funnel media"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (
  bucket_id = 'funnel-media'
  AND (public.has_role(auth.uid(), 'admin'::public.app_role))
);

DROP POLICY IF EXISTS "Admins can update funnel media" ON storage.objects;
CREATE POLICY "Admins can update funnel media"
ON storage.objects FOR UPDATE
TO authenticated
USING (
  bucket_id = 'funnel-media'
  AND (public.has_role(auth.uid(), 'admin'::public.app_role))
)
WITH CHECK (
  bucket_id = 'funnel-media'
  AND (public.has_role(auth.uid(), 'admin'::public.app_role))
);
