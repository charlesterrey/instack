import { Hono } from 'hono';
import { setCookie, deleteCookie, getCookie } from 'hono/cookie';
import {
  generatePKCE,
  generateState,
  verifyState,
  buildAuthorizationUrl,
  exchangeCodeForTokens,
  decodeIdToken,
} from '../services/oauth.service';
import type { OAuthConfig } from '../services/oauth.service';
import { createJWT } from '../lib/jwt';
import { encrypt } from '../lib/crypto';
import { createDb } from '../lib/db';
import { logger } from '../lib/logger';
import { tenants, users } from '../../drizzle/schema';
import { eq, and } from 'drizzle-orm';

interface AuthBindings {
  MICROSOFT_CLIENT_ID: string;
  MICROSOFT_CLIENT_SECRET: string;
  MICROSOFT_TENANT_ID: string;
  JWT_SECRET: string;
  TOKEN_ENCRYPTION_KEY: string;
  API_BASE_URL: string;
  FRONTEND_URL: string;
  DATABASE_URL: string;
  [key: string]: unknown;
}

export const authRoutes = new Hono<{ Bindings: AuthBindings }>();

function getOAuthConfig(env: AuthBindings): OAuthConfig {
  return {
    clientId: env.MICROSOFT_CLIENT_ID,
    clientSecret: env.MICROSOFT_CLIENT_SECRET,
    tenantId: env.MICROSOFT_TENANT_ID,
    redirectUri: `${env.API_BASE_URL}/api/auth/callback`,
  };
}

// ============================================================================
// GET /auth/login — Redirect to Microsoft login
// ============================================================================
authRoutes.get('/login', async (c) => {
  const env = c.env;
  const config = getOAuthConfig(env);
  const { verifier, challenge } = await generatePKCE();
  const frontendUrl = c.req.query('redirect') ?? env.FRONTEND_URL;
  const state = await generateState(env.JWT_SECRET, frontendUrl);

  // Store PKCE verifier in an encrypted cookie
  setCookie(c, 'pkce_verifier', verifier, {
    httpOnly: true,
    secure: true,
    sameSite: 'Lax',
    path: '/api/auth',
    maxAge: 600, // 10 minutes
  });

  const authUrl = buildAuthorizationUrl(config, state, challenge);
  return c.redirect(authUrl);
});

// ============================================================================
// GET /auth/callback — Exchange code for tokens, create session
// ============================================================================
authRoutes.get('/callback', async (c) => {
  const env = c.env;
  const config = getOAuthConfig(env);
  const code = c.req.query('code');
  const state = c.req.query('state');
  const error = c.req.query('error');
  const codeVerifier = getCookie(c, 'pkce_verifier');

  // Clear the PKCE cookie
  deleteCookie(c, 'pkce_verifier', { path: '/api/auth' });

  if (error) {
    logger.error('OAuth error from Microsoft', { error, description: c.req.query('error_description') });
    return c.redirect(`${env.FRONTEND_URL}/login?error=auth_failed`);
  }

  if (!code || !state || !codeVerifier) {
    return c.redirect(`${env.FRONTEND_URL}/login?error=invalid_callback`);
  }

  // Verify state (CSRF protection)
  const stateResult = await verifyState(state, env.JWT_SECRET);
  if (!stateResult.valid) {
    logger.warn('Invalid OAuth state parameter');
    return c.redirect(`${env.FRONTEND_URL}/login?error=invalid_state`);
  }

  // Exchange code for tokens
  let tokenResponse;
  try {
    tokenResponse = await exchangeCodeForTokens(code, codeVerifier, config);
  } catch (err) {
    logger.error('Token exchange failed', { error: String(err) });
    return c.redirect(`${env.FRONTEND_URL}/login?error=token_exchange_failed`);
  }

  // Decode ID token to get user claims
  const claims = decodeIdToken(tokenResponse.id_token);
  const email = claims.email ?? claims.preferred_username ?? '';
  const name = claims.name ?? email;

  if (!claims.oid || !claims.tid) {
    logger.error('Missing oid or tid in ID token');
    return c.redirect(`${env.FRONTEND_URL}/login?error=invalid_claims`);
  }

  // Upsert tenant + user
  const db = createDb(env.DATABASE_URL);

  // Upsert tenant
  const existingTenants = await db
    .select()
    .from(tenants)
    .where(eq(tenants.m365TenantId, claims.tid))
    .limit(1);

  let tenantId: string;
  if (existingTenants.length > 0 && existingTenants[0]) {
    tenantId = existingTenants[0].id;
  } else {
    const inserted = await db
      .insert(tenants)
      .values({ name: `Org ${claims.tid.substring(0, 8)}`, m365TenantId: claims.tid })
      .returning({ id: tenants.id });
    if (!inserted[0]) {
      return c.redirect(`${env.FRONTEND_URL}/login?error=db_error`);
    }
    tenantId = inserted[0].id;
  }

  // Upsert user
  const existingUsers = await db
    .select()
    .from(users)
    .where(and(eq(users.tenantId, tenantId), eq(users.m365UserId, claims.oid)))
    .limit(1);

  let userId: string;
  let userRole: 'admin' | 'creator' | 'viewer';

  if (existingUsers.length > 0 && existingUsers[0]) {
    userId = existingUsers[0].id;
    userRole = existingUsers[0].role as 'admin' | 'creator' | 'viewer';
    // Update last active and name
    await db
      .update(users)
      .set({ lastActiveAt: new Date(), name, email })
      .where(eq(users.id, userId));
  } else {
    // First user in a tenant becomes admin
    const userCount = await db
      .select()
      .from(users)
      .where(eq(users.tenantId, tenantId))
      .limit(1);
    const isFirstUser = userCount.length === 0;
    userRole = isFirstUser ? 'admin' : 'creator';

    const inserted = await db
      .insert(users)
      .values({
        tenantId,
        email,
        name,
        role: userRole,
        m365UserId: claims.oid,
        lastActiveAt: new Date(),
      })
      .returning({ id: users.id });
    if (!inserted[0]) {
      return c.redirect(`${env.FRONTEND_URL}/login?error=db_error`);
    }
    userId = inserted[0].id;
  }

  // Encrypt and store OAuth tokens
  const encryptedAccess = await encrypt(tokenResponse.access_token, env.TOKEN_ENCRYPTION_KEY);
  const encryptedRefresh = await encrypt(tokenResponse.refresh_token, env.TOKEN_ENCRYPTION_KEY);
  const tokenExpiresAt = new Date(Date.now() + tokenResponse.expires_in * 1000);

  await db
    .update(users)
    .set({
      encryptedAccessToken: encryptedAccess.ciphertext,
      tokenIv: encryptedAccess.iv,
      tokenTag: encryptedAccess.tag,
      encryptedRefreshToken: encryptedRefresh.ciphertext,
      refreshTokenIv: encryptedRefresh.iv,
      refreshTokenTag: encryptedRefresh.tag,
      tokenExpiresAt,
    })
    .where(eq(users.id, userId));

  // Create JWT session token
  const jwt = await createJWT(
    { userId, tenantId, role: userRole, email },
    env.JWT_SECRET,
  );

  // Set JWT as HttpOnly cookie
  setCookie(c, 'instack_session', jwt, {
    httpOnly: true,
    secure: true,
    sameSite: 'Lax',
    path: '/',
    maxAge: 3600, // 1 hour
  });

  logger.info('User authenticated', { userId, tenantId, email });
  return c.redirect(stateResult.redirectUrl);
});

// ============================================================================
// POST /auth/refresh — Refresh the session token
// ============================================================================
authRoutes.post('/refresh', async (c) => {
  const sessionToken = getCookie(c, 'instack_session');
  if (!sessionToken) {
    return c.json({ error: { message: 'No session', status: 401 } }, 401);
  }

  const { verifyJWT: verifyFn } = await import('../lib/jwt');
  const result = await verifyFn(sessionToken, c.env.JWT_SECRET);

  if (!result.ok) {
    deleteCookie(c, 'instack_session', { path: '/' });
    return c.json({ error: { message: 'Session expired', status: 401 } }, 401);
  }

  // Refresh the JWT with a new expiration
  const jwt = await createJWT(
    {
      userId: result.payload.sub,
      tenantId: result.payload.tid,
      role: result.payload.role,
      email: result.payload.email,
    },
    c.env.JWT_SECRET,
  );

  setCookie(c, 'instack_session', jwt, {
    httpOnly: true,
    secure: true,
    sameSite: 'Lax',
    path: '/',
    maxAge: 3600,
  });

  return c.json({ status: 'refreshed' });
});

// ============================================================================
// POST /auth/logout — Clear session and tokens
// ============================================================================
authRoutes.post('/logout', async (c) => {
  const sessionToken = getCookie(c, 'instack_session');
  deleteCookie(c, 'instack_session', { path: '/' });

  if (sessionToken) {
    const { verifyJWT: verifyFn } = await import('../lib/jwt');
    const result = await verifyFn(sessionToken, c.env.JWT_SECRET);

    if (result.ok) {
      // Clear stored tokens
      const db = createDb(c.env.DATABASE_URL);
      await db
        .update(users)
        .set({
          encryptedAccessToken: null,
          encryptedRefreshToken: null,
          tokenIv: null,
          tokenTag: null,
          refreshTokenIv: null,
          refreshTokenTag: null,
          tokenExpiresAt: null,
        })
        .where(eq(users.id, result.payload.sub));

      logger.info('User logged out', { userId: result.payload.sub });
    }
  }

  return c.json({ status: 'logged_out' });
});
