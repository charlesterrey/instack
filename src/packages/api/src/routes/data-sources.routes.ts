/**
 * Data Sources routes — list and preview Excel files via Microsoft Graph.
 * All Graph API calls go through the token proxy. OAuth tokens are NEVER exposed.
 *
 * @module data-sources.routes
 * @agent @CONDUIT — Integration Engineer
 */

import { Hono } from 'hono';
import { listDriveFiles, getExcelContent } from '../services/graph-api.service';
import { proxyGraphCall } from '../services/token-proxy.service';
import type { ProxyCallFn } from '../services/graph-api.service';

export const dataSourcesRoutes = new Hono();

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

/**
 * GET /api/data-sources/files
 * List Excel files (.xlsx) accessible to the authenticated user from OneDrive.
 */
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

/**
 * GET /api/data-sources/files/:id/preview
 * Download and preview the first rows of an Excel file.
 * Returns raw content — the frontend is responsible for parsing/rendering.
 */
dataSourcesRoutes.get('/files/:id/preview', async (c) => {
  const fileId = c.req.param('id');

  if (!fileId || fileId.trim().length === 0) {
    return c.json({ error: { message: 'File ID is required', status: 400 } }, 400);
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
