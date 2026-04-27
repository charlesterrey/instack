/**
 * Sync Engine Service -- Core data synchronization for Excel and SharePoint sources.
 *
 * Orchestrates the full sync lifecycle:
 *   1. Fetch data source config from DB
 *   2. Delta detection via SHA-256 content hashing
 *   3. Data retrieval through Graph API (token proxy)
 *   4. Parse + type-infer columns
 *   5. Write to KV cache
 *   6. Update DB status
 *
 * ALL Graph API calls go through `proxyCall` -- OAuth tokens are NEVER visible.
 *
 * @module sync-engine.service
 * @agent @CONDUIT -- Integration Engineer
 * @sprint S06 -- Excel Sync
 */

import { ok, err } from '@instack/shared';
import type {
  Result,
  SyncResult,
  SyncError,
  SyncErrorCode,
  CacheEntry,
  CachedColumn,
  SyncConfig,
} from '@instack/shared';
import { eq } from 'drizzle-orm';

import { logger } from '../lib/logger';
import * as schema from '../../drizzle/schema';
import type { KVNamespace } from './data-cache.service';
import { getCachedHash, setCachedData } from './data-cache.service';
import { getSharePointListItems } from './graph-api.service';
import type { ProxyCallFn } from './graph-api.service';

// Re-export types consumed by callers (routes, cron)
export type { SyncResult, SyncError, CachedColumn };

// ---------------------------------------------------------------------------
// Dependencies interface
// ---------------------------------------------------------------------------

/** Injected dependencies for the sync engine */
export interface SyncDependencies {
  /** Drizzle DB instance */
  readonly db: unknown;
  /** Cloudflare KV namespace for data caching */
  readonly kv: KVNamespace;
  /** AES-256-GCM encryption key (hex) */
  readonly encryptionKey: string;
  /** OAuth config for token proxy (passed through, never consumed directly) */
  readonly oauthConfig: {
    readonly clientId: string;
    readonly clientSecret: string;
    readonly tenantId: string;
    readonly redirectUri: string;
  };
}

// ---------------------------------------------------------------------------
// Internal types
// ---------------------------------------------------------------------------

/** Shape returned by Graph API usedRange endpoint */
interface UsedRangeResponse {
  readonly address?: string;
  readonly values?: ReadonlyArray<ReadonlyArray<unknown>>;
}

/** Parsed data source row from DB */
interface DataSourceRow {
  readonly id: string;
  readonly tenantId: string;
  readonly appId: string | null;
  readonly sourceType: 'excel_file' | 'sharepoint_list' | 'demo_data';
  readonly m365ResourceId: string | null;
  readonly syncConfig: unknown;
  readonly lastSyncedAt: Date | null;
  readonly syncStatus: string;
}

/** Intermediate result from fetch + parse step */
interface ParsedContent {
  readonly rawContentString: string;
  readonly headers: string[];
  readonly rows: Record<string, unknown>[];
}

// ---------------------------------------------------------------------------
// Drizzle DB facade type (avoids importing full Drizzle generics)
// ---------------------------------------------------------------------------

/** Minimal shape of the Drizzle DB instance used by this service */
interface DrizzleDb {
  select(): {
    from(table: unknown): {
      where(condition: unknown): Promise<unknown[]>;
    };
  };
  update(table: unknown): {
    set(values: unknown): {
      where(condition: unknown): Promise<unknown>;
    };
  };
}

// ---------------------------------------------------------------------------
// Type guards
// ---------------------------------------------------------------------------

/** Type guard for the Graph API usedRange response */
function isUsedRangeResponse(data: unknown): data is UsedRangeResponse {
  if (typeof data !== 'object' || data === null) return false;
  const record = data as Record<string, unknown>;
  return Array.isArray(record['values']);
}

/** Safely extract SyncConfig from JSONB */
function parseSyncConfig(raw: unknown): SyncConfig {
  if (typeof raw === 'object' && raw !== null) {
    return raw as SyncConfig;
  }
  return {};
}

// ---------------------------------------------------------------------------
// Public: computeContentHash
// ---------------------------------------------------------------------------

/**
 * Compute a SHA-256 hex digest of the given string via Web Crypto API.
 * Cloudflare Workers compatible (uses `crypto.subtle`).
 */
export async function computeContentHash(data: string): Promise<string> {
  const encoder = new TextEncoder();
  const buffer = encoder.encode(data);
  const hashBuffer = await crypto.subtle.digest('SHA-256', buffer);
  const hashArray = new Uint8Array(hashBuffer);

  let hex = '';
  for (let i = 0; i < hashArray.length; i++) {
    const byte = hashArray[i];
    if (byte !== undefined) {
      hex += byte.toString(16).padStart(2, '0');
    }
  }
  return hex;
}

// ---------------------------------------------------------------------------
// Public: parseExcelUsedRange
// ---------------------------------------------------------------------------

/**
 * Parse the Graph API usedRange response into headers and typed rows.
 *
 * The usedRange endpoint returns `{ values: unknown[][] }` where the first
 * row contains headers and subsequent rows contain data.
 */
export function parseExcelUsedRange(
  rangeData: unknown,
): { headers: string[]; rows: Record<string, unknown>[] } {
  if (!isUsedRangeResponse(rangeData) || !rangeData.values || rangeData.values.length === 0) {
    return { headers: [], rows: [] };
  }

  const rawValues = rangeData.values;
  const firstRow = rawValues[0];
  if (!firstRow || firstRow.length === 0) {
    return { headers: [], rows: [] };
  }

  // First row = headers, sanitized to trimmed strings
  const headers: string[] = firstRow.map((cell) => {
    const raw = cell === null || cell === undefined ? '' : String(cell);
    return raw.trim();
  });

  // Subsequent rows = data, keyed by header name
  const rows: Record<string, unknown>[] = [];
  for (let r = 1; r < rawValues.length; r++) {
    const rawRow = rawValues[r];
    if (!rawRow) continue;

    const row: Record<string, unknown> = {};
    for (let c = 0; c < headers.length; c++) {
      const header = headers[c];
      if (header !== undefined && header !== '') {
        row[header] = rawRow[c] ?? null;
      }
    }
    rows.push(row);
  }

  return { headers, rows };
}

// ---------------------------------------------------------------------------
// Public: inferColumnsFromRows
// ---------------------------------------------------------------------------

/** ISO 8601 date pattern */
const ISO_DATE_REGEX =
  /^\d{4}-\d{2}-\d{2}(T\d{2}:\d{2}(:\d{2})?(\.\d+)?(Z|[+-]\d{2}:\d{2})?)?$/;

/** Common dd/mm/yyyy or mm-dd-yyyy patterns */
const COMMON_DATE_REGEX = /^\d{1,2}[/-]\d{1,2}[/-]\d{2,4}$/;

function isLikelyDate(value: string): boolean {
  return ISO_DATE_REGEX.test(value) || COMMON_DATE_REGEX.test(value);
}

/**
 * Infer column types from data rows. Performs basic type inference:
 * - `number` if all non-null values are numeric
 * - `date` if values match ISO 8601 or common date patterns
 * - `text` as fallback
 */
export function inferColumnsFromRows(
  headers: string[],
  rows: readonly Record<string, unknown>[],
): CachedColumn[] {
  return headers
    .filter((h) => h !== '')
    .map((header): CachedColumn => {
      let hasNull = false;
      let allNumbers = true;
      let allDates = true;
      let sampledCount = 0;

      for (const row of rows) {
        const val = row[header];

        if (val === null || val === undefined || val === '') {
          hasNull = true;
          continue;
        }

        sampledCount++;

        if (typeof val === 'number') {
          // Numbers are never dates
          allDates = false;
        } else if (typeof val === 'string') {
          const trimmed = val.trim();
          if (trimmed === '') {
            hasNull = true;
            continue;
          }

          // Number check for string values
          if (isNaN(Number(trimmed))) {
            allNumbers = false;
          }

          // Date check
          if (!isLikelyDate(trimmed)) {
            allDates = false;
          }
        } else {
          allNumbers = false;
          allDates = false;
        }
      }

      // Determine type (need at least 1 non-null sample)
      let inferredType: string;
      if (sampledCount === 0) {
        inferredType = 'text';
      } else if (allNumbers) {
        inferredType = 'number';
      } else if (allDates) {
        inferredType = 'date';
      } else {
        inferredType = 'text';
      }

      // Sanitize column name: lowercase, replace non-alphanum with underscore
      const safeName = header
        .toLowerCase()
        .replace(/[^a-z0-9_]/g, '_')
        .replace(/_+/g, '_')
        .replace(/^_|_$/g, '');

      return {
        name: safeName || `col_${headers.indexOf(header)}`,
        originalName: header,
        type: inferredType,
        nullable: hasNull,
      };
    });
}

// ---------------------------------------------------------------------------
// Error mapping
// ---------------------------------------------------------------------------

/** Map Graph API HTTP status to a structured SyncError */
function mapGraphErrorToSyncError(status: number, errorMessage: string): SyncError {
  const code: SyncErrorCode = (() => {
    switch (status) {
      case 401: return 'TOKEN_EXPIRED';
      case 403: return 'PERMISSION_DENIED';
      case 404: return 'FILE_NOT_FOUND';
      case 429: return 'RATE_LIMITED';
      default:  return 'UNKNOWN';
    }
  })();

  return {
    code,
    message: `Graph API ${status}: ${errorMessage}`,
    retryable: status === 401 || status === 429 || status >= 500,
    ...(status === 429 ? { retryAfterMs: 60_000 } : {}),
  };
}

// ---------------------------------------------------------------------------
// Core: syncDataSource
// ---------------------------------------------------------------------------

/**
 * Synchronize a single data source from Microsoft 365 into the KV cache.
 *
 * Flow:
 *   1. Load data source from DB
 *   2. Read cached content hash for delta detection
 *   3. Fetch data via Graph API (proxyCall)
 *   4. Compute SHA-256 hash; skip if unchanged
 *   5. Parse data into columns + rows
 *   6. Write to KV cache
 *   7. Update DB sync status
 *
 * @param dataSourceId - UUID of the data source to sync
 * @param tenantId - Tenant UUID (for isolation verification)
 * @param _userId - User UUID (for audit; proxy call already scoped)
 * @param proxyCall - Token-proxied Graph API call function
 * @param deps - Injected dependencies (db, kv, encryption, oauth)
 */
export async function syncDataSource(
  dataSourceId: string,
  tenantId: string,
  _userId: string,
  proxyCall: ProxyCallFn,
  deps: SyncDependencies,
): Promise<Result<SyncResult, SyncError>> {
  const startTime = Date.now();
  const db = deps.db as DrizzleDb;

  logger.info('syncDataSource: starting', { dataSourceId, tenantId });

  // -------------------------------------------------------------------------
  // 1. Fetch data source config from DB
  // -------------------------------------------------------------------------
  let dsRows: DataSourceRow[];
  try {
    dsRows = (await db
      .select()
      .from(schema.dataSources)
      .where(eq(schema.dataSources.id, dataSourceId))) as unknown as DataSourceRow[];
  } catch (caught: unknown) {
    const message = caught instanceof Error ? caught.message : String(caught);
    logger.error('syncDataSource: DB query failed', { dataSourceId, error: message });
    return err({
      code: 'UNKNOWN',
      message: `Database query failed: ${message}`,
      retryable: true,
    });
  }

  const ds = dsRows[0];
  if (!ds) {
    logger.warn('syncDataSource: data source not found', { dataSourceId });
    return err({
      code: 'DATA_SOURCE_NOT_FOUND',
      message: `Data source ${dataSourceId} not found`,
      retryable: false,
    });
  }

  // Verify tenant isolation
  if (ds.tenantId !== tenantId) {
    logger.error('syncDataSource: tenant mismatch', {
      dataSourceId,
      expected: tenantId,
      actual: ds.tenantId,
    });
    return err({
      code: 'PERMISSION_DENIED',
      message: 'Data source does not belong to this tenant',
      retryable: false,
    });
  }

  const syncConfig = parseSyncConfig(ds.syncConfig);

  // -------------------------------------------------------------------------
  // 2. Update status to 'syncing'
  // -------------------------------------------------------------------------
  try {
    await db
      .update(schema.dataSources)
      .set({ syncStatus: 'syncing' as const })
      .where(eq(schema.dataSources.id, dataSourceId));
  } catch {
    // Non-fatal: continue with sync even if status update fails
    logger.warn('syncDataSource: failed to set syncing status', { dataSourceId });
  }

  // -------------------------------------------------------------------------
  // 3. Get cached hash for delta detection
  // -------------------------------------------------------------------------
  let cachedHash: string | null = null;
  try {
    cachedHash = await getCachedHash(deps.kv, tenantId, dataSourceId);
  } catch {
    // Non-fatal: treat as cache miss
    logger.warn('syncDataSource: getCachedHash failed, treating as cache miss', { dataSourceId });
  }

  // -------------------------------------------------------------------------
  // 4. Fetch data from Microsoft Graph
  // -------------------------------------------------------------------------
  let parsed: ParsedContent;

  if (ds.sourceType === 'excel_file') {
    const result = await fetchExcelData(proxyCall, ds.m365ResourceId, syncConfig);
    if (!result.ok) {
      await markSyncError(db, dataSourceId);
      return result;
    }
    parsed = result.value;
  } else if (ds.sourceType === 'sharepoint_list') {
    const result = await fetchSharePointData(proxyCall, ds.m365ResourceId);
    if (!result.ok) {
      await markSyncError(db, dataSourceId);
      return result;
    }
    parsed = result.value;
  } else {
    // demo_data -- nothing to sync from Graph
    logger.info('syncDataSource: demo_data source, no sync needed', { dataSourceId });
    return ok({
      dataSourceId,
      status: 'unchanged' as const,
      rowCount: 0,
      columnCount: 0,
      contentHash: '',
      durationMs: Date.now() - startTime,
    });
  }

  // -------------------------------------------------------------------------
  // 5. Compute content hash for delta detection
  // -------------------------------------------------------------------------
  const contentHash = await computeContentHash(parsed.rawContentString);

  // -------------------------------------------------------------------------
  // 6. Delta check: if hash matches cached hash, skip write
  // -------------------------------------------------------------------------
  if (cachedHash !== null && cachedHash === contentHash) {
    logger.info('syncDataSource: content unchanged', { dataSourceId, contentHash });

    try {
      await db
        .update(schema.dataSources)
        .set({
          syncStatus: 'synced' as const,
          lastSyncedAt: new Date(),
        })
        .where(eq(schema.dataSources.id, dataSourceId));
    } catch {
      logger.warn('syncDataSource: failed to update lastSyncedAt on unchanged', { dataSourceId });
    }

    return ok({
      dataSourceId,
      status: 'unchanged' as const,
      rowCount: parsed.rows.length,
      columnCount: parsed.headers.length,
      contentHash,
      durationMs: Date.now() - startTime,
    });
  }

  // -------------------------------------------------------------------------
  // 7. Infer column types
  // -------------------------------------------------------------------------
  const columns = inferColumnsFromRows(parsed.headers, parsed.rows);

  // -------------------------------------------------------------------------
  // 8. Build cache entry and write to KV
  // -------------------------------------------------------------------------
  const cacheEntry: CacheEntry = {
    columns,
    rows: parsed.rows,
    totalRows: parsed.rows.length,
    contentHash,
    syncedAt: new Date().toISOString(),
    dataSourceId,
    sourceType: ds.sourceType,
  };

  const cacheResult = await setCachedData(deps.kv, tenantId, dataSourceId, cacheEntry, 300);
  if (!cacheResult.ok) {
    logger.error('syncDataSource: cache write failed', {
      dataSourceId,
      error: cacheResult.error.message,
    });
    await markSyncError(db, dataSourceId);
    return err(cacheResult.error);
  }

  // -------------------------------------------------------------------------
  // 9. Update DB: synced status + content hash in syncConfig
  // -------------------------------------------------------------------------
  try {
    const updatedSyncConfig: SyncConfig = {
      ...syncConfig,
      lastContentHash: contentHash,
    };

    await db
      .update(schema.dataSources)
      .set({
        syncStatus: 'synced' as const,
        lastSyncedAt: new Date(),
        syncConfig: updatedSyncConfig,
      })
      .where(eq(schema.dataSources.id, dataSourceId));
  } catch (caught: unknown) {
    const message = caught instanceof Error ? caught.message : String(caught);
    logger.warn('syncDataSource: DB update after sync failed', { dataSourceId, error: message });
    // Non-fatal: data is already in KV cache
  }

  const durationMs = Date.now() - startTime;
  logger.info('syncDataSource: completed', {
    dataSourceId,
    rowCount: parsed.rows.length,
    columnCount: columns.length,
    contentHash,
    durationMs,
  });

  return ok({
    dataSourceId,
    status: 'updated' as const,
    rowCount: parsed.rows.length,
    columnCount: columns.length,
    contentHash,
    durationMs,
  });
}

// ---------------------------------------------------------------------------
// Internal: Excel file fetch + parse
// ---------------------------------------------------------------------------

async function fetchExcelData(
  proxyCall: ProxyCallFn,
  m365ResourceId: string | null,
  syncConfig: SyncConfig,
): Promise<Result<ParsedContent, SyncError>> {
  if (!m365ResourceId) {
    return err({
      code: 'FILE_NOT_FOUND',
      message: 'No m365ResourceId configured for this excel_file source',
      retryable: false,
    });
  }

  const sheetName = syncConfig.sheetName ?? 'Sheet1';
  const endpoint = `/me/drive/items/${encodeURIComponent(m365ResourceId)}/workbook/worksheets/${encodeURIComponent(sheetName)}/usedRange`;

  logger.info('fetchExcelData: requesting usedRange', { m365ResourceId, sheetName });

  const result = await proxyCall(endpoint, 'GET');

  if (!result.ok) {
    const syncError = mapGraphErrorToSyncError(result.status, result.error ?? 'Unknown error');
    logger.warn('fetchExcelData: Graph API call failed', {
      m365ResourceId,
      status: result.status,
      error: syncError.message,
    });
    return err(syncError);
  }

  const { headers, rows } = parseExcelUsedRange(result.data);

  if (headers.length === 0) {
    return err({
      code: 'PARSE_ERROR',
      message: 'Excel file returned empty or unparseable data',
      retryable: false,
    });
  }

  // Deterministic JSON for hashing
  const rawContentString = JSON.stringify(result.data);

  return ok({ rawContentString, headers, rows });
}

// ---------------------------------------------------------------------------
// Internal: SharePoint list fetch + parse
// ---------------------------------------------------------------------------

async function fetchSharePointData(
  proxyCall: ProxyCallFn,
  m365ResourceId: string | null,
): Promise<Result<ParsedContent, SyncError>> {
  if (!m365ResourceId) {
    return err({
      code: 'FILE_NOT_FOUND',
      message: 'No m365ResourceId configured for this sharepoint_list source',
      retryable: false,
    });
  }

  // m365ResourceId format for SharePoint lists: "siteId:listId"
  const separatorIdx = m365ResourceId.indexOf(':');
  if (separatorIdx === -1) {
    return err({
      code: 'PARSE_ERROR',
      message: 'Invalid m365ResourceId format for SharePoint list (expected "siteId:listId")',
      retryable: false,
    });
  }

  const siteId = m365ResourceId.slice(0, separatorIdx);
  const listId = m365ResourceId.slice(separatorIdx + 1);

  if (!siteId || !listId) {
    return err({
      code: 'PARSE_ERROR',
      message: 'Empty siteId or listId in m365ResourceId',
      retryable: false,
    });
  }

  logger.info('fetchSharePointData: requesting list items', { siteId, listId });

  const result = await getSharePointListItems(proxyCall, siteId, listId);

  if (!result.ok) {
    const syncError = mapGraphErrorToSyncError(result.status, result.error);
    logger.warn('fetchSharePointData: Graph API call failed', {
      siteId,
      listId,
      status: result.status,
      error: syncError.message,
    });
    return err(syncError);
  }

  const items = result.data;

  if (items.length === 0) {
    return ok({ rawContentString: '[]', headers: [], rows: [] });
  }

  // Extract headers from the union of all field keys, excluding SharePoint internal fields
  const internalPrefixes = ['@odata', 'odata', '_'];
  const headerSet = new Set<string>();
  for (const item of items) {
    for (const key of Object.keys(item.fields)) {
      const isInternal = internalPrefixes.some((prefix) => key.startsWith(prefix));
      if (!isInternal) {
        headerSet.add(key);
      }
    }
  }
  const headers = Array.from(headerSet).sort();

  // Convert items to flat rows keyed by field name
  const rows: Record<string, unknown>[] = items.map((item) => {
    const row: Record<string, unknown> = {};
    for (const header of headers) {
      row[header] = item.fields[header] ?? null;
    }
    return row;
  });

  const rawContentString = JSON.stringify(items);

  return ok({ rawContentString, headers, rows });
}

// ---------------------------------------------------------------------------
// Internal: DB error status helper
// ---------------------------------------------------------------------------

async function markSyncError(db: DrizzleDb, dataSourceId: string): Promise<void> {
  try {
    await db
      .update(schema.dataSources)
      .set({ syncStatus: 'error' as const })
      .where(eq(schema.dataSources.id, dataSourceId));
  } catch {
    logger.warn('markSyncError: failed to set error status', { dataSourceId });
  }
}
