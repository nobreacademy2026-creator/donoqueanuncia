GRANT ALL ON public.quiz_config TO authenticated;
GRANT ALL ON public.quiz_config TO service_role;

DO $$ 
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_policies 
        WHERE tablename = 'quiz_config' AND policyname = 'Admins can manage all config'
    ) THEN
        CREATE POLICY "Admins can manage all config"
        ON public.quiz_config
        FOR ALL
        TO authenticated
        USING (public.has_role(auth.uid(), 'admin'));
    END IF;
END $$;