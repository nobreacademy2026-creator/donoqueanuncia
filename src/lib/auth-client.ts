import { supabase } from "@/integrations/supabase/client";

export async function checkCurrentUserAdmin() {
  const { data: userData, error: userError } = await supabase.auth.getUser();
  const user = userData.user;

  if (userError || !user) {
    return { hasAdmin: false, error: userError?.message || "Sessão não encontrada." };
  }

  const { data, error } = await supabase
    .from("user_roles")
    .select("role")
    .eq("user_id", user.id)
    .eq("role", "admin")
    .maybeSingle();

  if (error) return { hasAdmin: false, error: error.message, userId: user.id };
  return { hasAdmin: data?.role === "admin", userId: user.id };
}
