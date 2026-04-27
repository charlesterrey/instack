/**
 * App Data routes — serve synced data to the frontend.
 * @FORGE owns this file. @CONDUIT reviews data flow.
 *
 * GET /api/apps/:appId/data — Paginated data with sort/filter
 * GET /api/apps/:appId/data/aggregations — Server-side aggregations
 *
 * Data flow: request → check KV cache → serve (or sync on miss) → paginate → respond
 * Business data is NEVER stored in the DB — only in ephemeral KV cache.
 */

import { Hono } from 'hono';
import { z } from 'zod';
import { eq } from 'drizzle-orm';
import * as dbSchema from '../../drizzle/schema';
import { getCachedData } from '../services/data-cache.service';
import type { KVNamespace } from '../services/data-cache.service';
import type { CacheEntry } from '@instack/shared';

export const appDataRoutes = new Hono();

/** Query param validation for data endpoint */
const dataQuerySchema = z.object({
  page: z.coerce.number().int().positive().default(1),
  limit: z.coerce.number().int().min(1).max(1000).default(100),
  sort: z.string().optional(),
  order: z.enum(['asc', 'desc']).default('asc'),
});

/** Parse aggregation ops string: "montant:sum,count:count" → [{column, operation}] */
function parseAggregationOps(
  ops: string,
): Array<{ column: string; operation: 'count' | 'sum' | 'avg' | 'min' | 'max' }> {
  const validOps = new Set(['count', 'sum', 'avg', 'min', 'max']);
  return ops
    .split(',')
    .map((op) => {
      const [column, operation] = op.split(':');
      if (!column || !operation || !validOps.has(operation)) return null;
      return { column: column.trim(), operation: operation.trim() as 'count' | 'sum' | 'avg' | 'min' | 'max' };
    })
    .filter((op): op is NonNullable<typeof op> => op !== null);
}

/** Apply filters to rows. Supports filter[column]=value query params. */
function applyFilters(
  rows: readonly Record<string, unknown>[],
  filters: Record<string, string>,
): Record<string, unknown>[] {
  let filtered = [...rows];
  for (const [key, value] of Object.entries(filters)) {
    const column = key.replace(/^filter\[(.+)\]$/, '$1');
    if (column === key) continue; // Not a filter param
    filtered = filtered.filter((row) => {
      const cellValue = row[column];
      if (cellValue == null) return false;
      return String(cellValue).toLowerCase().includes(value.toLowerCase());
    });
  }
  return filtered;
}

/** Sort rows by a column */
function sortRows(
  rows: Record<string, unknown>[],
  sortColumn: string,
  order: 'asc' | 'desc',
): Record<string, unknown>[] {
  return [...rows].sort((a, b) => {
    const va = a[sortColumn];
    const vb = b[sortColumn];
    if (va == null && vb == null) return 0;
    if (va == null) return order === 'asc' ? -1 : 1;
    if (vb == null) return order === 'asc' ? 1 : -1;

    // Numeric comparison
    const na = Number(va);
    const nb = Number(vb);
    if (!isNaN(na) && !isNaN(nb)) {
      return order === 'asc' ? na - nb : nb - na;
    }

    // String comparison
    const cmp = String(va).localeCompare(String(vb), 'fr');
    return order === 'asc' ? cmp : -cmp;
  });
}

/** Compute a single aggregation */
function computeAggregation(
  rows: readonly Record<string, unknown>[],
  column: string,
  operation: string,
): number {
  const values = rows
    .map((row) => row[column])
    .filter((v) => v != null);

  switch (operation) {
    case 'count':
      return values.length;
    case 'sum': {
      return values.reduce((acc: number, v) => acc + (Number(v) || 0), 0);
    }
    case 'avg': {
      const nums = values.map(Number).filter((n) => !isNaN(n));
      return nums.length > 0 ? nums.reduce((a, b) => a + b, 0) / nums.length : 0;
    }
    case 'min': {
      const nums = values.map(Number).filter((n) => !isNaN(n));
      return nums.length > 0 ? Math.min(...nums) : 0;
    }
    case 'max': {
      const nums = values.map(Number).filter((n) => !isNaN(n));
      return nums.length > 0 ? Math.max(...nums) : 0;
    }
    default:
      return 0;
  }
}

/**
 * Helper: get cached data for an app by finding its data source.
 */
async function getAppCachedData(
  db: unknown,
  kv: KVNamespace,
  appId: string,
  tenantId: string,
): Promise<{ data: CacheEntry | null; dataSource: typeof dbSchema.dataSources.$inferSelect | null }> {
  const drizzleDb = db as ReturnType<typeof import('drizzle-orm/neon-http').drizzle>;
  const sources = await drizzleDb
    .select()
    .from(dbSchema.dataSources)
    .where(eq(dbSchema.dataSources.appId, appId))
    .limit(1);

  const ds = sources[0] ?? null;
  if (!ds) return { data: null, dataSource: null };

  const cached = await getCachedData(kv, tenantId, ds.id);
  return { data: cached, dataSource: ds };
}

/**
 * GET /api/apps/:appId/data
 * Returns paginated, sorted, filtered data from the KV cache.
 */
appDataRoutes.get('/:appId/data', async (c) => {
  const appId = c.req.param('appId');
  const auth = c.get('auth') as { tenantId: string; userId: string };
  const kv = (c.env as Record<string, unknown>)['DATA_CACHE'] as KVNamespace | undefined;

  if (!kv) {
    return c.json({ error: { message: 'Data cache not configured', status: 500 } }, 500);
  }

  const rawQuery = {
    page: c.req.query('page'),
    limit: c.req.query('limit'),
    sort: c.req.query('sort'),
    order: c.req.query('order'),
  };
  const parsed = dataQuerySchema.safeParse(rawQuery);
  const query = parsed.success ? parsed.data : { page: 1, limit: 100, sort: undefined, order: 'asc' as const };

  const db = c.get('db');
  const { data: cached, dataSource } = await getAppCachedData(db, kv, appId, auth.tenantId);

  if (!dataSource) {
    return c.json({
      data: {
        columns: [],
        rows: [],
        total: 0,
        syncedAt: null,
        syncStatus: 'pending',
      },
    });
  }

  if (!cached) {
    return c.json({
      data: {
        columns: [],
        rows: [],
        total: 0,
        syncedAt: dataSource.lastSyncedAt?.toISOString() ?? null,
        syncStatus: dataSource.syncStatus,
      },
    });
  }

  // Apply filters from query params (filter[column]=value)
  const allQueries = Object.fromEntries(
    Object.entries(c.req.queries()).map(([k, v]) => [k, v[0] ?? '']),
  );
  let rows = applyFilters(cached.rows, allQueries);

  // Sort
  if (query.sort) {
    rows = sortRows(rows, query.sort, query.order);
  }

  // Paginate
  const total = rows.length;
  const start = (query.page - 1) * query.limit;
  const paginatedRows = rows.slice(start, start + query.limit);

  return c.json({
    data: {
      columns: cached.columns,
      rows: paginatedRows,
      total,
      syncedAt: cached.syncedAt,
      syncStatus: dataSource.syncStatus,
    },
    pagination: {
      page: query.page,
      limit: query.limit,
      total,
      totalPages: Math.ceil(total / query.limit),
    },
  });
});

/**
 * GET /api/apps/:appId/data/aggregations
 * Server-side aggregation computation.
 * Query: ?ops=montant:sum,categorie:count
 */
appDataRoutes.get('/:appId/data/aggregations', async (c) => {
  const appId = c.req.param('appId');
  const auth = c.get('auth') as { tenantId: string; userId: string };
  const kv = (c.env as Record<string, unknown>)['DATA_CACHE'] as KVNamespace | undefined;

  if (!kv) {
    return c.json({ error: { message: 'Data cache not configured', status: 500 } }, 500);
  }

  const opsStr = c.req.query('ops');
  if (!opsStr) {
    return c.json({ error: { message: 'Missing ops query parameter', status: 400 } }, 400);
  }

  const ops = parseAggregationOps(opsStr);
  if (ops.length === 0) {
    return c.json({ error: { message: 'Invalid ops format. Use: column:operation,...', status: 400 } }, 400);
  }

  const db = c.get('db');
  const { data: cached } = await getAppCachedData(db, kv, appId, auth.tenantId);

  if (!cached) {
    return c.json({
      data: ops.map((op) => ({ column: op.column, operation: op.operation, result: 0 })),
    });
  }

  const results = ops.map((op) => ({
    column: op.column,
    operation: op.operation,
    result: computeAggregation(cached.rows, op.column, op.operation),
  }));

  return c.json({ data: results });
});
