import type { MiddlewareHandler } from 'hono';

/** JWT validation middleware — skeleton for S02 */
export const authMiddleware: MiddlewareHandler = async (_c, next) => {
  await next();
};
