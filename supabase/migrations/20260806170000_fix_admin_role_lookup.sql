-- Authenticated users need EXECUTE because RLS policies call has_role().
GRANT EXECUTE ON FUNCTION public.has_role(uuid, public.app_role) TO authenticated;
GRANT EXECUTE ON FUNCTION public.has_role(uuid, public.app_role) TO service_role;

-- Avoid evaluating has_role() while a user is reading their own role.
-- The self-read policy below is sufficient for client-side admin verification.
DROP POLICY IF EXISTS "Admins can view all roles" ON public.user_roles;

DROP POLICY IF EXISTS "Users can view their own roles" ON public.user_roles;
CREATE POLICY "Users can view their own roles"
ON public.user_roles
FOR SELECT
TO authenticated
USING ((SELECT auth.uid()) = user_id);
