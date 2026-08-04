import { createMiddleware } from '@tanstack/react-start';
import { getRequest } from '@tanstack/react-start/server';

export const serverSessionMiddleware = createMiddleware({ type: 'function' }).server(
  async ({ next }) => {
    const request = getRequest();
    const authHeader = request.headers.get('Authorization') || request.headers.get('authorization');

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return next({ context: { userId: null } });
    }

    const token = authHeader.replace('Bearer ', '');
    try {
      const payload = JSON.parse(Buffer.from(token.split('.')[1] || '', 'base64').toString());
      return next({ context: { userId: payload.sub } });
    } catch (e) {
      return next({ context: { userId: null } });
    }
  }
);
