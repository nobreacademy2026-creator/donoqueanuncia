-- Secure the has_role function as recommended by the security linter
-- Revoke execute from public/authenticated/anon and grant only to authorized callers or keep it as security definer but internal
REVOKE EXECUTE ON FUNCTION public.has_role(uuid, app_role) FROM PUBLIC;
REVOKE EXECUTE ON FUNCTION public.has_role(uuid, app_role) FROM authenticated;
REVOKE EXECUTE ON FUNCTION public.has_role(uuid, app_role) FROM anon;

-- The function is SECURITY DEFINER, and we use it inside RLS policies.
-- Policies run with the table owner's permissions or the caller's permissions?
-- Actually, the linter warns that authenticated users can call it directly via RPC.
-- By revoking EXECUTE, we prevent direct RPC calls. 
-- RLS policies owned by the system/admin can still use it.
