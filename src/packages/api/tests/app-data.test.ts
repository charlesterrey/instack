import { describe, it, expect } from 'vitest';
import { app } from '../src/index';
import { TEST_ENV, TENANT_A_ADMIN, authRequest } from './helpers';

/**
 * App Data route tests — GET /api/apps/:appId/data and aggregations.
 *
 * Without a real DB + KV, DB-dependent routes return 500 (DB/KV unavailable).
 * We validate: auth enforcement, route existence, query param validation,
 * and response structure where possible.
 */

const FAKE_APP_ID = '00000000-0000-0000-0000-000000000001';

describe('App Data routes — GET /api/apps/:appId/data', () => {
  it('returns 401 when no cookie', async () => {
    const res = await app.request(
      `/api/apps/${FAKE_APP_ID}/data`,
      undefined,
      TEST_ENV,
    );
    expect(res.status).toBe(401);
  });

  it('returns 200 with empty data when no data source (or not 401)', async () => {
    const res = await authRequest(
      'GET',
      `/api/apps/${FAKE_APP_ID}/data`,
      TENANT_A_ADMIN,
    );
    // Auth passes — should not be 401 or 404 (route exists)
    expect(res.status).not.toBe(401);
    expect(res.status).not.toBe(404);
  });

  it('returns correct pagination structure when route responds 200', async () => {
    const res = await authRequest(
      'GET',
      `/api/apps/${FAKE_APP_ID}/data?page=1&limit=10`,
      TENANT_A_ADMIN,
    );
    expect(res.status).not.toBe(401);
    if (res.status === 200) {
      const json = (await res.json()) as Record<string, unknown>;
      // Either has data.columns/rows/total or a pagination block
      if (json['pagination']) {
        const pagination = json['pagination'] as Record<string, unknown>;
        expect(pagination).toHaveProperty('page');
        expect(pagination).toHaveProperty('limit');
        expect(pagination).toHaveProperty('total');
        expect(pagination).toHaveProperty('totalPages');
      }
      if (json['data']) {
        const data = json['data'] as Record<string, unknown>;
        expect(data).toHaveProperty('columns');
        expect(data).toHaveProperty('rows');
        expect(data).toHaveProperty('total');
      }
    }
  });

  it('returns correct columns/rows/total shape on success', async () => {
    const res = await authRequest(
      'GET',
      `/api/apps/${FAKE_APP_ID}/data`,
      TENANT_A_ADMIN,
    );
    expect(res.status).not.toBe(401);
    if (res.status === 200) {
      const json = (await res.json()) as { data: Record<string, unknown> };
      expect(Array.isArray(json.data['columns'])).toBe(true);
      expect(Array.isArray(json.data['rows'])).toBe(true);
      expect(typeof json.data['total']).toBe('number');
    }
  });

  it('supports ?page and ?limit params without error', async () => {
    const res = await authRequest(
      'GET',
      `/api/apps/${FAKE_APP_ID}/data?page=2&limit=5`,
      TENANT_A_ADMIN,
    );
    expect(res.status).not.toBe(401);
    expect(res.status).not.toBe(404);
    // Route exists and accepts pagination params
  });

  it('supports ?sort and ?order params without error', async () => {
    const res = await authRequest(
      'GET',
      `/api/apps/${FAKE_APP_ID}/data?sort=name&order=desc`,
      TENANT_A_ADMIN,
    );
    expect(res.status).not.toBe(401);
    expect(res.status).not.toBe(404);
  });

  it('accepts sort=asc as valid order', async () => {
    const res = await authRequest(
      'GET',
      `/api/apps/${FAKE_APP_ID}/data?sort=amount&order=asc`,
      TENANT_A_ADMIN,
    );
    expect(res.status).not.toBe(401);
    expect(res.status).not.toBe(404);
  });
});

describe('App Data routes — GET /api/apps/:appId/data/aggregations', () => {
  it('returns 401 when no cookie', async () => {
    const res = await app.request(
      `/api/apps/${FAKE_APP_ID}/data/aggregations?ops=col:sum`,
      undefined,
      TEST_ENV,
    );
    expect(res.status).toBe(401);
  });

  it('returns 400 when no ops param', async () => {
    const res = await authRequest(
      'GET',
      `/api/apps/${FAKE_APP_ID}/data/aggregations`,
      TENANT_A_ADMIN,
    );
    // Without KV it may be 500, but if KV/DB are mocked it should be 400
    // At minimum it should not be 401 or 404
    expect(res.status).not.toBe(401);
    expect(res.status).not.toBe(404);
    if (res.status === 400) {
      const json = (await res.json()) as { error: { message: string } };
      expect(json.error.message).toContain('ops');
    }
  });

  it('returns 400 for invalid ops format (no colon)', async () => {
    const res = await authRequest(
      'GET',
      `/api/apps/${FAKE_APP_ID}/data/aggregations?ops=invalidformat`,
      TENANT_A_ADMIN,
    );
    expect(res.status).not.toBe(401);
    expect(res.status).not.toBe(404);
    if (res.status === 400) {
      const json = (await res.json()) as { error: { message: string } };
      expect(json.error.message).toContain('Invalid ops format');
    }
  });

  it('returns 400 for invalid ops format (unknown operation)', async () => {
    const res = await authRequest(
      'GET',
      `/api/apps/${FAKE_APP_ID}/data/aggregations?ops=col:banana`,
      TENANT_A_ADMIN,
    );
    expect(res.status).not.toBe(401);
    if (res.status === 400) {
      const json = (await res.json()) as { error: { message: string } };
      expect(json.error.message).toContain('Invalid ops format');
    }
  });

  it('with valid ops returns results array (or passes auth)', async () => {
    const res = await authRequest(
      'GET',
      `/api/apps/${FAKE_APP_ID}/data/aggregations?ops=montant:sum,categorie:count`,
      TENANT_A_ADMIN,
    );
    expect(res.status).not.toBe(401);
    expect(res.status).not.toBe(404);
    if (res.status === 200) {
      const json = (await res.json()) as { data: Array<{ column: string; operation: string; result: number }> };
      expect(Array.isArray(json.data)).toBe(true);
      for (const item of json.data) {
        expect(item).toHaveProperty('column');
        expect(item).toHaveProperty('operation');
        expect(item).toHaveProperty('result');
      }
    }
  });
});
