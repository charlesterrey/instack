/**
 * Tests for Graph API service — all calls use a mocked proxy function.
 * NO real Microsoft Graph API calls are made.
 *
 * @agent @CONDUIT — Integration Engineer
 */

import { describe, it, expect, vi } from 'vitest';
import {
  listDriveFiles,
  getExcelContent,
  listSharePointLists,
  getSharePointListItems,
} from '../src/services/graph-api.service';
import type { ProxyCallFn } from '../src/services/graph-api.service';

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

/** Create a mock proxy that returns a successful Graph-like response */
function mockProxy(data: unknown, status = 200): ProxyCallFn {
  return vi.fn().mockResolvedValue({ ok: true, data, status });
}

/** Create a mock proxy that returns an error */
function mockProxyError(status: number, error = 'error'): ProxyCallFn {
  return vi.fn().mockResolvedValue({ ok: false, error, status });
}

const TEST_USER_ID = '11111111-1111-1111-1111-111111111111';
const TEST_SITE_ID = 'site-abc-123';
const TEST_LIST_ID = 'list-xyz-456';
const TEST_FILE_ID = 'file-def-789';

// ---------------------------------------------------------------------------
// listDriveFiles
// ---------------------------------------------------------------------------

describe('listDriveFiles', () => {
  it('returns formatted file list from Graph search results', async () => {
    const graphResponse = {
      value: [
        {
          id: 'file-1',
          name: 'Budget.xlsx',
          size: 12345,
          lastModifiedDateTime: '2026-04-20T10:00:00Z',
          webUrl: 'https://onedrive.com/budget.xlsx',
        },
        {
          id: 'file-2',
          name: 'Report.xlsx',
          size: 67890,
          lastModifiedDateTime: '2026-04-21T14:30:00Z',
          webUrl: 'https://onedrive.com/report.xlsx',
        },
      ],
    };

    const proxy = mockProxy(graphResponse);
    const result = await listDriveFiles(proxy, TEST_USER_ID);

    expect(result.ok).toBe(true);
    if (result.ok) {
      expect(result.data).toHaveLength(2);
      expect(result.data[0]).toEqual({
        id: 'file-1',
        name: 'Budget.xlsx',
        size: 12345,
        lastModified: '2026-04-20T10:00:00Z',
        webUrl: 'https://onedrive.com/budget.xlsx',
      });
      expect(result.data[1]).toEqual({
        id: 'file-2',
        name: 'Report.xlsx',
        size: 67890,
        lastModified: '2026-04-21T14:30:00Z',
        webUrl: 'https://onedrive.com/report.xlsx',
      });
    }

    // Verify the correct endpoint was called
    expect(proxy).toHaveBeenCalledWith(
      expect.stringContaining("/me/drive/root/search(q='.xlsx')"),
      'GET',
    );
  });

  it('handles empty results gracefully', async () => {
    const proxy = mockProxy({ value: [] });
    const result = await listDriveFiles(proxy, TEST_USER_ID);

    expect(result.ok).toBe(true);
    if (result.ok) {
      expect(result.data).toHaveLength(0);
    }
  });

  it('handles null/missing data by returning empty array', async () => {
    const proxy = mockProxy(null);
    const result = await listDriveFiles(proxy, TEST_USER_ID);

    expect(result.ok).toBe(true);
    if (result.ok) {
      expect(result.data).toHaveLength(0);
    }
  });
});

// ---------------------------------------------------------------------------
// getExcelContent
// ---------------------------------------------------------------------------

describe('getExcelContent', () => {
  it('calls the correct endpoint with file ID', async () => {
    const proxy = mockProxy('binary-content-here');
    const result = await getExcelContent(proxy, TEST_FILE_ID);

    expect(result.ok).toBe(true);
    expect(proxy).toHaveBeenCalledWith(
      `/me/drive/items/${TEST_FILE_ID}/content`,
      'GET',
    );
  });

  it('returns error for empty file ID', async () => {
    const proxy = mockProxy(null);
    const result = await getExcelContent(proxy, '');

    expect(result.ok).toBe(false);
    if (!result.ok) {
      expect(result.error).toBe('File ID is required');
      expect(result.status).toBe(400);
    }

    // Proxy should NOT have been called
    expect(proxy).not.toHaveBeenCalled();
  });

  it('returns data on success', async () => {
    const content = { raw: 'excel-data' };
    const proxy = mockProxy(content);
    const result = await getExcelContent(proxy, TEST_FILE_ID);

    expect(result.ok).toBe(true);
    if (result.ok) {
      expect(result.data).toEqual(content);
    }
  });
});

// ---------------------------------------------------------------------------
// Error handling (401, 403, 404, 429)
// ---------------------------------------------------------------------------

describe('Error handling', () => {
  it('maps 401 to token expired message', async () => {
    const proxy = mockProxyError(401);
    const result = await listDriveFiles(proxy, TEST_USER_ID);

    expect(result.ok).toBe(false);
    if (!result.ok) {
      expect(result.error).toBe('Token expired, please re-authenticate');
      expect(result.status).toBe(401);
    }
  });

  it('maps 403 to permission denied message', async () => {
    const proxy = mockProxyError(403);
    const result = await getExcelContent(proxy, TEST_FILE_ID);

    expect(result.ok).toBe(false);
    if (!result.ok) {
      expect(result.error).toBe('Permission denied');
      expect(result.status).toBe(403);
    }
  });

  it('maps 404 to file not found message', async () => {
    const proxy = mockProxyError(404);
    const result = await getExcelContent(proxy, TEST_FILE_ID);

    expect(result.ok).toBe(false);
    if (!result.ok) {
      expect(result.error).toBe('File not found');
      expect(result.status).toBe(404);
    }
  });

  it('maps 429 to rate limit message', async () => {
    const proxy = mockProxyError(429);
    const result = await listDriveFiles(proxy, TEST_USER_ID);

    expect(result.ok).toBe(false);
    if (!result.ok) {
      expect(result.error).toBe('Microsoft rate limited, retry later');
      expect(result.status).toBe(429);
    }
  });

  it('maps unknown errors with status code', async () => {
    const proxy = mockProxyError(500, 'Internal error');
    const result = await listDriveFiles(proxy, TEST_USER_ID);

    expect(result.ok).toBe(false);
    if (!result.ok) {
      expect(result.error).toBeTruthy();
      expect(result.status).toBe(500);
    }
  });
});

// ---------------------------------------------------------------------------
// listSharePointLists
// ---------------------------------------------------------------------------

describe('listSharePointLists', () => {
  it('returns formatted SharePoint lists', async () => {
    const graphResponse = {
      value: [
        {
          id: 'list-1',
          displayName: 'Inventory',
          description: 'Stock tracking',
          createdDateTime: '2026-01-10T08:00:00Z',
          list: { contentTypesEnabled: 42 },
        },
        {
          id: 'list-2',
          displayName: 'Employees',
          description: '',
          createdDateTime: '2026-02-15T12:00:00Z',
        },
      ],
    };

    const proxy = mockProxy(graphResponse);
    const result = await listSharePointLists(proxy, TEST_SITE_ID);

    expect(result.ok).toBe(true);
    if (result.ok) {
      expect(result.data).toHaveLength(2);
      expect(result.data[0]?.name).toBe('Inventory');
      expect(result.data[1]?.name).toBe('Employees');
    }

    expect(proxy).toHaveBeenCalledWith(
      expect.stringContaining(`/sites/${TEST_SITE_ID}/lists`),
      'GET',
    );
  });

  it('returns error for empty site ID', async () => {
    const proxy = mockProxy(null);
    const result = await listSharePointLists(proxy, '');

    expect(result.ok).toBe(false);
    if (!result.ok) {
      expect(result.error).toBe('Site ID is required');
      expect(result.status).toBe(400);
    }
    expect(proxy).not.toHaveBeenCalled();
  });

  it('handles 403 permission denied', async () => {
    const proxy = mockProxyError(403);
    const result = await listSharePointLists(proxy, TEST_SITE_ID);

    expect(result.ok).toBe(false);
    if (!result.ok) {
      expect(result.error).toBe('Permission denied');
    }
  });
});

// ---------------------------------------------------------------------------
// getSharePointListItems
// ---------------------------------------------------------------------------

describe('getSharePointListItems', () => {
  it('returns items with expanded fields', async () => {
    const graphResponse = {
      value: [
        {
          id: 'item-1',
          fields: { Title: 'Widget A', Quantity: 100 },
        },
        {
          id: 'item-2',
          fields: { Title: 'Widget B', Quantity: 250 },
        },
      ],
    };

    const proxy = mockProxy(graphResponse);
    const result = await getSharePointListItems(proxy, TEST_SITE_ID, TEST_LIST_ID);

    expect(result.ok).toBe(true);
    if (result.ok) {
      expect(result.data).toHaveLength(2);
      expect(result.data[0]?.fields).toEqual({ Title: 'Widget A', Quantity: 100 });
      expect(result.data[1]?.id).toBe('item-2');
    }

    expect(proxy).toHaveBeenCalledWith(
      expect.stringContaining(`/sites/${TEST_SITE_ID}/lists/${TEST_LIST_ID}/items`),
      'GET',
    );
  });

  it('returns error for empty site ID', async () => {
    const proxy = mockProxy(null);
    const result = await getSharePointListItems(proxy, '', TEST_LIST_ID);

    expect(result.ok).toBe(false);
    if (!result.ok) {
      expect(result.error).toBe('Site ID is required');
    }
    expect(proxy).not.toHaveBeenCalled();
  });

  it('returns error for empty list ID', async () => {
    const proxy = mockProxy(null);
    const result = await getSharePointListItems(proxy, TEST_SITE_ID, '');

    expect(result.ok).toBe(false);
    if (!result.ok) {
      expect(result.error).toBe('List ID is required');
    }
    expect(proxy).not.toHaveBeenCalled();
  });

  it('handles items with missing fields gracefully', async () => {
    const graphResponse = {
      value: [
        { id: 'item-1' },
        { id: 'item-2', fields: null },
      ],
    };

    const proxy = mockProxy(graphResponse);
    const result = await getSharePointListItems(proxy, TEST_SITE_ID, TEST_LIST_ID);

    expect(result.ok).toBe(true);
    if (result.ok) {
      expect(result.data).toHaveLength(2);
      expect(result.data[0]?.fields).toEqual({});
      expect(result.data[1]?.fields).toEqual({});
    }
  });

  it('handles 404 error for missing list', async () => {
    const proxy = mockProxyError(404);
    const result = await getSharePointListItems(proxy, TEST_SITE_ID, TEST_LIST_ID);

    expect(result.ok).toBe(false);
    if (!result.ok) {
      expect(result.error).toBe('File not found');
      expect(result.status).toBe(404);
    }
  });
});
