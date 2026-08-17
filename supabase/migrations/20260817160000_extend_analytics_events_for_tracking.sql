-- Extend the existing event store with structured attribution and delivery metadata.
-- This migration is additive and keeps the legacy payload column for compatibility.
ALTER TABLE public.analytics_events
  ADD COLUMN IF NOT EXISTS event_id text,
  ADD COLUMN IF NOT EXISTS page_url text,
  ADD COLUMN IF NOT EXISTS page_title text,
  ADD COLUMN IF NOT EXISTS referrer text,
  ADD COLUMN IF NOT EXISTS value numeric(14, 2),
  ADD COLUMN IF NOT EXISTS currency text,
  ADD COLUMN IF NOT EXISTS source text,
  ADD COLUMN IF NOT EXISTS campaign text,
  ADD COLUMN IF NOT EXISTS ad_set text,
  ADD COLUMN IF NOT EXISTS ad text,
  ADD COLUMN IF NOT EXISTS utm_source text,
  ADD COLUMN IF NOT EXISTS utm_medium text,
  ADD COLUMN IF NOT EXISTS utm_campaign text,
  ADD COLUMN IF NOT EXISTS utm_content text,
  ADD COLUMN IF NOT EXISTS utm_term text,
  ADD COLUMN IF NOT EXISTS fbclid text,
  ADD COLUMN IF NOT EXISTS fbp text,
  ADD COLUMN IF NOT EXISTS fbc text,
  ADD COLUMN IF NOT EXISTS client_name text,
  ADD COLUMN IF NOT EXISTS lead_status text,
  ADD COLUMN IF NOT EXISTS meta_pixel_status text NOT NULL DEFAULT 'not_sent',
  ADD COLUMN IF NOT EXISTS meta_api_status text NOT NULL DEFAULT 'not_sent',
  ADD COLUMN IF NOT EXISTS meta_error text,
  ADD COLUMN IF NOT EXISTS is_test boolean NOT NULL DEFAULT false;

CREATE UNIQUE INDEX IF NOT EXISTS analytics_events_event_id_uidx
  ON public.analytics_events (event_id)
  WHERE event_id IS NOT NULL;

CREATE INDEX IF NOT EXISTS analytics_events_created_at_idx
  ON public.analytics_events (created_at DESC);

CREATE INDEX IF NOT EXISTS analytics_events_event_name_created_at_idx
  ON public.analytics_events (event_name, created_at DESC);

CREATE INDEX IF NOT EXISTS analytics_events_attribution_idx
  ON public.analytics_events (utm_campaign, ad_set, ad)
  WHERE utm_campaign IS NOT NULL OR ad_set IS NOT NULL OR ad IS NOT NULL;

CREATE OR REPLACE FUNCTION public.record_tracking_event(p_event jsonb)
RETURNS uuid
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, pg_temp
AS $$
DECLARE
  inserted_id uuid;
  safe_event_name text;
  safe_event_id text;
  safe_value numeric(14, 2);
  safe_is_test boolean;
BEGIN
  safe_event_name := left(trim(coalesce(p_event->>'event_name', '')), 120);
  IF safe_event_name = '' OR safe_event_name !~ '^[A-Za-z0-9_.:-]{1,120}$' THEN
    RAISE EXCEPTION 'invalid event name';
  END IF;

  safe_event_id := nullif(left(trim(coalesce(p_event->>'event_id', '')), 120), '');
  IF safe_event_id IS NOT NULL AND safe_event_id !~ '^[A-Za-z0-9_-]{8,120}$' THEN
    RAISE EXCEPTION 'invalid event id';
  END IF;

  IF jsonb_typeof(p_event->'value') = 'number' THEN
    safe_value := greatest(0, least((p_event->>'value')::numeric, 999999999999.99));
  END IF;

  safe_is_test := coalesce((p_event->>'is_test')::boolean, false)
    AND auth.uid() IS NOT NULL
    AND private.has_role(auth.uid(), 'admin'::public.app_role);

  INSERT INTO public.analytics_events (
    event_name, payload, user_id, session_id, event_id, page_url, page_title, referrer,
    value, currency, source, campaign, ad_set, ad, utm_source, utm_medium,
    utm_campaign, utm_content, utm_term, fbclid, fbp, fbc, client_name, lead_status,
    meta_pixel_status, meta_api_status, meta_error, is_test
  ) VALUES (
    safe_event_name,
    CASE WHEN jsonb_typeof(p_event->'payload') = 'object' THEN p_event->'payload' ELSE '{}'::jsonb END,
    auth.uid(),
    nullif(left(coalesce(p_event->>'session_id', ''), 100), ''),
    safe_event_id,
    nullif(left(coalesce(p_event->>'page_url', ''), 2048), ''),
    nullif(left(coalesce(p_event->>'page_title', ''), 500), ''),
    nullif(left(coalesce(p_event->>'referrer', ''), 2048), ''),
    safe_value,
    CASE WHEN upper(coalesce(p_event->>'currency', '')) ~ '^[A-Z]{3}$'
      THEN upper(p_event->>'currency') ELSE NULL END,
    nullif(left(coalesce(p_event->>'source', ''), 255), ''),
    nullif(left(coalesce(p_event->>'campaign', ''), 255), ''),
    nullif(left(coalesce(p_event->>'ad_set', ''), 255), ''),
    nullif(left(coalesce(p_event->>'ad', ''), 255), ''),
    nullif(left(coalesce(p_event->>'utm_source', ''), 255), ''),
    nullif(left(coalesce(p_event->>'utm_medium', ''), 255), ''),
    nullif(left(coalesce(p_event->>'utm_campaign', ''), 255), ''),
    nullif(left(coalesce(p_event->>'utm_content', ''), 255), ''),
    nullif(left(coalesce(p_event->>'utm_term', ''), 255), ''),
    nullif(left(coalesce(p_event->>'fbclid', ''), 500), ''),
    nullif(left(coalesce(p_event->>'fbp', ''), 255), ''),
    nullif(left(coalesce(p_event->>'fbc', ''), 255), ''),
    nullif(left(coalesce(p_event->>'client_name', ''), 255), ''),
    nullif(left(coalesce(p_event->>'lead_status', ''), 80), ''),
    CASE WHEN p_event->>'meta_pixel_status' IN ('sent', 'pending', 'error', 'not_sent')
      THEN p_event->>'meta_pixel_status' ELSE 'not_sent' END,
    CASE WHEN p_event->>'meta_api_status' IN ('sent', 'pending', 'error', 'not_sent')
      THEN p_event->>'meta_api_status' ELSE 'not_sent' END,
    nullif(left(coalesce(p_event->>'meta_error', ''), 500), ''),
    safe_is_test
  )
  ON CONFLICT (event_id) WHERE event_id IS NOT NULL DO NOTHING
  RETURNING id INTO inserted_id;

  RETURN inserted_id;
END;
$$;

REVOKE ALL ON FUNCTION public.record_tracking_event(jsonb) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.record_tracking_event(jsonb) TO anon, authenticated, service_role;
REVOKE INSERT ON public.analytics_events FROM anon, authenticated;
GRANT SELECT ON public.analytics_events TO authenticated;
GRANT ALL ON public.analytics_events TO service_role;
