-- Revoke EXECUTE from PUBLIC role for the has_role function to fix lint 0028
REVOKE EXECUTE ON FUNCTION public.has_role(uuid, public.app_role) FROM PUBLIC;
-- Re-confirm it's revoked from anon as well specifically
REVOKE EXECUTE ON FUNCTION public.has_role(uuid, public.app_role) FROM anon;
