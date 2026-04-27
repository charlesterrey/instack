/**
 * Data Cache Service — KV abstraction for sync data.
 * @CORTEX owns this file.
 *
 * Wraps Cloudflare KV with typed get/put/delete operations.
 * Business data is cached here with 5-minute TTL.
 * KV is ephemeral — M365 is ALWAYS the source of truth.
 *
 * Key format: sync:{tenantId}:{dataSourceId}:data
 * Meta format: sync:{tenantId}:{dataSourceId}:meta
 */

import type { Result } from '@instack/shared';
import { ok, err } from '@instack/shared';
import type { CacheEntry, SyncError } from '@instack/shared';

/** Default TTL for cached data (5 minutes) */
const DEFAULT_TTL_SECONDS = 300;

/** KV namespace interface (matches Cloudflare Workers KVNamespace) */
export interface KVNamespace {
  get(key: string, options?: { type?: 'text' | 'json' }): Promise<unknown>;
  put(key: string, value: string, options?: { expirationTtl?: number }): Promise<void>;
  delete(key: string): Promise<void>;
}

/** Build the data cache key */
export function buildCacheKey(tenantId: string, dataSourceId: string): string {
  return `sync:${tenantId}:${dataSourceId}:data`;
}

/** Build the metadata cache key (hash only, lightweight) */
export function buildMetaKey(tenantId: string, dataSourceId: string): string {
  return `sync:${tenantId}:${dataSourceId}:meta`;
}

/** Get cached data for a data source. Returns null on miss. */
export async function getCachedData(
  kv: KVNamespace,
  tenantId: string,
  dataSourceId: string,
): Promise<CacheEntry | null> {
  const key = buildCacheKey(tenantId, dataSourceId);
  const raw = await kv.get(key, { type: 'json' });
  if (!raw) return null;
  return raw as CacheEntry;
}

/** Write data to cache with configurable TTL. */
export async function setCachedData(
  kv: KVNamespace,
  tenantId: string,
  dataSourceId: string,
  entry: CacheEntry,
  ttlSeconds: number = DEFAULT_TTL_SECONDS,
): Promise<Result<void, SyncError>> {
  const key = buildCacheKey(tenantId, dataSourceId);
  const metaKey = buildMetaKey(tenantId, dataSourceId);

  try {
    const serialized = JSON.stringify(entry);

    // Check KV value size limit (25MB)
    if (serialized.length > 25 * 1024 * 1024) {
      return err({
        code: 'CACHE_WRITE_FAILED',
        message: `Data too large for KV cache: ${Math.round(serialized.length / 1024 / 1024)}MB (max 25MB)`,
        retryable: false,
      });
    }

    await kv.put(key, serialized, { expirationTtl: ttlSeconds });

    // Also store hash in meta key for lightweight delta checks
    await kv.put(
      metaKey,
      JSON.stringify({ contentHash: entry.contentHash, syncedAt: entry.syncedAt }),
      { expirationTtl: ttlSeconds },
    );

    return ok(undefined);
  } catch (caught: unknown) {
    const message = caught instanceof Error ? caught.message : String(caught);
    return err({
      code: 'CACHE_WRITE_FAILED',
      message: `KV write failed: ${message}`,
      retryable: true,
    });
  }
}

/** Invalidate cache for a data source (both data and meta keys) */
export async function invalidateCache(
  kv: KVNamespace,
  tenantId: string,
  dataSourceId: string,
): Promise<void> {
  const key = buildCacheKey(tenantId, dataSourceId);
  const metaKey = buildMetaKey(tenantId, dataSourceId);
  await Promise.all([kv.delete(key), kv.delete(metaKey)]);
}

/** Get content hash from meta key (lightweight read, avoids fetching full data) */
export async function getCachedHash(
  kv: KVNamespace,
  tenantId: string,
  dataSourceId: string,
): Promise<string | null> {
  const metaKey = buildMetaKey(tenantId, dataSourceId);
  const raw = await kv.get(metaKey, { type: 'json' });
  if (!raw || typeof raw !== 'object') return null;
  const meta = raw as { contentHash?: string };
  return meta.contentHash ?? null;
}
