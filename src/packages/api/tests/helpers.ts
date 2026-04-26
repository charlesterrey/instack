import { createJWT } from '../src/lib/jwt';
import app from '../src/index';

export const TEST_ENV = {
  DATABASE_URL: 'postgresql://localhost:5432/test',
  ENVIRONMENT: 'development',
  MICROSOFT_CLIENT_ID: 'test-client-id',
  MICROSOFT_CLIENT_SECRET: 'test-client-secret',
  MICROSOFT_TENANT_ID: 'common',
  JWT_SECRET: 'test-jwt-secret-at-least-32-characters',
  TOKEN_ENCRYPTION_KEY: 'a1b2c3d4e5f6a7b8c9d0e1f2a3b4c5d6',
  API_BASE_URL: 'http://localhost:8787',
  FRONTEND_URL: 'http://localhost:5173',
};

export interface TestUser {
  userId: string;
  tenantId: string;
  role: 'admin' | 'creator' | 'viewer';
  email: string;
}

export const TENANT_A_ADMIN: TestUser = {
  userId: '11111111-1111-1111-1111-111111111111',
  tenantId: 'aaaa0000-aaaa-aaaa-aaaa-aaaaaaaaaaaa',
  role: 'admin',
  email: 'admin@tenanta.com',
};

export const TENANT_A_CREATOR: TestUser = {
  userId: '22222222-2222-2222-2222-222222222222',
  tenantId: 'aaaa0000-aaaa-aaaa-aaaa-aaaaaaaaaaaa',
  role: 'creator',
  email: 'creator@tenanta.com',
};

export const TENANT_A_VIEWER: TestUser = {
  userId: '33333333-3333-3333-3333-333333333333',
  tenantId: 'aaaa0000-aaaa-aaaa-aaaa-aaaaaaaaaaaa',
  role: 'viewer',
  email: 'viewer@tenanta.com',
};

export const TENANT_B_ADMIN: TestUser = {
  userId: '44444444-4444-4444-4444-444444444444',
  tenantId: 'bbbb0000-bbbb-bbbb-bbbb-bbbbbbbbbbbb',
  role: 'admin',
  email: 'admin@tenantb.com',
};

export async function createSessionCookie(user: TestUser): Promise<string> {
  const jwt = await createJWT(user, TEST_ENV.JWT_SECRET);
  return `instack_session=${jwt}`;
}

export async function authRequest(
  method: string,
  path: string,
  user: TestUser,
  body?: unknown,
): Promise<Response> {
  const cookie = await createSessionCookie(user);
  const headers: Record<string, string> = { Cookie: cookie };

  const init: RequestInit = { method, headers };

  if (body !== undefined) {
    headers['Content-Type'] = 'application/json';
    init.body = JSON.stringify(body);
  }

  return app.request(path, init, TEST_ENV);
}
