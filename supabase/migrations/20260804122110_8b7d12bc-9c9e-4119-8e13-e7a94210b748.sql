
-- Revoke all execute from public and authenticated for the security definer function
REVOKE ALL ON FUNCTION public.has_role(UUID, app_role) FROM PUBLIC;
REVOKE ALL ON FUNCTION public.has_role(UUID, app_role) FROM authenticated;

-- Grant execute only to service_role (it's called from RLS policies which run as current user, but the function itself is SECURITY DEFINER)
-- Wait, actually the current user needs to be able to execute it to use it in policies!
-- But we should ensure it's not called directly via API.
-- Supabase docs say: "Revoke EXECUTE from the public role"
GRANT EXECUTE ON FUNCTION public.has_role(UUID, app_role) TO authenticated;
GRANT EXECUTE ON FUNCTION public.has_role(UUID, app_role) TO service_role;

-- The lint 0008 says RLS enabled but no policy for user_roles.
-- Let's add a policy for user_roles so users can see their own roles.
CREATE POLICY "Users can view their own roles" ON public.user_roles
FOR SELECT TO authenticated
USING (auth.uid() = user_id);

CREATE POLICY "Admins can view all roles" ON public.user_roles
FOR SELECT TO authenticated
USING (public.has_role(auth.uid(), 'admin'));
