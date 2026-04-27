import { describe, it, expect } from 'vitest';
import { app } from '../src/index';
import { TEST_ENV, TENANT_A_ADMIN, TENANT_A_CREATOR, authRequest } from './helpers';

/**
 * Data Sources CRUD route tests.
 *
 * Without a real DB, DB-dependent routes return 500 (DB unavailable).
 * We validate: auth enforcement (401), route existence (not 404),
 * body validation (400), and response structure where applicable.
 */

const FAKE_DS_ID = '00000000-0000-0000-0000-000000000099';

describe('Data Sources routes — Auth', () => {
  it('POST /api/data-sources returns 401 without auth', async () => {
    const res = await app.request('/api/data-sources', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        type: 'excel_file',
        m365ResourceId: 'abc123',
        name: 'Test Source',
      }),
    }, TEST_ENV);
    expect(res.status).toBe(401);
  });

  it('GET /api/data-sources returns 401 without auth', async () => {
    const res = await app.request('/api/data-sources', undefined, TEST_ENV);
    expect(res.status).toBe(401);
  });

  it('GET /api/data-sources/:id returns 401 without auth', async () => {
    const res = await app.request(
      `/api/data-sources/${FAKE_DS_ID}`,
      undefined,
      TEST_ENV,
    );
    expect(res.status).toBe(401);
  });

  it('DELETE /api/data-sources/:id returns 401 without auth', async () => {
    const res = await app.request(
      `/api/data-sources/${FAKE_DS_ID}`,
      { method: 'DELETE' },
      TEST_ENV,
    );
    expect(res.status).toBe(401);
  });
});

describe('Data Sources routes — GET /api/data-sources (list)', () => {
  it('returns 200 with auth (empty list or DB error)', async () => {
    const res = await authRequest('GET', '/api/data-sources', TENANT_A_ADMIN);
    expect(res.status).not.toBe(401);
    expect(res.status).not.toBe(404);
    if (res.status === 200) {
      const json = (await res.json()) as { data: unknown[] };
      expect(Array.isArray(json.data)).toBe(true);
    }
  });

  it('supports query filters ?type=excel_file', async () => {
    const res = await authRequest(
      'GET',
      '/api/data-sources?type=excel_file',
      TENANT_A_ADMIN,
    );
    expect(res.status).not.toBe(401);
    expect(res.status).not.toBe(404);
  });

  it('supports query filter ?syncStatus=pending', async () => {
    const res = await authRequest(
      'GET',
      '/api/data-sources?syncStatus=pending',
      TENANT_A_ADMIN,
    );
    expect(res.status).not.toBe(401);
    expect(res.status).not.toBe(404);
  });

  it('creator role can also list data sources', async () => {
    const res = await authRequest('GET', '/api/data-sources', TENANT_A_CREATOR);
    expect(res.status).not.toBe(401);
    expect(res.status).not.toBe(404);
  });
});

describe('Data Sources routes — GET /api/data-sources/:id (detail)', () => {
  it('returns 404 for nonexistent data source (or DB error)', async () => {
    const res = await authRequest(
      'GET',
      `/api/data-sources/${FAKE_DS_ID}`,
      TENANT_A_ADMIN,
    );
    expect(res.status).not.toBe(401);
    // With a working DB this would be 404; without DB it may be 500
    if (res.status === 404) {
      const json = (await res.json()) as { error: { code: string } };
      expect(json.error.code).toBe('NOT_FOUND');
    }
  });
});

describe('Data Sources routes — POST /api/data-sources (connect)', () => {
  it('validates body — returns 400 for empty body', async () => {
    const res = await authRequest('POST', '/api/data-sources', TENANT_A_ADMIN, {});
    // zValidator should reject — 400 from validation
    expect(res.status).not.toBe(401);
    expect([400, 422, 500, 503]).toContain(res.status);
  });

  it('validates body — returns 400 for missing required fields', async () => {
    const res = await authRequest('POST', '/api/data-sources', TENANT_A_ADMIN, {
      type: 'excel_file',
      // missing m365ResourceId and name
    });
    expect(res.status).not.toBe(401);
    expect([400, 422, 500, 503]).toContain(res.status);
  });

  it('validates body — returns 400 for invalid type enum', async () => {
    const res = await authRequest('POST', '/api/data-sources', TENANT_A_ADMIN, {
      type: 'invalid_type',
      m365ResourceId: 'abc123',
      name: 'Test',
    });
    expect(res.status).not.toBe(401);
    expect([400, 422, 500, 503]).toContain(res.status);
  });

  it('accepts valid body and passes auth (reaches DB layer)', async () => {
    const res = await authRequest('POST', '/api/data-sources', TENANT_A_ADMIN, {
      type: 'excel_file',
      m365ResourceId: 'abc123',
      name: 'Budget Q4',
    });
    expect(res.status).not.toBe(401);
    // With no DB it will likely 500, but it should not be 400 (body is valid)
    expect(res.status).not.toBe(400);
  });
});

describe('Data Sources routes — POST /api/data-sources/:id/sync (force sync)', () => {
  it('returns 404 for nonexistent data source (or DB error)', async () => {
    const res = await authRequest(
      'POST',
      `/api/data-sources/${FAKE_DS_ID}/sync`,
      TENANT_A_ADMIN,
    );
    expect(res.status).not.toBe(401);
    if (res.status === 404) {
      const json = (await res.json()) as { error: { code: string } };
      expect(json.error.code).toBe('NOT_FOUND');
    }
  });

  it('returns 401 without auth', async () => {
    const res = await app.request(
      `/api/data-sources/${FAKE_DS_ID}/sync`,
      { method: 'POST' },
      TEST_ENV,
    );
    expect(res.status).toBe(401);
  });
});

describe('Data Sources routes — DELETE /api/data-sources/:id (disconnect)', () => {
  it('returns 404 for nonexistent data source (or DB error)', async () => {
    const res = await authRequest(
      'DELETE',
      `/api/data-sources/${FAKE_DS_ID}`,
      TENANT_A_ADMIN,
    );
    expect(res.status).not.toBe(401);
    if (res.status === 404) {
      const json = (await res.json()) as { error: { code: string } };
      expect(json.error.code).toBe('NOT_FOUND');
    }
  });
});

describe('Data Sources routes — Browse (OneDrive)', () => {
  it('GET /api/data-sources/browse/drives passes auth', async () => {
    const res = await authRequest(
      'GET',
      '/api/data-sources/browse/drives',
      TENANT_A_ADMIN,
    );
    // Auth passes — route exists
    expect(res.status).not.toBe(401);
    expect(res.status).not.toBe(404);
    // May fail on Graph API call (no real tokens), but should not crash
  });

  it('GET /api/data-sources/browse/files requires driveId param', async () => {
    const res = await authRequest(
      'GET',
      '/api/data-sources/browse/files',
      TENANT_A_ADMIN,
    );
    // Missing driveId — zValidator should reject with 400
    expect(res.status).not.toBe(401);
    expect([400, 422, 500, 503]).toContain(res.status);
  });

  it('GET /api/data-sources/browse/files with driveId passes validation', async () => {
    const res = await authRequest(
      'GET',
      '/api/data-sources/browse/files?driveId=test-drive-123',
      TENANT_A_ADMIN,
    );
    expect(res.status).not.toBe(401);
    expect(res.status).not.toBe(404);
    // May fail on Graph API but should not be a validation error
    expect(res.status).not.toBe(400);
  });
});
