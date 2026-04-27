/**
 * Data Sources routes — CRUD operations for data sources + OneDrive browsing.
 * All Graph API calls go through the token proxy. OAuth tokens are NEVER exposed.
 *
 * Endpoints:
 *   POST   /                  — Connect a data source
 *   GET    /                  — List my data sources
 *   GET    /:id               — Get data source detail
 *   POST   /:id/sync          — Force re-sync
 *   DELETE /:id               — Disconnect (soft delete)
 *   GET    /browse/drives      — List drives via Graph API
 *   GET    /browse/files       — Browse files in a drive
 *   GET    /files              — List Excel files from OneDrive
 *   GET    /files/:id/preview  — Preview Excel file content
 *
 * @module data-sources.routes
 * @agent @CONDUIT — Integration Engineer
 */

import { Hono } from 'hono';
import { z } from 'zod';
import { zValidator } from '@hono/zod-validator';
import { eq, and } from 'drizzle-orm';
import * as schema from '../../drizzle/schema';
import { listDriveFiles, getExcelContent } from '../services/graph-api.service';
import { proxyGraphCall } from '../services/token-proxy.service';
import { logAudit } from '../services/audit.service';
import { syncDataSource } from '../services/sync-engine.service';
import type { ProxyCallFn } from '../services/graph-api.service';

export const dataSourcesRoutes = new Hono();

// ---------------------------------------------------------------------------
// Zod Schemas
// ---------------------------------------------------------------------------

const connectDataSourceSchema = z.object({
  type: z.enum(['excel_file', 'sharepoint_list']),
  m365ResourceId: z.string().min(1),
  name: z.string().min(1).max(255),
  appId: z.string().uuid().optional(),
  sheetName: z.string().optional(),
});

const listDataSourcesQuerySchema = z.object({
  appId: z.string().uuid().optional(),
  type: z.enum(['excel_file', 'sharepoint_list', 'demo_data']).optional(),
  syncStatus: z.enum(['pending', 'syncing', 'synced', 'error', 'disconnected']).optional(),
});

const browseFilesQuerySchema = z.object({
  driveId: z.string().min(1),
  path: z.string().default('/'),
});

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

/**
 * Build a bound proxy call function from the Hono context.
 * This wraps proxyGraphCall so Graph API service functions never see raw tokens.
 */
function buildProxyCallFn(c: { get: (key: string) => unknown; env: unknown }): ProxyCallFn {
  const auth = c.get('auth') as { userId: string; tenantId: string; role: string; email: string };
  const db = c.get('db') as Parameters<typeof proxyGraphCall>[0]['db'];
  const env = c.env as Record<string, string>;

  return async (endpoint: string, method: 'GET' | 'POST', body?: unknown) => {
    const result = await proxyGraphCall({
      userId: auth.userId,
      endpoint,
      method,
      body,
      db,
      encryptionKey: env['TOKEN_ENCRYPTION_KEY'] ?? '',
      oauthConfig: {
        clientId: env['MICROSOFT_CLIENT_ID'] ?? '',
        clientSecret: env['MICROSOFT_CLIENT_SECRET'] ?? '',
        tenantId: env['MICROSOFT_TENANT_ID'] ?? 'common',
        redirectUri: `${env['API_BASE_URL'] ?? ''}/api/auth/callback`,
      },
    });

    return result;
  };
}

// ---------------------------------------------------------------------------
// POST / — Connect a data source
// ---------------------------------------------------------------------------
dataSourcesRoutes.post(
  '/',
  zValidator('json', connectDataSourceSchema),
  async (c) => {
    const auth = c.get('auth');
    const db = c.get('db');
    const body = c.req.valid('json');

    try {
      const [created] = await db
        .insert(schema.dataSources)
        .values({
          tenantId: auth.tenantId,
          appId: body.appId ?? null,
          sourceType: body.type,
          m365ResourceId: body.m365ResourceId,
          syncConfig: {
            name: body.name,
            sheetName: body.sheetName ?? null,
          },
          syncStatus: 'pending',
        })
        .returning();

      if (!created) {
        return c.json(
          { error: { message: 'Failed to create data source', code: 'INSERT_FAILED', status: 500 } },
          500,
        );
      }

      // Trigger first sync (fire-and-forget; errors captured in syncStatus)
      const proxyCall = buildProxyCallFn(c);
      const env = c.env as Record<string, string>;
      void syncDataSource(created.id, auth.tenantId, auth.userId, proxyCall, {
        db,
        kv: (c.env as Record<string, unknown>)['DATA_CACHE'] as import('../services/data-cache.service').KVNamespace,
        encryptionKey: env['TOKEN_ENCRYPTION_KEY'] ?? '',
        oauthConfig: {
          clientId: env['MICROSOFT_CLIENT_ID'] ?? '',
          clientSecret: env['MICROSOFT_CLIENT_SECRET'] ?? '',
          tenantId: env['MICROSOFT_TENANT_ID'] ?? 'common',
          redirectUri: `${env['API_BASE_URL'] ?? ''}/api/auth/callback`,
        },
      });

      await logAudit(db, auth, {
        action: 'data.source_connected',
        resourceType: 'data_source',
        resourceId: created.id,
        metadata: { name: body.name, type: body.type, m365ResourceId: body.m365ResourceId },
      });

      return c.json({ data: created }, 201);
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Unknown error';
      return c.json(
        { error: { message, code: 'INTERNAL_ERROR', status: 500 } },
        500,
      );
    }
  },
);

// ---------------------------------------------------------------------------
// GET / — List my data sources
// ---------------------------------------------------------------------------
dataSourcesRoutes.get(
  '/',
  zValidator('query', listDataSourcesQuerySchema),
  async (c) => {
    const auth = c.get('auth');
    const db = c.get('db');
    const query = c.req.valid('query');

    try {
      // Build WHERE conditions dynamically
      const conditions = [eq(schema.dataSources.tenantId, auth.tenantId)];

      if (query.appId) {
        conditions.push(eq(schema.dataSources.appId, query.appId));
      }
      if (query.type) {
        conditions.push(eq(schema.dataSources.sourceType, query.type));
      }
      if (query.syncStatus) {
        conditions.push(eq(schema.dataSources.syncStatus, query.syncStatus));
      }

      const rows = await db
        .select()
        .from(schema.dataSources)
        .where(and(...conditions));

      return c.json({ data: rows });
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Unknown error';
      return c.json(
        { error: { message, code: 'INTERNAL_ERROR', status: 500 } },
        500,
      );
    }
  },
);

// ---------------------------------------------------------------------------
// GET /browse/drives — List drives via Graph API
// ---------------------------------------------------------------------------
dataSourcesRoutes.get('/browse/drives', async (c) => {
  const proxyCall = buildProxyCallFn(c);

  const result = await proxyCall('/me/drives?$select=id,name,driveType', 'GET');

  if (!result.ok) {
    return c.json(
      { error: { message: result.error, code: 'GRAPH_ERROR', status: result.status } },
      result.status as 400,
    );
  }

  const body = result.data as { value?: unknown[] };
  return c.json({ drives: body.value ?? [] });
});

// ---------------------------------------------------------------------------
// GET /browse/files — Browse files in a drive
// ---------------------------------------------------------------------------
dataSourcesRoutes.get(
  '/browse/files',
  zValidator('query', browseFilesQuerySchema),
  async (c) => {
    const { driveId, path } = c.req.valid('query');
    const proxyCall = buildProxyCallFn(c);

    const cleanPath = path === '/' ? '' : path;
    const endpoint = cleanPath
      ? `/drives/${driveId}/root:/${cleanPath}:/children?$select=id,name,size,lastModifiedDateTime,file,folder`
      : `/drives/${driveId}/root/children?$select=id,name,size,lastModifiedDateTime,file,folder`;

    const result = await proxyCall(endpoint, 'GET');

    if (!result.ok) {
      return c.json(
        { error: { message: result.error, code: 'GRAPH_ERROR', status: result.status } },
        result.status as 400,
      );
    }

    const body = result.data as { value?: unknown[] };
    return c.json({ items: body.value ?? [], path });
  },
);

// ---------------------------------------------------------------------------
// GET /files — List Excel files from OneDrive
// ---------------------------------------------------------------------------
dataSourcesRoutes.get('/files', async (c) => {
  const auth = c.get('auth');
  const proxyCall = buildProxyCallFn(c);

  const result = await listDriveFiles(proxyCall, auth.userId);

  if (!result.ok) {
    return c.json(
      { error: { message: result.error, status: result.status } },
      result.status as 400,
    );
  }

  return c.json({ data: result.data });
});

// ---------------------------------------------------------------------------
// GET /files/:id/preview — Preview Excel file content
// ---------------------------------------------------------------------------
dataSourcesRoutes.get('/files/:id/preview', async (c) => {
  const fileId = c.req.param('id');

  if (!fileId || fileId.trim().length === 0) {
    return c.json({ error: { message: 'File ID is required', code: 'VALIDATION_ERROR', status: 400 } }, 400);
  }

  const proxyCall = buildProxyCallFn(c);
  const result = await getExcelContent(proxyCall, fileId);

  if (!result.ok) {
    return c.json(
      { error: { message: result.error, status: result.status } },
      result.status as 400,
    );
  }

  return c.json({ data: result.data });
});

// ---------------------------------------------------------------------------
// GET /:id — Get data source detail
// ---------------------------------------------------------------------------
dataSourcesRoutes.get('/:id', async (c) => {
  const auth = c.get('auth');
  const db = c.get('db');
  const id = c.req.param('id');

  try {
    const [row] = await db
      .select()
      .from(schema.dataSources)
      .where(
        and(
          eq(schema.dataSources.id, id),
          eq(schema.dataSources.tenantId, auth.tenantId),
        ),
      );

    if (!row) {
      return c.json(
        { error: { message: 'Data source not found', code: 'NOT_FOUND', status: 404 } },
        404,
      );
    }

    return c.json({ data: row });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Unknown error';
    return c.json(
      { error: { message, code: 'INTERNAL_ERROR', status: 500 } },
      500,
    );
  }
});

// ---------------------------------------------------------------------------
// POST /:id/sync — Force re-sync
// ---------------------------------------------------------------------------
dataSourcesRoutes.post('/:id/sync', async (c) => {
  const auth = c.get('auth');
  const db = c.get('db');
  const id = c.req.param('id');

  try {
    // Verify ownership
    const [row] = await db
      .select()
      .from(schema.dataSources)
      .where(
        and(
          eq(schema.dataSources.id, id),
          eq(schema.dataSources.tenantId, auth.tenantId),
        ),
      );

    if (!row) {
      return c.json(
        { error: { message: 'Data source not found', code: 'NOT_FOUND', status: 404 } },
        404,
      );
    }

    if (row.syncStatus === 'disconnected') {
      return c.json(
        { error: { message: 'Cannot sync a disconnected data source', code: 'DISCONNECTED', status: 409 } },
        409,
      );
    }

    const proxyCall = buildProxyCallFn(c);
    const env = c.env as Record<string, string>;
    const syncResult = await syncDataSource(id, auth.tenantId, auth.userId, proxyCall, {
      db,
      kv: (c.env as Record<string, unknown>)['DATA_CACHE'] as import('../services/data-cache.service').KVNamespace,
      encryptionKey: env['TOKEN_ENCRYPTION_KEY'] ?? '',
      oauthConfig: {
        clientId: env['MICROSOFT_CLIENT_ID'] ?? '',
        clientSecret: env['MICROSOFT_CLIENT_SECRET'] ?? '',
        tenantId: env['MICROSOFT_TENANT_ID'] ?? 'common',
        redirectUri: `${env['API_BASE_URL'] ?? ''}/api/auth/callback`,
      },
    });

    if (!syncResult.ok) {
      return c.json({ error: { message: syncResult.error.message, code: syncResult.error.code, status: 422 } }, 422);
    }

    return c.json({ data: syncResult.value });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Unknown error';
    return c.json(
      { error: { message, code: 'INTERNAL_ERROR', status: 500 } },
      500,
    );
  }
});

// ---------------------------------------------------------------------------
// DELETE /:id — Disconnect (soft delete)
// ---------------------------------------------------------------------------
dataSourcesRoutes.delete('/:id', async (c) => {
  const auth = c.get('auth');
  const db = c.get('db');
  const id = c.req.param('id');

  try {
    // Verify ownership
    const [row] = await db
      .select()
      .from(schema.dataSources)
      .where(
        and(
          eq(schema.dataSources.id, id),
          eq(schema.dataSources.tenantId, auth.tenantId),
        ),
      );

    if (!row) {
      return c.json(
        { error: { message: 'Data source not found', code: 'NOT_FOUND', status: 404 } },
        404,
      );
    }

    const [updated] = await db
      .update(schema.dataSources)
      .set({ syncStatus: 'disconnected' })
      .where(
        and(
          eq(schema.dataSources.id, id),
          eq(schema.dataSources.tenantId, auth.tenantId),
        ),
      )
      .returning();

    await logAudit(db, auth, {
      action: 'data.source_disconnected',
      resourceType: 'data_source',
      resourceId: id,
    });

    return c.json({ data: updated });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Unknown error';
    return c.json(
      { error: { message, code: 'INTERNAL_ERROR', status: 500 } },
      500,
    );
  }
});
