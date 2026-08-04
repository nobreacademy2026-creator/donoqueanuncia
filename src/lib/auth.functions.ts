import { createServerFn } from "@tanstack/react-start";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";

export const checkAdminRole = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    const { verifyAdminStatus } = await import("./auth-server.server");
    const hasAdmin = await verifyAdminStatus(context.userId);
    return { hasAdmin };
  });
