import { Hono } from 'hono';
import { zValidator } from '@hono/zod-validator';
import { updateTenantSettingsSchema } from '@instack/shared';
import { tenants, users, apps } from '../../drizzle/schema';
import { eq, count, and } from 'drizzle-orm';
import { logAudit } from '../services/audit.service';

export const tenantsRoutes = new Hono();

function isAdmin(c: { get: (key: 'auth') => { role: string } }): boolean {
  return c.get('auth').role === 'admin';
}

// GET /api/tenants/me — Current tenant info
tenantsRoutes.get('/me', async (c) => {
  const auth = c.get('auth');
  const db = c.get('db');

  const rows = await db
    .select({
      id: tenants.id,
      name: tenants.name,
      plan: tenants.plan,
      settings: tenants.settings,
      createdAt: tenants.createdAt,
    })
    .from(tenants)
    .where(eq(tenants.id, auth.tenantId))
    .limit(1);

  const tenant = rows[0];
  if (!tenant) {
    return c.json({ error: { message: 'Tenant not found', status: 404 } }, 404);
  }

  return c.json({ data: tenant });
});

// PATCH /api/tenants/me — Update tenant settings (admin only)
tenantsRoutes.patch(
  '/me',
  zValidator('json', updateTenantSettingsSchema),
  async (c) => {
    if (!isAdmin(c)) {
      return c.json({ error: { message: 'Admin access required', status: 403 } }, 403);
    }

    const auth = c.get('auth');
    const db = c.get('db');
    const settings = c.req.valid('json');

    const existing = await db
      .select({ settings: tenants.settings })
      .from(tenants)
      .where(eq(tenants.id, auth.tenantId))
      .limit(1);

    const currentSettings = (existing[0]?.settings ?? {}) as Record<string, unknown>;
    const merged = { ...currentSettings, ...settings };

    const rows = await db
      .update(tenants)
      .set({ settings: merged, updatedAt: new Date() })
      .where(eq(tenants.id, auth.tenantId))
      .returning();

    const updated = rows[0];
    if (!updated) {
      return c.json({ error: { message: 'Tenant not found', status: 404 } }, 404);
    }

    await logAudit(db, auth, {
      action: 'tenant.settings_updated',
      resourceType: 'tenant',
      resourceId: auth.tenantId,
      metadata: settings,
    });

    return c.json({ data: updated });
  },
);

// GET /api/tenants/me/stats — Quick stats
tenantsRoutes.get('/me/stats', async (c) => {
  const auth = c.get('auth');
  const db = c.get('db');

  const [appCount, userCount, activeAppCount] = await Promise.all([
    db.select({ count: count() }).from(apps).where(eq(apps.tenantId, auth.tenantId)),
    db.select({ count: count() }).from(users).where(eq(users.tenantId, auth.tenantId)),
    db.select({ count: count() }).from(apps).where(
      and(eq(apps.tenantId, auth.tenantId), eq(apps.status, 'active')),
    ),
  ]);

  return c.json({
    data: {
      totalApps: appCount[0]?.count ?? 0,
      totalUsers: userCount[0]?.count ?? 0,
      activeApps: activeAppCount[0]?.count ?? 0,
    },
  });
});
