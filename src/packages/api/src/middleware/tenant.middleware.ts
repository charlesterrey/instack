import type { MiddlewareHandler } from 'hono';
import { createDb } from '../lib/db';
import { sql } from 'drizzle-orm';
import { logger } from '../lib/logger';

declare module 'hono' {
  interface ContextVariableMap {
    db: ReturnType<typeof createDb>;
    tenantId: string;
  }
}

/**
 * Create DB connection and set RLS session variable for tenant isolation.
 * The SET LOCAL is deferred — the DB client is created eagerly but the
 * RLS config is set on first actual DB call via a wrapper.
 */
export const tenantMiddleware: MiddlewareHandler = async (c, next) => {
  const auth = c.get('auth');
  const dbUrl = (c.env as Record<string, unknown>)['DATABASE_URL'];

  if (typeof dbUrl !== 'string') {
    return c.json({ error: { message: 'Database not configured', status: 500 } }, 500);
  }

  let db: ReturnType<typeof createDb>;
  try {
    db = createDb(dbUrl);
  } catch (err) {
    logger.error('Database client creation failed', {
      message: err instanceof Error ? err.message : String(err),
    });
    return c.json({ error: { message: 'Database unavailable', status: 503 } }, 503);
  }

  // Store db and tenantId — the SET LOCAL happens when the route handler uses the db
  c.set('db', db);
  c.set('tenantId', auth.tenantId);

  // Execute SET LOCAL before passing to route handlers
  try {
    await db.execute(sql`SELECT set_config('app.current_tenant_id', ${auth.tenantId}, true)`);
  } catch (err) {
    logger.error('RLS setup failed', {
      path: c.req.path,
      message: err instanceof Error ? err.message : String(err),
    });
    return c.json({ error: { message: 'Database unavailable', status: 503 } }, 503);
  }

  return next();
};
