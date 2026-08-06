import { createServerFn } from "@tanstack/react-start";
import { createClient } from "@supabase/supabase-js";
import { serverSessionMiddleware } from "./auth-middleware.server";

export const checkAdminRole = createServerFn({ method: "GET" })
  .middleware([serverSessionMiddleware])
  .handler(async ({ context }) => {
    try {
      const userId = context?.userId;
      const accessToken = context?.accessToken;
      if (!userId || !accessToken) return { hasAdmin: false, error: "Unauthenticated" };

      const supabaseUrl = process.env["SUPABASE_URL"];
      const publishableKey = process.env["SUPABASE_PUBLISHABLE_KEY"];
      if (!supabaseUrl || !publishableKey) {
        return { hasAdmin: false, error: "Supabase server configuration is missing" };
      }

      const authenticatedClient = createClient(supabaseUrl, publishableKey, {
        global: { headers: { Authorization: `Bearer ${accessToken}` } },
        auth: { persistSession: false, autoRefreshToken: false },
      });
      const { data, error } = await authenticatedClient
        .from("user_roles" as any)
        .select("role")
        .eq("user_id", userId)
        .eq("role", "admin");

      if (error) return { hasAdmin: false, error: error.message };
      return { hasAdmin: data && data.length > 0, userId };
    } catch (error: any) {
      return { hasAdmin: false, error: error.message };
    }
  });
