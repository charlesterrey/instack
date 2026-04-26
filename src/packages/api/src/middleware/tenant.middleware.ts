import type { MiddlewareHandler } from 'hono';

/** Set RLS session variable for tenant isolation — skeleton for S02 */
export const tenantMiddleware: MiddlewareHandler = async (_c, next) => {
  await next();
};
