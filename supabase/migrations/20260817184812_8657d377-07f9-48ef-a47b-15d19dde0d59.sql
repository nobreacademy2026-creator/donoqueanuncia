ALTER TABLE public.analytics_events
  ADD COLUMN IF NOT EXISTS event_id text,
  ADD COLUMN IF NOT EXISTS page_url text,
  ADD COLUMN IF NOT EXISTS page_title text,
  ADD COLUMN IF NOT EXISTS referrer text,
  ADD COLUMN IF NOT EXISTS value numeric,
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
  ADD COLUMN IF NOT EXISTS meta_pixel_status text,
  ADD COLUMN IF NOT EXISTS meta_api_status text,
  ADD COLUMN IF NOT EXISTS meta_error text,
  ADD COLUMN IF NOT EXISTS is_test boolean NOT NULL DEFAULT false;

CREATE OR REPLACE FUNCTION public.record_tracking_event(p_event jsonb)
RETURNS void
LANGUAGE plpgsql
SET search_path = public
AS $$
BEGIN
  INSERT INTO public.analytics_events (
    event_name, payload, session_id, user_id, event_id, page_url, page_title, referrer,
    value, currency, source, campaign, ad_set, ad, utm_source, utm_medium, utm_campaign,
    utm_content, utm_term, fbclid, fbp, fbc, client_name, lead_status,
    meta_pixel_status, meta_api_status, meta_error, is_test
  ) VALUES (
    left(coalesce(p_event->>'event_name', 'unknown'), 120),
    coalesce(p_event->'payload', '{}'::jsonb),
    left(p_event->>'session_id', 200),
    auth.uid(),
    left(p_event->>'event_id', 200),
    left(p_event->>'page_url', 2048),
    left(p_event->>'page_title', 500),
    left(p_event->>'referrer', 2048),
    nullif(p_event->>'value','')::numeric,
    left(p_event->>'currency', 8),
    left(p_event->>'source', 255),
    left(p_event->>'campaign', 255),
    left(p_event->>'ad_set', 255),
    left(p_event->>'ad', 255),
    left(p_event->>'utm_source', 255),
    left(p_event->>'utm_medium', 255),
    left(p_event->>'utm_campaign', 255),
    left(p_event->>'utm_content', 255),
    left(p_event->>'utm_term', 255),
    left(p_event->>'fbclid', 500),
    left(p_event->>'fbp', 500),
    left(p_event->>'fbc', 500),
    left(p_event->>'client_name', 255),
    left(p_event->>'lead_status', 80),
    left(p_event->>'meta_pixel_status', 40),
    left(p_event->>'meta_api_status', 40),
    left(p_event->>'meta_error', 500),
    coalesce((p_event->>'is_test')::boolean, false)
  );
END;
$$;

REVOKE ALL ON FUNCTION public.record_tracking_event(jsonb) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.record_tracking_event(jsonb) TO anon, authenticated;