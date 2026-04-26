/**
 * JWT token creation and verification using HMAC-SHA256.
 * Uses Web Crypto API (Cloudflare Workers compatible).
 */

import type { JWTPayload } from '@instack/shared';

function base64UrlEncode(data: Uint8Array): string {
  const base64 = btoa(String.fromCharCode(...data));
  return base64.replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');
}

function base64UrlDecode(str: string): Uint8Array {
  const padded = str + '='.repeat((4 - (str.length % 4)) % 4);
  const base64 = padded.replace(/-/g, '+').replace(/_/g, '/');
  const binary = atob(base64);
  return Uint8Array.from(binary, (c) => c.charCodeAt(0));
}

function encodeJson(obj: unknown): string {
  return base64UrlEncode(new TextEncoder().encode(JSON.stringify(obj)));
}

async function getSigningKey(secret: string): Promise<CryptoKey> {
  const encoded = new TextEncoder().encode(secret);
  return crypto.subtle.importKey('raw', encoded, { name: 'HMAC', hash: 'SHA-256' }, false, [
    'sign',
    'verify',
  ]);
}

async function sign(input: string, secret: string): Promise<string> {
  const key = await getSigningKey(secret);
  const signature = await crypto.subtle.sign('HMAC', key, new TextEncoder().encode(input));
  return base64UrlEncode(new Uint8Array(signature));
}

async function verify(input: string, signatureB64: string, secret: string): Promise<boolean> {
  const key = await getSigningKey(secret);
  const signature = base64UrlDecode(signatureB64);
  return crypto.subtle.verify('HMAC', key, signature, new TextEncoder().encode(input));
}

const HEADER = { alg: 'HS256', typ: 'JWT' };
const TOKEN_EXPIRY_SECONDS = 3600; // 1 hour

export interface CreateJWTOptions {
  userId: string;
  tenantId: string;
  role: 'admin' | 'creator' | 'viewer';
  email: string;
}

/** Create a signed JWT session token */
export async function createJWT(options: CreateJWTOptions, secret: string): Promise<string> {
  const now = Math.floor(Date.now() / 1000);
  const payload: JWTPayload = {
    sub: options.userId,
    tid: options.tenantId,
    role: options.role,
    email: options.email,
    iat: now,
    exp: now + TOKEN_EXPIRY_SECONDS,
  };

  const headerEncoded = encodeJson(HEADER);
  const payloadEncoded = encodeJson(payload);
  const input = `${headerEncoded}.${payloadEncoded}`;
  const signature = await sign(input, secret);

  return `${input}.${signature}`;
}

type VerifyResult =
  | { readonly ok: true; readonly payload: JWTPayload }
  | { readonly ok: false; readonly error: string };

/** Verify a JWT and return the payload if valid */
export async function verifyJWT(token: string, secret: string): Promise<VerifyResult> {
  const parts = token.split('.');
  if (parts.length !== 3) {
    return { ok: false, error: 'Invalid token format' };
  }

  const [header, payload, signature] = parts as [string, string, string];
  const input = `${header}.${payload}`;

  const isValid = await verify(input, signature, secret);
  if (!isValid) {
    return { ok: false, error: 'Invalid signature' };
  }

  let decoded: JWTPayload;
  try {
    const json = new TextDecoder().decode(base64UrlDecode(payload));
    decoded = JSON.parse(json) as JWTPayload;
  } catch {
    return { ok: false, error: 'Invalid payload' };
  }

  const now = Math.floor(Date.now() / 1000);
  if (decoded.exp < now) {
    return { ok: false, error: 'Token expired' };
  }

  return { ok: true, payload: decoded };
}
