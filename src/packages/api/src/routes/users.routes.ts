import { Hono } from 'hono';
import { zValidator } from '@hono/zod-validator';
import { updateUserRoleSchema } from '@instack/shared';
import { users } from '../../drizzle/schema';
import { eq } from 'drizzle-orm';
import { logAudit } from '../services/audit.service';

export const usersRoutes = new Hono();

function isAdmin(c: { get: (key: 'auth') => { role: string } }): boolean {
  return c.get('auth').role === 'admin';
}

// GET /api/users/me — Current user profile
usersRoutes.get('/me', async (c) => {
  const auth = c.get('auth');
  const db = c.get('db');

  const rows = await db
    .select({
      id: users.id,
      tenantId: users.tenantId,
      email: users.email,
      name: users.name,
      role: users.role,
      lastActiveAt: users.lastActiveAt,
      createdAt: users.createdAt,
    })
    .from(users)
    .where(eq(users.id, auth.userId))
    .limit(1);

  const user = rows[0];
  if (!user) {
    return c.json({ error: { message: 'User not found', status: 404 } }, 404);
  }

  return c.json({ data: user });
});

// GET /api/users — List tenant users (admin only)
usersRoutes.get('/', async (c) => {
  if (!isAdmin(c)) {
    return c.json({ error: { message: 'Admin access required', status: 403 } }, 403);
  }

  const db = c.get('db');

  const rows = await db
    .select({
      id: users.id,
      email: users.email,
      name: users.name,
      role: users.role,
      lastActiveAt: users.lastActiveAt,
      createdAt: users.createdAt,
    })
    .from(users);

  return c.json({ data: rows });
});

// PATCH /api/users/:id/role — Change user role (admin only)
usersRoutes.patch(
  '/:id/role',
  zValidator('json', updateUserRoleSchema),
  async (c) => {
    if (!isAdmin(c)) {
      return c.json({ error: { message: 'Admin access required', status: 403 } }, 403);
    }

    const auth = c.get('auth');
    const db = c.get('db');
    const userId = c.req.param('id');
    const { role } = c.req.valid('json');

    // Prevent demoting yourself
    if (userId === auth.userId) {
      return c.json({ error: { message: 'Cannot change your own role', status: 400 } }, 400);
    }

    const rows = await db
      .update(users)
      .set({ role })
      .where(eq(users.id, userId))
      .returning({ id: users.id, role: users.role });

    const updated = rows[0];
    if (!updated) {
      return c.json({ error: { message: 'User not found', status: 404 } }, 404);
    }

    await logAudit(db, auth, {
      action: 'user.role_changed',
      resourceType: 'user',
      resourceId: userId,
      metadata: { newRole: role },
    });

    return c.json({ data: updated });
  },
);
