/**
 * Tests for Data Cache Service — KV abstraction for sync data.
 *
 * Uses a mock KV namespace backed by a simple Map.
 *
 * @agent @CONDUIT — Integration Engineer
 * @sprint S06 — Excel Sync
 */

import { describe, it, expect } from 'vitest';
import {
  buildCacheKey,
  buildMetaKey,
  getCachedData,
  setCachedData,
  invalidateCache,
  getCachedHash,
} from '../src/services/data-cache.service';
import type { KVNamespace } from '../src/services/data-cache.service';
import type { CacheEntry } from '@instack/shared';

// ---------------------------------------------------------------------------
// Mock KV namespace
// ---------------------------------------------------------------------------

function createMockKV(): KVNamespace & { _store: Map<string, { value: string; ttl?: number }> } {
  const store = new Map<string, { value: string; ttl?: number }>();
  return {
    _store: store,
    get: async (key: string, options?: { type?: string }) => {
      const entry = store.get(key);
      if (!entry) return null;
      return options?.type === 'json' ? JSON.parse(entry.value) : entry.value;
    },
    put: async (key: string, value: string, options?: { expirationTtl?: number }) => {
      store.set(key, { value, ttl: options?.expirationTtl });
    },
    delete: async (key: string) => {
      store.delete(key);
    },
  };
}

// ---------------------------------------------------------------------------
// Test fixtures
// ---------------------------------------------------------------------------

const TENANT_ID = 'tenant-abc-123';
const DS_ID = 'ds-xyz-456';

function makeCacheEntry(overrides?: Partial<CacheEntry>): CacheEntry {
  return {
    columns: [
      { name: 'name', originalName: 'Name', type: 'text', nullable: false },
      { name: 'age', originalName: 'Age', type: 'number', nullable: true },
    ],
    rows: [
      { name: 'Alice', age: 30 },
      { name: 'Bob', age: null },
    ],
    totalRows: 2,
    contentHash: 'abc123def456',
    syncedAt: '2024-06-15T10:00:00.000Z',
    dataSourceId: DS_ID,
    sourceType: 'excel_file',
    ...overrides,
  };
}

// ---------------------------------------------------------------------------
// buildCacheKey / buildMetaKey
// ---------------------------------------------------------------------------

describe('buildCacheKey', () => {
  it('returns the correct format sync:{tenantId}:{dsId}:data', () => {
    const key = buildCacheKey(TENANT_ID, DS_ID);
    expect(key).toBe(`sync:${TENANT_ID}:${DS_ID}:data`);
  });
});

describe('buildMetaKey', () => {
  it('returns the correct format sync:{tenantId}:{dsId}:meta', () => {
    const key = buildMetaKey(TENANT_ID, DS_ID);
    expect(key).toBe(`sync:${TENANT_ID}:${DS_ID}:meta`);
  });
});

// ---------------------------------------------------------------------------
// getCachedData
// ---------------------------------------------------------------------------

describe('getCachedData', () => {
  it('returns null on cache miss', async () => {
    const kv = createMockKV();
    const result = await getCachedData(kv, TENANT_ID, DS_ID);
    expect(result).toBeNull();
  });

  it('returns cached data after setCachedData roundtrip', async () => {
    const kv = createMockKV();
    const entry = makeCacheEntry();

    await setCachedData(kv, TENANT_ID, DS_ID, entry);
    const result = await getCachedData(kv, TENANT_ID, DS_ID);

    expect(result).not.toBeNull();
    expect(result?.contentHash).toBe(entry.contentHash);
    expect(result?.totalRows).toBe(2);
    expect(result?.columns).toHaveLength(2);
    expect(result?.rows).toHaveLength(2);
    expect(result?.dataSourceId).toBe(DS_ID);
  });
});

// ---------------------------------------------------------------------------
// setCachedData
// ---------------------------------------------------------------------------

describe('setCachedData', () => {
  it('returns ok result on success', async () => {
    const kv = createMockKV();
    const entry = makeCacheEntry();
    const result = await setCachedData(kv, TENANT_ID, DS_ID, entry);
    expect(result.ok).toBe(true);
  });

  it('stores data with the specified TTL', async () => {
    const kv = createMockKV();
    const entry = makeCacheEntry();
    const customTtl = 600;

    await setCachedData(kv, TENANT_ID, DS_ID, entry, customTtl);

    const dataKey = buildCacheKey(TENANT_ID, DS_ID);
    const metaKey = buildMetaKey(TENANT_ID, DS_ID);

    const storedData = kv._store.get(dataKey);
    const storedMeta = kv._store.get(metaKey);

    expect(storedData?.ttl).toBe(customTtl);
    expect(storedMeta?.ttl).toBe(customTtl);
  });

  it('uses default TTL of 300 when not specified', async () => {
    const kv = createMockKV();
    const entry = makeCacheEntry();

    await setCachedData(kv, TENANT_ID, DS_ID, entry);

    const dataKey = buildCacheKey(TENANT_ID, DS_ID);
    const storedData = kv._store.get(dataKey);
    expect(storedData?.ttl).toBe(300);
  });

  it('writes both data and meta keys', async () => {
    const kv = createMockKV();
    const entry = makeCacheEntry();

    await setCachedData(kv, TENANT_ID, DS_ID, entry);

    const dataKey = buildCacheKey(TENANT_ID, DS_ID);
    const metaKey = buildMetaKey(TENANT_ID, DS_ID);

    expect(kv._store.has(dataKey)).toBe(true);
    expect(kv._store.has(metaKey)).toBe(true);
  });
});

// ---------------------------------------------------------------------------
// invalidateCache
// ---------------------------------------------------------------------------

describe('invalidateCache', () => {
  it('removes both data and meta keys', async () => {
    const kv = createMockKV();
    const entry = makeCacheEntry();

    await setCachedData(kv, TENANT_ID, DS_ID, entry);

    const dataKey = buildCacheKey(TENANT_ID, DS_ID);
    const metaKey = buildMetaKey(TENANT_ID, DS_ID);
    expect(kv._store.has(dataKey)).toBe(true);
    expect(kv._store.has(metaKey)).toBe(true);

    await invalidateCache(kv, TENANT_ID, DS_ID);

    expect(kv._store.has(dataKey)).toBe(false);
    expect(kv._store.has(metaKey)).toBe(false);
  });

  it('does not throw when keys do not exist', async () => {
    const kv = createMockKV();
    await expect(invalidateCache(kv, TENANT_ID, DS_ID)).resolves.toBeUndefined();
  });
});

// ---------------------------------------------------------------------------
// getCachedHash
// ---------------------------------------------------------------------------

describe('getCachedHash', () => {
  it('returns the content hash from the meta key', async () => {
    const kv = createMockKV();
    const entry = makeCacheEntry({ contentHash: 'sha256-deadbeef' });

    await setCachedData(kv, TENANT_ID, DS_ID, entry);
    const hash = await getCachedHash(kv, TENANT_ID, DS_ID);

    expect(hash).toBe('sha256-deadbeef');
  });

  it('returns null on cache miss', async () => {
    const kv = createMockKV();
    const hash = await getCachedHash(kv, TENANT_ID, DS_ID);
    expect(hash).toBeNull();
  });
});
