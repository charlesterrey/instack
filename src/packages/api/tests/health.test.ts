import { describe, it, expect } from 'vitest';
import { app } from '../src/index';

const TEST_ENV = {
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

describe('Health endpoint', () => {
  it('responds with status ok', async () => {
    const res = await app.request('/health', undefined, TEST_ENV);
    expect(res.status).toBe(200);
    const body = await res.json() as { status: string };
    expect(body.status).toBe('ok');
  });

  it('returns 404 for unknown routes', async () => {
    const res = await app.request('/unknown', undefined, TEST_ENV);
    expect(res.status).toBe(404);
  });

  it('returns 401 for protected routes without auth', async () => {
    const res = await app.request('/api/apps', undefined, TEST_ENV);
    expect(res.status).toBe(401);
  });
});
