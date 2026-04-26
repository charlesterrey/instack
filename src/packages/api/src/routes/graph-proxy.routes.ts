import { Hono } from 'hono';
import { zValidator } from '@hono/zod-validator';
import { graphProxyRequestSchema } from '@instack/shared';
import { proxyGraphCall } from '../services/token-proxy.service';

export const graphProxyRoutes = new Hono();

graphProxyRoutes.post(
  '/',
  zValidator('json', graphProxyRequestSchema),
  async (c) => {
    const auth = c.get('auth');
    const db = c.get('db');
    const body = c.req.valid('json');

    const env = c.env as Record<string, string>;

    const result = await proxyGraphCall({
      userId: auth.userId,
      endpoint: body.endpoint,
      method: body.method,
      body: body.body,
      db,
      encryptionKey: env['TOKEN_ENCRYPTION_KEY'] ?? '',
      oauthConfig: {
        clientId: env['MICROSOFT_CLIENT_ID'] ?? '',
        clientSecret: env['MICROSOFT_CLIENT_SECRET'] ?? '',
        tenantId: env['MICROSOFT_TENANT_ID'] ?? 'common',
        redirectUri: `${env['API_BASE_URL'] ?? ''}/api/auth/callback`,
      },
    });

    if (!result.ok) {
      return c.json({ error: { message: result.error, status: result.status } }, result.status as 400);
    }

    return c.json({ data: result.data });
  },
);
