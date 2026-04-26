/**
 * Token Proxy — Decrypt stored OAuth token and call Microsoft Graph on behalf of user.
 * The OAuth token is NEVER exposed to the frontend or generated apps.
 */

import { decrypt } from '../lib/crypto';
import { refreshAccessToken } from './oauth.service';
import type { OAuthConfig } from './oauth.service';
import { encrypt } from '../lib/crypto';
import type { Database } from '../lib/db';
import { users } from '../../drizzle/schema';
import { eq } from 'drizzle-orm';
import { logger } from '../lib/logger';

/** Whitelist of allowed Graph API endpoint prefixes */
const ALLOWED_ENDPOINTS = [
  '/me',
  '/me/drive',
  '/me/drive/root',
  '/me/drive/items',
  '/sites',
  '/drives',
];

export function isEndpointAllowed(endpoint: string): boolean {
  return ALLOWED_ENDPOINTS.some((prefix) => endpoint.startsWith(prefix));
}

interface ProxyCallOptions {
  userId: string;
  endpoint: string;
  method: 'GET' | 'POST' | 'PATCH' | 'DELETE';
  body?: unknown;
  db: Database;
  encryptionKey: string;
  oauthConfig: OAuthConfig;
}

type ProxyResult =
  | { readonly ok: true; readonly status: number; readonly data: unknown }
  | { readonly ok: false; readonly error: string; readonly status: number };

/** Execute a Graph API call on behalf of the user via the token proxy */
export async function proxyGraphCall(options: ProxyCallOptions): Promise<ProxyResult> {
  const { userId, endpoint, method, body, db, encryptionKey, oauthConfig } = options;

  if (!isEndpointAllowed(endpoint)) {
    return { ok: false, error: 'Endpoint not allowed', status: 403 };
  }

  // Fetch user's encrypted tokens
  const userRows = await db
    .select({
      encryptedAccessToken: users.encryptedAccessToken,
      tokenIv: users.tokenIv,
      tokenTag: users.tokenTag,
      encryptedRefreshToken: users.encryptedRefreshToken,
      refreshTokenIv: users.refreshTokenIv,
      refreshTokenTag: users.refreshTokenTag,
      tokenExpiresAt: users.tokenExpiresAt,
    })
    .from(users)
    .where(eq(users.id, userId))
    .limit(1);

  const user = userRows[0];
  if (!user?.encryptedAccessToken || !user.tokenIv || !user.tokenTag) {
    return { ok: false, error: 'No Graph API tokens available. Please re-authenticate.', status: 401 };
  }

  let accessToken: string;

  // Check if token is expired and refresh if needed
  const isExpired = user.tokenExpiresAt ? new Date(user.tokenExpiresAt) < new Date() : false;

  if (isExpired && user.encryptedRefreshToken && user.refreshTokenIv && user.refreshTokenTag) {
    const refreshToken = await decrypt(
      { ciphertext: user.encryptedRefreshToken, iv: user.refreshTokenIv, tag: user.refreshTokenTag },
      encryptionKey,
    );

    try {
      const newTokens = await refreshAccessToken(refreshToken, oauthConfig);
      accessToken = newTokens.access_token;

      // Store the new encrypted tokens
      const encryptedAccess = await encrypt(newTokens.access_token, encryptionKey);
      const encryptedRefresh = await encrypt(newTokens.refresh_token, encryptionKey);

      await db
        .update(users)
        .set({
          encryptedAccessToken: encryptedAccess.ciphertext,
          tokenIv: encryptedAccess.iv,
          tokenTag: encryptedAccess.tag,
          encryptedRefreshToken: encryptedRefresh.ciphertext,
          refreshTokenIv: encryptedRefresh.iv,
          refreshTokenTag: encryptedRefresh.tag,
          tokenExpiresAt: new Date(Date.now() + newTokens.expires_in * 1000),
        })
        .where(eq(users.id, userId));
    } catch (err) {
      logger.error('Token refresh failed in proxy', { userId, error: String(err) });
      return { ok: false, error: 'Token refresh failed. Please re-authenticate.', status: 401 };
    }
  } else {
    accessToken = await decrypt(
      { ciphertext: user.encryptedAccessToken, iv: user.tokenIv, tag: user.tokenTag },
      encryptionKey,
    );
  }

  // Make the Graph API call
  const graphUrl = `https://graph.microsoft.com/v1.0${endpoint}`;
  const headers: Record<string, string> = {
    Authorization: `Bearer ${accessToken}`,
    'Content-Type': 'application/json',
  };

  const fetchOptions: RequestInit = { method, headers };
  if (body !== undefined && method !== 'GET') {
    fetchOptions.body = JSON.stringify(body);
  }

  const response = await fetch(graphUrl, fetchOptions);

  // Never log the access token
  logger.info('Graph API proxy call', {
    userId,
    endpoint,
    method,
    status: response.status,
  });

  if (!response.ok) {
    await response.text();
    return { ok: false, error: `Graph API error: ${response.status}`, status: response.status };
  }

  const data: unknown = response.headers.get('content-type')?.includes('application/json')
    ? await response.json()
    : await response.text();

  return { ok: true, status: response.status, data };
}
