/**
 * Sync system types — @CORTEX owns this file.
 *
 * Type contracts for the Excel/SharePoint sync engine,
 * KV cache, app data API, and file browser.
 */

import type { DataSourceType, SyncStatus } from './data-source.types';

/** Result of a single data source sync operation */
export interface SyncResult {
  readonly dataSourceId: string;
  readonly status: 'unchanged' | 'updated' | 'error';
  readonly rowCount: number;
  readonly columnCount: number;
  readonly contentHash: string;
  readonly durationMs: number;
  readonly errorMessage?: string;
}

/** Error codes for sync failures */
export type SyncErrorCode =
  | 'TOKEN_EXPIRED'
  | 'TOKEN_REFRESH_FAILED'
  | 'FILE_NOT_FOUND'
  | 'PERMISSION_DENIED'
  | 'RATE_LIMITED'
  | 'PARSE_ERROR'
  | 'CACHE_WRITE_FAILED'
  | 'DATA_SOURCE_NOT_FOUND'
  | 'NO_USER_TOKENS'
  | 'UNKNOWN';

/** Structured sync error */
export interface SyncError {
  readonly code: SyncErrorCode;
  readonly message: string;
  readonly retryable: boolean;
  readonly retryAfterMs?: number;
}

/** Column metadata stored in cache */
export interface CachedColumn {
  readonly name: string;
  readonly originalName: string;
  readonly type: string;
  readonly nullable: boolean;
}

/** Shape of data stored in KV cache */
export interface CacheEntry {
  readonly columns: readonly CachedColumn[];
  readonly rows: readonly Record<string, unknown>[];
  readonly totalRows: number;
  readonly contentHash: string;
  readonly syncedAt: string;
  readonly dataSourceId: string;
  readonly sourceType: DataSourceType;
}

/** API response shape for app data endpoint */
export interface AppDataResponse {
  readonly columns: readonly CachedColumn[];
  readonly rows: readonly Record<string, unknown>[];
  readonly total: number;
  readonly syncedAt: string;
  readonly syncStatus: SyncStatus;
}

/** Aggregation request item */
export interface AggregationRequest {
  readonly column: string;
  readonly operation: 'count' | 'sum' | 'avg' | 'min' | 'max';
}

/** Aggregation response item */
export interface AggregationResult {
  readonly column: string;
  readonly operation: string;
  readonly result: number;
}

/** Drive item for file browser */
export interface DriveItem {
  readonly id: string;
  readonly name: string;
  readonly type: 'file' | 'folder';
  readonly size: number;
  readonly lastModified: string;
  readonly webUrl: string;
  readonly mimeType?: string;
}

/** Browse drives response */
export interface BrowseDrivesResponse {
  readonly drives: readonly { readonly id: string; readonly name: string; readonly driveType: string }[];
}

/** Browse files response */
export interface BrowseFilesResponse {
  readonly items: readonly DriveItem[];
  readonly path: string;
}

/** Create data source request */
export interface CreateDataSourceRequest {
  readonly type: DataSourceType;
  readonly m365ResourceId: string;
  readonly name: string;
  readonly appId?: string;
  readonly sheetName?: string;
}
