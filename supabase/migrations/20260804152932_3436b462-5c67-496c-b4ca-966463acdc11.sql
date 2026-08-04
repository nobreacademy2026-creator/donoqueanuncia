GRANT SELECT ON public.user_roles TO authenticated;
GRANT ALL ON public.user_roles TO service_role;

DO $$ 
BEGIN
    IF EXISTS (SELECT 1 FROM pg_proc WHERE proname = 'has_role') THEN
        CREATE OR REPLACE FUNCTION public.has_role(_user_id uuid, _role app_role)
        RETURNS boolean
        LANGUAGE sql
        STABLE
        SECURITY DEFINER
        SET search_path = public
        AS $func$
          SELECT EXISTS (
            SELECT 1
            FROM public.user_roles
            WHERE user_id = _user_id
              AND role = _role
          )
        $func$;

        GRANT EXECUTE ON FUNCTION public.has_role(uuid, app_role) TO authenticated;
        GRANT EXECUTE ON FUNCTION public.has_role(uuid, app_role) TO service_role;
    END IF;
END $$;
