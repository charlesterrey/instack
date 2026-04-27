import { describe, it, expect } from 'vitest';
import { app } from '../src/index';
import { TEST_ENV, TENANT_A_ADMIN, TENANT_A_CREATOR, TENANT_A_VIEWER, authRequest } from './helpers';

describe('Users routes', () => {
  describe('GET /api/users/me', () => {
    it('returns 401 without auth', async () => {
      const res = await app.request('/api/users/me', undefined, TEST_ENV);
      expect(res.status).toBe(401);
    });

    it('passes auth for admin', async () => {
      const res = await authRequest('GET', '/api/users/me', TENANT_A_ADMIN);
      expect(res.status).not.toBe(401);
    });

    it('passes auth for creator', async () => {
      const res = await authRequest('GET', '/api/users/me', TENANT_A_CREATOR);
      expect(res.status).not.toBe(401);
    });

    it('passes auth for viewer', async () => {
      const res = await authRequest('GET', '/api/users/me', TENANT_A_VIEWER);
      expect(res.status).not.toBe(401);
    });
  });

  describe('GET /api/users (admin only)', () => {
    it('returns 401 without auth', async () => {
      const res = await app.request('/api/users', undefined, TEST_ENV);
      expect(res.status).toBe(401);
    });

    it('admin passes auth (not 401)', async () => {
      const res = await authRequest('GET', '/api/users', TENANT_A_ADMIN);
      expect(res.status).not.toBe(401);
    });

    it('creator does not get 200', async () => {
      const res = await authRequest('GET', '/api/users', TENANT_A_CREATOR);
      expect(res.status).not.toBe(200);
    });

    it('viewer does not get 200', async () => {
      const res = await authRequest('GET', '/api/users', TENANT_A_VIEWER);
      expect(res.status).not.toBe(200);
    });
  });

  describe('PATCH /api/users/:id/role', () => {
    it('returns 401 without auth', async () => {
      const res = await app.request('/api/users/some-id/role', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ role: 'admin' }),
      }, TEST_ENV);
      expect(res.status).toBe(401);
    });

    it('non-admin does not get 200', async () => {
      const res = await authRequest('PATCH', '/api/users/some-id/role', TENANT_A_CREATOR, {
        role: 'admin',
      });
      expect(res.status).not.toBe(200);
    });

    it('admin passes auth (not 401)', async () => {
      const res = await authRequest('PATCH', '/api/users/other-user-id/role', TENANT_A_ADMIN, {
        role: 'creator',
      });
      expect(res.status).not.toBe(401);
    });
  });
});

describe('Tenants routes', () => {
  describe('GET /api/tenants/me', () => {
    it('returns 401 without auth', async () => {
      const res = await app.request('/api/tenants/me', undefined, TEST_ENV);
      expect(res.status).toBe(401);
    });

    it('passes auth for any role', async () => {
      const res = await authRequest('GET', '/api/tenants/me', TENANT_A_VIEWER);
      expect(res.status).not.toBe(401);
    });
  });

  describe('PATCH /api/tenants/me (admin only)', () => {
    it('non-admin does not get 200', async () => {
      const res = await authRequest('PATCH', '/api/tenants/me', TENANT_A_CREATOR, {
        maxApps: 100,
      });
      expect(res.status).not.toBe(200);
    });

    it('admin passes auth (not 401)', async () => {
      const res = await authRequest('PATCH', '/api/tenants/me', TENANT_A_ADMIN, {
        maxApps: 100,
      });
      expect(res.status).not.toBe(401);
    });
  });

  describe('GET /api/tenants/me/stats', () => {
    it('returns 401 without auth', async () => {
      const res = await app.request('/api/tenants/me/stats', undefined, TEST_ENV);
      expect(res.status).toBe(401);
    });

    it('passes auth', async () => {
      const res = await authRequest('GET', '/api/tenants/me/stats', TENANT_A_ADMIN);
      expect(res.status).not.toBe(401);
    });
  });
});
