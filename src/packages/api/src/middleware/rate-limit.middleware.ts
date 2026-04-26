import type { MiddlewareHandler } from 'hono';

/** Basic rate limiter — skeleton for S02 */
export const rateLimitMiddleware: MiddlewareHandler = async (_c, next) => {
  await next();
};
