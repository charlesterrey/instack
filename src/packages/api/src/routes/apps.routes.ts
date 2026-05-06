import { Hono } from 'hono';
import { zValidator } from '@hono/zod-validator';
import {
  createAppSchema,
  updateAppSchema,
  listAppsQuerySchema,
  shareAppSchema,
} from '@instack/shared';
import * as appService from '../services/app.service';
import { logAudit } from '../services/audit.service';

export const appsRoutes = new Hono();

// POST /api/apps — Create an app
appsRoutes.post(
  '/',
  zValidator('json', createAppSchema),
  async (c) => {
    const auth = c.get('auth');
    const db = c.get('db');
    const body = c.req.valid('json');

    const result = await appService.createApp(db, auth, body, 'free');

    if (!result.ok) {
      return c.json({ error: { message: result.error, status: result.status } }, result.status as 403);
    }

    await logAudit(db, auth, {
      action: 'app.created',
      resourceType: 'app',
      resourceId: result.data.id,
      metadata: { name: result.data.name, archetype: result.data.archetype },
    });

    return c.json({ data: result.data }, 201);
  },
);

// GET /api/apps — List apps
appsRoutes.get(
  '/',
  zValidator('query', listAppsQuerySchema),
  async (c) => {
    const auth = c.get('auth');
    const db = c.get('db');
    const query = c.req.valid('query');

    const result = await appService.listApps(db, {
      tenantId: auth.tenantId,
      ...query,
    });

    if (!result.ok) {
      return c.json({ error: { message: result.error, status: result.status } }, result.status as 500);
    }

    return c.json({
      data: result.data.items,
      pagination: {
        page: result.data.page,
        limit: result.data.limit,
        total: result.data.total,
      },
    });
  },
);

// GET /api/apps/:id — Get app detail
appsRoutes.get('/:id', async (c) => {
  const db = c.get('db');
  const appId = c.req.param('id');

  const result = await appService.getApp(db, appId);

  if (!result.ok) {
    return c.json({ error: { message: result.error, status: result.status } }, result.status as 404);
  }

  return c.json({ data: result.data });
});

// PATCH /api/apps/:id — Update app
appsRoutes.patch(
  '/:id',
  zValidator('json', updateAppSchema),
  async (c) => {
    const auth = c.get('auth');
    const db = c.get('db');
    const appId = c.req.param('id');
    const body = c.req.valid('json');

    const result = await appService.updateApp(db, auth, appId, body);

    if (!result.ok) {
      return c.json({ error: { message: result.error, status: result.status } }, result.status as 404);
    }

    await logAudit(db, auth, {
      action: 'app.updated',
      resourceType: 'app',
      resourceId: appId,
      metadata: body,
    });

    return c.json({ data: result.data });
  },
);

// DELETE /api/apps/:id — Archive app (soft delete)
appsRoutes.delete('/:id', async (c) => {
  const auth = c.get('auth');
  const db = c.get('db');
  const appId = c.req.param('id');

  const result = await appService.archiveApp(db, auth, appId);

  if (!result.ok) {
    return c.json({ error: { message: result.error, status: result.status } }, result.status as 404);
  }

  await logAudit(db, auth, {
    action: 'app.archived',
    resourceType: 'app',
    resourceId: appId,
  });

  return c.json({ data: result.data });
});

// POST /api/apps/:id/share — Change visibility
appsRoutes.post(
  '/:id/share',
  zValidator('json', shareAppSchema),
  async (c) => {
    const auth = c.get('auth');
    const db = c.get('db');
    const appId = c.req.param('id');
    const { visibility } = c.req.valid('json');

    // Sandbox users cannot share apps
    if (auth.sandbox) {
      return c.json({ error: { message: 'Sandbox users cannot share apps', status: 403 } }, 403);
    }

    const result = await appService.updateApp(db, auth, appId, { visibility });

    if (!result.ok) {
      return c.json({ error: { message: result.error, status: result.status } }, result.status as 404);
    }

    await logAudit(db, auth, {
      action: 'app.shared',
      resourceType: 'app',
      resourceId: appId,
      metadata: { visibility },
    });

    return c.json({ data: result.data });
  },
);
