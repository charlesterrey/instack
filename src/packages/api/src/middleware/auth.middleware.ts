import type { MiddlewareHandler } from 'hono';
import { getCookie } from 'hono/cookie';
import { verifyJWT } from '../lib/jwt';
import type { AuthContext } from '@instack/shared';

declare module 'hono' {
  interface ContextVariableMap {
    auth: AuthContext;
  }
}

/** Extract and validate JWT from HttpOnly cookie, inject auth context */
export const authMiddleware: MiddlewareHandler = async (c, next) => {
  const token = getCookie(c, 'instack_session');

  if (!token) {
    return c.json({ error: { message: 'Authentication required', status: 401 } }, 401);
  }

  const jwtSecret = (c.env as Record<string, unknown>)['JWT_SECRET'];
  if (typeof jwtSecret !== 'string') {
    return c.json({ error: { message: 'Server configuration error', status: 500 } }, 500);
  }

  const result = await verifyJWT(token, jwtSecret);
  if (!result.ok) {
    return c.json({ error: { message: 'Invalid or expired session', status: 401 } }, 401);
  }

  const auth: AuthContext = {
    userId: result.payload.sub,
    tenantId: result.payload.tid,
    role: result.payload.role,
    email: result.payload.email,
  };

  c.set('auth', auth);
  return next();
};

/** Require admin role */
export const requireAdmin: MiddlewareHandler = async (c, next) => {
  const auth = c.get('auth');
  if (auth.role !== 'admin') {
    return c.json({ error: { message: 'Admin access required', status: 403 } }, 403);
  }
  return next();
};
