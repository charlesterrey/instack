/**
 * Graph API Service — Access Excel files and SharePoint lists via Microsoft Graph.
 * ALL requests go through the token proxy (proxyGraphCall). OAuth tokens are NEVER
 * exposed to calling code.
 *
 * @module graph-api.service
 * @agent @CONDUIT — Integration Engineer
 */

import { logger } from '../lib/logger';

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

/** Proxy call function signature — matches proxyGraphCall from token-proxy.service.ts */
export type ProxyCallFn = (
  endpoint: string,
  method: 'GET' | 'POST',
  body?: unknown,
) => Promise<{ ok: boolean; data?: unknown; error?: string; status: number }>;

/** Minimal Drive item returned by search */
export interface DriveFileInfo {
  readonly id: string;
  readonly name: string;
  readonly size: number;
  readonly lastModified: string;
  readonly webUrl: string;
}

/** SharePoint list summary */
export interface SharePointListInfo {
  readonly id: string;
  readonly name: string;
  readonly description: string;
  readonly itemCount: number;
  readonly createdAt: string;
}

/** SharePoint list item (generic key-value fields) */
export interface SharePointListItem {
  readonly id: string;
  readonly fields: Record<string, unknown>;
}

/** Result type for all Graph API service functions */
type GraphServiceResult<T> =
  | { readonly ok: true; readonly data: T }
  | { readonly ok: false; readonly error: string; readonly status: number };

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

/**
 * Map Graph API HTTP status codes to human-readable error messages.
 * Security: never expose raw Graph API responses to callers.
 */
function mapGraphError(status: number, fallbackMessage?: string): { error: string; status: number } {
  switch (status) {
    case 401:
      return { error: 'Token expired, please re-authenticate', status: 401 };
    case 403:
      return { error: 'Permission denied', status: 403 };
    case 404:
      return { error: 'File not found', status: 404 };
    case 429:
      return { error: 'Microsoft rate limited, retry later', status: 429 };
    default:
      return { error: fallbackMessage ?? `Graph API error (${status})`, status };
  }
}

/** Type guard for Graph search response shape */
function isSearchResponse(data: unknown): data is { value: ReadonlyArray<Record<string, unknown>> } {
  return (
    typeof data === 'object' &&
    data !== null &&
    'value' in data &&
    Array.isArray((data as Record<string, unknown>)['value'])
  );
}

// ---------------------------------------------------------------------------
// Service functions
// ---------------------------------------------------------------------------

/**
 * List Excel files (.xlsx) accessible to the authenticated user from OneDrive.
 *
 * Uses the Graph search endpoint limited to 50 results.
 */
export async function listDriveFiles(
  proxyCall: ProxyCallFn,
  _userId: string,
): Promise<GraphServiceResult<readonly DriveFileInfo[]>> {
  const endpoint = "/me/drive/root/search(q='.xlsx')?$top=50&$select=id,name,size,lastModifiedDateTime,webUrl";

  const result = await proxyCall(endpoint, 'GET');

  if (!result.ok) {
    const mapped = mapGraphError(result.status, result.error);
    logger.warn('listDriveFiles failed', { status: result.status, error: mapped.error });
    return { ok: false, error: mapped.error, status: mapped.status };
  }

  if (!isSearchResponse(result.data)) {
    return { ok: true, data: [] };
  }

  const files: DriveFileInfo[] = result.data.value.map((item) => ({
    id: String(item['id'] ?? ''),
    name: String(item['name'] ?? ''),
    size: typeof item['size'] === 'number' ? item['size'] : 0,
    lastModified: String(item['lastModifiedDateTime'] ?? ''),
    webUrl: String(item['webUrl'] ?? ''),
  }));

  logger.info('listDriveFiles success', { count: files.length });
  return { ok: true, data: files };
}

/**
 * Download the raw content of an Excel file from OneDrive.
 *
 * Returns the content endpoint URL result — the caller is responsible for
 * interpreting the binary data (e.g. via ExcelJS or xlsx library).
 */
export async function getExcelContent(
  proxyCall: ProxyCallFn,
  fileId: string,
): Promise<GraphServiceResult<unknown>> {
  if (!fileId || fileId.trim().length === 0) {
    return { ok: false, error: 'File ID is required', status: 400 };
  }

  const endpoint = `/me/drive/items/${encodeURIComponent(fileId)}/content`;

  const result = await proxyCall(endpoint, 'GET');

  if (!result.ok) {
    const mapped = mapGraphError(result.status, result.error);
    logger.warn('getExcelContent failed', { fileId, status: result.status, error: mapped.error });
    return { ok: false, error: mapped.error, status: mapped.status };
  }

  logger.info('getExcelContent success', { fileId });
  return { ok: true, data: result.data };
}

/**
 * List SharePoint lists for a given site.
 */
export async function listSharePointLists(
  proxyCall: ProxyCallFn,
  siteId: string,
): Promise<GraphServiceResult<readonly SharePointListInfo[]>> {
  if (!siteId || siteId.trim().length === 0) {
    return { ok: false, error: 'Site ID is required', status: 400 };
  }

  const endpoint = `/sites/${encodeURIComponent(siteId)}/lists?$select=id,displayName,description,list`;

  const result = await proxyCall(endpoint, 'GET');

  if (!result.ok) {
    const mapped = mapGraphError(result.status, result.error);
    logger.warn('listSharePointLists failed', { siteId, status: result.status, error: mapped.error });
    return { ok: false, error: mapped.error, status: mapped.status };
  }

  if (!isSearchResponse(result.data)) {
    return { ok: true, data: [] };
  }

  const lists: SharePointListInfo[] = result.data.value.map((item) => {
    const listInfo = item['list'] as Record<string, unknown> | undefined;
    return {
      id: String(item['id'] ?? ''),
      name: String(item['displayName'] ?? ''),
      description: String(item['description'] ?? ''),
      itemCount: typeof listInfo?.['contentTypesEnabled'] === 'number' ? listInfo['contentTypesEnabled'] : 0,
      createdAt: String(item['createdDateTime'] ?? ''),
    };
  });

  logger.info('listSharePointLists success', { siteId, count: lists.length });
  return { ok: true, data: lists };
}

/**
 * Read items from a SharePoint list.
 */
export async function getSharePointListItems(
  proxyCall: ProxyCallFn,
  siteId: string,
  listId: string,
): Promise<GraphServiceResult<readonly SharePointListItem[]>> {
  if (!siteId || siteId.trim().length === 0) {
    return { ok: false, error: 'Site ID is required', status: 400 };
  }
  if (!listId || listId.trim().length === 0) {
    return { ok: false, error: 'List ID is required', status: 400 };
  }

  const endpoint = `/sites/${encodeURIComponent(siteId)}/lists/${encodeURIComponent(listId)}/items?$expand=fields`;

  const result = await proxyCall(endpoint, 'GET');

  if (!result.ok) {
    const mapped = mapGraphError(result.status, result.error);
    logger.warn('getSharePointListItems failed', { siteId, listId, status: result.status, error: mapped.error });
    return { ok: false, error: mapped.error, status: mapped.status };
  }

  if (!isSearchResponse(result.data)) {
    return { ok: true, data: [] };
  }

  const items: SharePointListItem[] = result.data.value.map((item) => ({
    id: String(item['id'] ?? ''),
    fields: (typeof item['fields'] === 'object' && item['fields'] !== null
      ? item['fields']
      : {}) as Record<string, unknown>,
  }));

  logger.info('getSharePointListItems success', { siteId, listId, count: items.length });
  return { ok: true, data: items };
}
