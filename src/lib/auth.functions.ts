import { createServerFn } from "@tanstack/react-start";
import { getRequest } from "@tanstack/react-start/server";

export const checkAdminRole = createServerFn({ method: "GET" })
  .handler(async () => {
    try {
      const request = getRequest();
      const authHeader = request.headers.get('Authorization') || request.headers.get('authorization');
      
      if (!authHeader || !authHeader.startsWith('Bearer ')) {
        console.log('[checkAdminRole] No valid auth header');
        return { hasAdmin: false, error: 'No token' };
      }

      const token = authHeader.replace('Bearer ', '');
      
      // Manual JWT decode to get userId
      let userId: string;
      try {
        const payload = JSON.parse(Buffer.from(token.split('.')[1] || '', 'base64').toString());
        userId = payload.sub;
      } catch (e) {
        console.error('[checkAdminRole] JWT decode failed');
        return { hasAdmin: false, error: 'Invalid token format' };
      }

      if (!userId) {
        return { hasAdmin: false, error: 'No userId in token' };
      }

      const { verifyAdminStatus } = await import("./auth-server.server");
      const hasAdmin = await verifyAdminStatus(userId);
      
      return { hasAdmin, userId };
    } catch (error: any) {
      console.error('[checkAdminRole] Critical error:', error);
      return { hasAdmin: false, error: error.message };
    }
  });
