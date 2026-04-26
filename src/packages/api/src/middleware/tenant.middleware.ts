import type { MiddlewareHandler } from 'hono';
import { createDb } from '../lib/db';
import { sql } from 'drizzle-orm';

declare module 'hono' {
  interface ContextVariableMap {
    db: ReturnType<typeof createDb>;
  }
}

/** Create DB connection and set RLS session variable for tenant isolation */
export const tenantMiddleware: MiddlewareHandler = async (c, next) => {
  const auth = c.get('auth');
  const dbUrl = (c.env as Record<string, unknown>)['DATABASE_URL'];

  if (typeof dbUrl !== 'string') {
    return c.json({ error: { message: 'Database not configured', status: 500 } }, 500);
  }

  const db = createDb(dbUrl);

  // Set the tenant_id for RLS policies on every query
  await db.execute(sql`SELECT set_config('app.current_tenant_id', ${auth.tenantId}, true)`);

  c.set('db', db);
  return next();
};
