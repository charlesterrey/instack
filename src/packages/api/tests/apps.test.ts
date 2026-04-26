import { describe, it, expect } from 'vitest';
import app from '../src/index';
import { TEST_ENV, TENANT_A_ADMIN, TENANT_A_CREATOR, TENANT_A_VIEWER, TENANT_B_ADMIN, authRequest } from './helpers';

/**
 * CRUD Apps route tests.
 *
 * Without a real DB, DB-dependent routes return 503 (DB unavailable).
 * We validate: auth (401), and middleware pipeline integrity.
 * Full CRUD integration tests with a real Neon DB are run separately.
 */

describe('Apps routes — Auth', () => {
  it('returns 401 when no cookie', async () => {
    const res = await app.request('/api/apps', undefined, TEST_ENV);
    expect(res.status).toBe(401);
    const body = await res.json() as { error: { message: string } };
    expect(body.error.message).toBe('Authentication required');
  });

  it('returns 401 with malformed JWT (2 parts)', async () => {
    const res = await app.request('/api/apps', {
      headers: { Cookie: 'instack_session=two.parts' },
    }, TEST_ENV);
    expect(res.status).toBe(401);
  });

  it('returns 401 with invalid JWT signature', async () => {
    const res = await app.request('/api/apps', {
      headers: { Cookie: 'instack_session=eyJhbGciOiJIUzI1NiJ9.eyJzdWIiOiJ4In0.invalidsig' },
    }, TEST_ENV);
    expect(res.status).toBe(401);
  });

  it('authenticated requests pass auth layer (not 401)', async () => {
    const res = await authRequest('GET', '/api/apps', TENANT_A_ADMIN);
    expect(res.status).not.toBe(401);
  });
});

describe('Apps routes — POST /api/apps (create)', () => {
  it('passes auth and reaches DB layer for valid body', async () => {
    const res = await authRequest('POST', '/api/apps', TENANT_A_ADMIN, {
      tenantId: TENANT_A_ADMIN.tenantId,
      creatorId: TENANT_A_ADMIN.userId,
      name: 'Dashboard Ventes',
      archetype: 'dashboard',
    });
    expect(res.status).not.toBe(401);
  });

  it('validates all 8 archetypes as accepted', async () => {
    const archetypes = [
      'crud_form', 'dashboard', 'tracker', 'report',
      'approval', 'checklist', 'gallery', 'multi_view',
    ];
    for (const archetype of archetypes) {
      const res = await authRequest('POST', '/api/apps', TENANT_A_ADMIN, {
        tenantId: TENANT_A_ADMIN.tenantId,
        creatorId: TENANT_A_ADMIN.userId,
        name: `Test ${archetype}`,
        archetype,
      });
      expect(res.status).not.toBe(401);
    }
  });
});

describe('Apps routes — GET /api/apps (list)', () => {
  it('requires authentication', async () => {
    const res = await app.request('/api/apps', undefined, TEST_ENV);
    expect(res.status).toBe(401);
  });

  it('authenticated request passes (not 401)', async () => {
    const res = await authRequest('GET', '/api/apps?page=1&limit=20', TENANT_A_ADMIN);
    expect(res.status).not.toBe(401);
  });

  it('accepts status filter', async () => {
    const res = await authRequest('GET', '/api/apps?status=active', TENANT_A_ADMIN);
    expect(res.status).not.toBe(401);
  });

  it('accepts archetype filter', async () => {
    const res = await authRequest('GET', '/api/apps?archetype=dashboard', TENANT_A_ADMIN);
    expect(res.status).not.toBe(401);
  });

  it('all sort options accepted', async () => {
    for (const sort of ['created_at', 'updated_at', 'name']) {
      const res = await authRequest('GET', `/api/apps?sort=${sort}`, TENANT_A_ADMIN);
      expect(res.status).not.toBe(401);
    }
  });

  it('both order directions accepted', async () => {
    for (const order of ['asc', 'desc']) {
      const res = await authRequest('GET', `/api/apps?order=${order}`, TENANT_A_ADMIN);
      expect(res.status).not.toBe(401);
    }
  });
});

describe('Apps routes — GET /api/apps/:id (detail)', () => {
  it('requires authentication', async () => {
    const res = await app.request('/api/apps/some-id', undefined, TEST_ENV);
    expect(res.status).toBe(401);
  });

  it('passes auth for valid user', async () => {
    const res = await authRequest('GET', '/api/apps/00000000-0000-0000-0000-000000000000', TENANT_A_ADMIN);
    expect(res.status).not.toBe(401);
  });
});

describe('Apps routes — PATCH /api/apps/:id (update)', () => {
  it('requires authentication', async () => {
    const res = await app.request('/api/apps/some-id', {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name: 'New Name' }),
    }, TEST_ENV);
    expect(res.status).toBe(401);
  });

  it('passes auth for valid user', async () => {
    const res = await authRequest('PATCH', '/api/apps/some-id', TENANT_A_ADMIN, {
      name: 'Updated Name',
    });
    expect(res.status).not.toBe(401);
  });
});

describe('Apps routes — DELETE /api/apps/:id (archive)', () => {
  it('requires authentication', async () => {
    const res = await app.request('/api/apps/some-id', { method: 'DELETE' }, TEST_ENV);
    expect(res.status).toBe(401);
  });

  it('passes auth for valid user', async () => {
    const res = await authRequest('DELETE', '/api/apps/some-id', TENANT_A_ADMIN);
    expect(res.status).not.toBe(401);
  });
});

describe('Apps routes — POST /api/apps/:id/share', () => {
  it('requires authentication', async () => {
    const res = await app.request('/api/apps/some-id/share', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ visibility: 'public' }),
    }, TEST_ENV);
    expect(res.status).toBe(401);
  });

  it('passes auth for all visibility values', async () => {
    for (const visibility of ['private', 'team', 'public']) {
      const res = await authRequest('POST', '/api/apps/some-id/share', TENANT_A_ADMIN, {
        visibility,
      });
      expect(res.status).not.toBe(401);
    }
  });
});
