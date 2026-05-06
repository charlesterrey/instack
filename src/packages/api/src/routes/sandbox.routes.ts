/**
 * Sandbox API endpoints — @FORGE
 *
 * POST /api/sandbox        — Create a new sandbox session (no auth required)
 * GET  /api/sandbox/datasets     — List available demo datasets
 * GET  /api/sandbox/datasets/:id — Get dataset detail with preview
 */

import { Hono } from 'hono';
import { setCookie } from 'hono/cookie';
import { createDb } from '../lib/db';
import { logger } from '../lib/logger';
import {
  createSandboxSession,
  DEMO_DATASETS,
  getDemoData,
} from '../services/sandbox.service';

interface SandboxBindings {
  DATABASE_URL: string;
  JWT_SECRET: string;
  [key: string]: unknown;
}

export const sandboxRoutes = new Hono<{ Bindings: SandboxBindings }>();

// POST /api/sandbox — Create sandbox session (no auth required)
sandboxRoutes.post('/', async (c) => {
  const env = c.env;

  if (typeof env.DATABASE_URL !== 'string' || typeof env.JWT_SECRET !== 'string') {
    return c.json({ error: { message: 'Server configuration error', status: 500 } }, 500);
  }

  const db = createDb(env.DATABASE_URL);
  const result = await createSandboxSession(db, env.JWT_SECRET);

  if (!result.ok) {
    logger.error('sandbox: session creation failed', { error: result.error });
    return c.json({ error: { message: result.error, status: 500 } }, 500);
  }

  const { tenantId, userId, jwt, expiresAt } = result.value;

  // Set JWT as HttpOnly cookie — same settings as auth.routes.ts
  setCookie(c, 'instack_session', jwt, {
    httpOnly: true,
    secure: true,
    sameSite: 'Lax',
    path: '/',
    maxAge: 86400, // 24 hours
  });

  return c.json({
    data: {
      tenantId,
      userId,
      expiresAt: expiresAt.toISOString(),
    },
  });
});

// GET /api/sandbox/datasets — List all demo datasets
sandboxRoutes.get('/datasets', (c) => {
  const datasets = DEMO_DATASETS.map((ds) => ({
    id: ds.id,
    name: ds.name,
    description: ds.description,
    persona: ds.persona,
    suggestedPrompt: ds.suggestedPrompt,
    columnCount: ds.data.headers.length,
    rowCount: ds.data.totalRows,
  }));

  return c.json({ data: datasets });
});

// GET /api/sandbox/datasets/:id — Get dataset detail with preview
sandboxRoutes.get('/datasets/:id', (c) => {
  const datasetId = c.req.param('id');
  const dataset = getDemoData(datasetId);

  if (!dataset) {
    return c.json({ error: { message: 'Dataset not found', status: 404 } }, 404);
  }

  const preview = dataset.data.rows.slice(0, 5);

  return c.json({
    data: {
      id: dataset.id,
      name: dataset.name,
      description: dataset.description,
      persona: dataset.persona,
      suggestedPrompt: dataset.suggestedPrompt,
      columnCount: dataset.data.headers.length,
      rowCount: dataset.data.totalRows,
      headers: dataset.data.headers,
      preview,
    },
  });
});
