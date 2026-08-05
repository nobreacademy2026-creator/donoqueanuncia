import { createMiddleware } from '@tanstack/react-start';
import { getRequest } from '@tanstack/react-start/server';
import { createClient } from '@supabase/supabase-js';

export const serverSessionMiddleware = createMiddleware({ type: 'function' }).server(
  async ({ next }) => {
    const request = getRequest();
    const authHeader = request.headers.get('Authorization') || request.headers.get('authorization');

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return next({ context: { userId: null } });
    }

    const token = authHeader.replace('Bearer ', '');
    const SUPABASE_URL = process.env['SUPABASE_URL'];
    const SUPABASE_PUBLISHABLE_KEY = process.env['SUPABASE_PUBLISHABLE_KEY'];

    if (!token || !SUPABASE_URL || !SUPABASE_PUBLISHABLE_KEY) {
      return next({ context: { userId: null } });
    }

    try {
      // Cryptographically verify the token with Supabase Auth before trusting any claim.
      const supabase = createClient(SUPABASE_URL, SUPABASE_PUBLISHABLE_KEY, {
        auth: { storage: undefined, persistSession: false, autoRefreshToken: false },
      });
      const { data, error } = await supabase.auth.getUser(token);
      if (error || !data?.user?.id) {
        return next({ context: { userId: null } });
      }
      return next({ context: { userId: data.user.id } });
    } catch {
      return next({ context: { userId: null } });
    }
  }
);
