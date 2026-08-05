-- RLS policies execute has_role() as the authenticated user.
GRANT EXECUTE ON FUNCTION public.has_role(uuid, public.app_role) TO authenticated;

-- Enable INSERT notifications so the admin funnel updates without simulated data.
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1
    FROM pg_publication_tables
    WHERE pubname = 'supabase_realtime'
      AND schemaname = 'public'
      AND tablename = 'analytics_events'
  ) THEN
    ALTER PUBLICATION supabase_realtime ADD TABLE public.analytics_events;
  END IF;
END
$$;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1
    FROM pg_publication_tables
    WHERE pubname = 'supabase_realtime'
      AND schemaname = 'public'
      AND tablename = 'quiz_config'
  ) THEN
    ALTER PUBLICATION supabase_realtime ADD TABLE public.quiz_config;
  END IF;
END
$$;
