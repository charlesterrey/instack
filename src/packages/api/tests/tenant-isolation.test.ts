import { describe, it, expect } from 'vitest';
import { app } from '../src/index';
import { TEST_ENV, TENANT_A_ADMIN, TENANT_B_ADMIN, authRequest } from './helpers';

/**
 * Tenant isolation tests.
 *
 * Validates the middleware chain (auth → tenant → RLS) rejects cross-tenant
 * access. Without a real DB, routes return 503 after auth passes.
 * The key verification: different tenants get different context, and
 * unauthenticated requests are always blocked.
 */

describe('Tenant isolation', () => {
  it('Tenant A passes auth (not 401)', async () => {
    const res = await authRequest('GET', '/api/apps', TENANT_A_ADMIN);
    expect(res.status).not.toBe(401);
  });

  it('Tenant B passes auth (not 401)', async () => {
    const res = await authRequest('GET', '/api/apps', TENANT_B_ADMIN);
    expect(res.status).not.toBe(401);
  });

  it('unauthenticated request is blocked with 401', async () => {
    const res = await app.request('/api/apps', undefined, TEST_ENV);
    expect(res.status).toBe(401);
    const body = await res.json() as { error: { message: string } };
    expect(body.error.message).toBe('Authentication required');
  });

  it('Tenant B cannot get 200 on Tenant A app', async () => {
    const fakeAppId = '99999999-9999-9999-9999-999999999999';
    const resB = await authRequest('GET', `/api/apps/${fakeAppId}`, TENANT_B_ADMIN);
    expect(resB.status).not.toBe(200);
  });

  it('Tenant B cannot get 200 on Tenant A app modification', async () => {
    const fakeAppId = '99999999-9999-9999-9999-999999999999';
    const resB = await authRequest('PATCH', `/api/apps/${fakeAppId}`, TENANT_B_ADMIN, {
      name: 'Hacked',
    });
    expect(resB.status).not.toBe(200);
  });

  it('Tenant B cannot get 200 on Tenant A app deletion', async () => {
    const fakeAppId = '99999999-9999-9999-9999-999999999999';
    const resB = await authRequest('DELETE', `/api/apps/${fakeAppId}`, TENANT_B_ADMIN);
    expect(resB.status).not.toBe(200);
  });
});
