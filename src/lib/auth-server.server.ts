import { supabaseAdmin } from "@/integrations/supabase/client.server";

export async function verifyAdminStatus(userId: string): Promise<boolean> {
  try {
    if (!userId) return false;
    
    console.log(`[verifyAdminStatus] Checking role for ${userId}`);
    
    const { data, error } = await supabaseAdmin
      .from('user_roles' as any)
      .select('role')
      .eq('user_id', userId)
      .eq('role', 'admin');

    if (error) {
      console.error('[verifyAdminStatus] DB error:', error);
      return false;
    }

    const isAdmin = data && data.length > 0;
    console.log(`[verifyAdminStatus] Result for ${userId}: ${isAdmin}`);
    return isAdmin;
  } catch (err) {
    console.error('[verifyAdminStatus] Catch error:', err);
    return false;
  }
}
