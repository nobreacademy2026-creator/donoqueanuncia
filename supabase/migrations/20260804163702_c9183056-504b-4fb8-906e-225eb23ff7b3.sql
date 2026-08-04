GRANT SELECT ON public.quiz_config TO anon;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.quiz_config TO authenticated;
GRANT ALL ON public.quiz_config TO service_role;
CREATE UNIQUE INDEX IF NOT EXISTS quiz_config_key_uidx ON public.quiz_config (key);