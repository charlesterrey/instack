/**
 * Microsoft Entra ID OAuth 2.0 Authorization Code flow with PKCE.
 */

import type { MicrosoftTokenResponse, MicrosoftIdTokenClaims } from '@instack/shared';
import { logger } from '../lib/logger';

const MICROSOFT_AUTH_URL = 'https://login.microsoftonline.com';
const SCOPES = 'openid profile email User.Read Files.Read.All Sites.Read.All offline_access';

export interface OAuthConfig {
  clientId: string;
  clientSecret: string;
  tenantId: string;
  redirectUri: string;
}

/** Generate a random string for PKCE and state parameters */
function generateRandom(length: number): string {
  const bytes = crypto.getRandomValues(new Uint8Array(length));
  return Array.from(bytes)
    .map((b) => b.toString(16).padStart(2, '0'))
    .join('');
}

/** Generate PKCE code verifier and challenge (S256) */
export async function generatePKCE(): Promise<{ verifier: string; challenge: string }> {
  const verifier = generateRandom(32);
  const encoded = new TextEncoder().encode(verifier);
  const hash = await crypto.subtle.digest('SHA-256', encoded);
  const challenge = btoa(String.fromCharCode(...new Uint8Array(hash)))
    .replace(/\+/g, '-')
    .replace(/\//g, '_')
    .replace(/=+$/, '');
  return { verifier, challenge };
}

/** Generate a signed state parameter for CSRF protection */
export async function generateState(secret: string, redirectUrl: string): Promise<string> {
  const nonce = generateRandom(16);
  const payload = JSON.stringify({ nonce, redirectUrl, createdAt: Date.now() });
  const encoded = btoa(payload);
  const key = await crypto.subtle.importKey(
    'raw',
    new TextEncoder().encode(secret),
    { name: 'HMAC', hash: 'SHA-256' },
    false,
    ['sign'],
  );
  const sig = await crypto.subtle.sign('HMAC', key, new TextEncoder().encode(encoded));
  const sigHex = Array.from(new Uint8Array(sig))
    .map((b) => b.toString(16).padStart(2, '0'))
    .join('');
  return `${encoded}.${sigHex}`;
}

/** Verify the state parameter against the secret */
export async function verifyState(
  state: string,
  secret: string,
): Promise<{ valid: boolean; redirectUrl: string }> {
  const dotIndex = state.indexOf('.');
  if (dotIndex === -1) {
    return { valid: false, redirectUrl: '' };
  }
  const encoded = state.substring(0, dotIndex);
  const sigHex = state.substring(dotIndex + 1);

  const key = await crypto.subtle.importKey(
    'raw',
    new TextEncoder().encode(secret),
    { name: 'HMAC', hash: 'SHA-256' },
    false,
    ['verify'],
  );

  const sigBytes = new Uint8Array(sigHex.length / 2);
  for (let i = 0; i < sigHex.length; i += 2) {
    sigBytes[i / 2] = parseInt(sigHex.substring(i, i + 2), 16);
  }

  const isValid = await crypto.subtle.verify(
    'HMAC',
    key,
    sigBytes,
    new TextEncoder().encode(encoded),
  );

  if (!isValid) {
    return { valid: false, redirectUrl: '' };
  }

  try {
    const payload = JSON.parse(atob(encoded)) as { nonce: string; redirectUrl: string; createdAt: number };
    // State expires after 10 minutes
    const TEN_MINUTES = 10 * 60 * 1000;
    if (Date.now() - payload.createdAt > TEN_MINUTES) {
      return { valid: false, redirectUrl: '' };
    }
    return { valid: true, redirectUrl: payload.redirectUrl };
  } catch {
    return { valid: false, redirectUrl: '' };
  }
}

/** Build the Microsoft authorization URL */
export function buildAuthorizationUrl(
  config: OAuthConfig,
  state: string,
  codeChallenge: string,
): string {
  const params = new URLSearchParams({
    client_id: config.clientId,
    response_type: 'code',
    redirect_uri: config.redirectUri,
    scope: SCOPES,
    state,
    code_challenge: codeChallenge,
    code_challenge_method: 'S256',
    response_mode: 'query',
  });
  return `${MICROSOFT_AUTH_URL}/${config.tenantId}/oauth2/v2.0/authorize?${params.toString()}`;
}

/** Exchange authorization code for tokens */
export async function exchangeCodeForTokens(
  code: string,
  codeVerifier: string,
  config: OAuthConfig,
): Promise<MicrosoftTokenResponse> {
  const tokenUrl = `${MICROSOFT_AUTH_URL}/${config.tenantId}/oauth2/v2.0/token`;

  const body = new URLSearchParams({
    client_id: config.clientId,
    client_secret: config.clientSecret,
    code,
    redirect_uri: config.redirectUri,
    grant_type: 'authorization_code',
    code_verifier: codeVerifier,
  });

  const response = await fetch(tokenUrl, {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: body.toString(),
  });

  if (!response.ok) {
    const errorText = await response.text();
    logger.error('Token exchange failed', { status: response.status, body: errorText });
    throw new Error(`Token exchange failed: ${response.status}`);
  }

  return (await response.json()) as MicrosoftTokenResponse;
}

/** Refresh the access token using a refresh token */
export async function refreshAccessToken(
  refreshToken: string,
  config: OAuthConfig,
): Promise<MicrosoftTokenResponse> {
  const tokenUrl = `${MICROSOFT_AUTH_URL}/${config.tenantId}/oauth2/v2.0/token`;

  const body = new URLSearchParams({
    client_id: config.clientId,
    client_secret: config.clientSecret,
    refresh_token: refreshToken,
    grant_type: 'refresh_token',
    scope: SCOPES,
  });

  const response = await fetch(tokenUrl, {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: body.toString(),
  });

  if (!response.ok) {
    const errorText = await response.text();
    logger.error('Token refresh failed', { status: response.status, body: errorText });
    throw new Error(`Token refresh failed: ${response.status}`);
  }

  return (await response.json()) as MicrosoftTokenResponse;
}

/** Decode an ID token to extract user claims (without verifying — Microsoft already signed it) */
export function decodeIdToken(idToken: string): MicrosoftIdTokenClaims {
  const parts = idToken.split('.');
  if (parts.length !== 3 || !parts[1]) {
    throw new Error('Invalid ID token format');
  }
  const padded = parts[1] + '='.repeat((4 - (parts[1].length % 4)) % 4);
  const json = atob(padded.replace(/-/g, '+').replace(/_/g, '/'));
  return JSON.parse(json) as MicrosoftIdTokenClaims;
}
