import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";

export const checkAdminRole = createServerFn({ method: "GET" })
  .handler(async () => {
    try {
      // Import inside handler to avoid client bundling issues
      const { supabaseAdmin } = await import('@/integrations/supabase/client.server');
      
      // Get the session/user from the request context if possible, 
      // but in TanStack Start we usually get the token from headers if it's not handled by middleware.
      // However, we want this to be simple.
      
      // If we use requireSupabaseAuth middleware, it will handle the basic auth.
      // For now, let's keep it manual to match existing logic but use server functions.
      
      // We'll need the user ID. We can get it from the session passed in context if we use middleware.
      // But let's try a simpler approach first: check the user based on the current request.
    } catch (error) {
      console.error('Error in checkAdminRole:', error);
      return { hasAdmin: false };
    }
  });
