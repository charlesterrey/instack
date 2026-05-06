import { eq, and, desc, asc, count, sql } from 'drizzle-orm';
import { apps, appComponents, dataSources } from '../../drizzle/schema';
import type { Database } from '../lib/db';

export interface ListAppsParams {
  tenantId: string;
  page: number;
  limit: number;
  status?: string;
  archetype?: string;
  sort: string;
  order: 'asc' | 'desc';
}

export async function listApps(db: Database, params: ListAppsParams) {
  const { page, limit, status, archetype, sort, order } = params;
  const offset = (page - 1) * limit;

  const conditions = [];
  if (status) {
    conditions.push(sql`${apps.status} = ${status}`);
  }
  if (archetype) {
    conditions.push(sql`${apps.archetype} = ${archetype}`);
  }

  const whereClause = conditions.length > 0 ? and(...conditions) : undefined;
  const sortColumn = sort === 'name' ? apps.name : sort === 'updated_at' ? apps.updatedAt : apps.createdAt;
  const orderFn = order === 'asc' ? asc : desc;

  const [rows, totalResult] = await Promise.all([
    db
      .select()
      .from(apps)
      .where(whereClause)
      .orderBy(orderFn(sortColumn))
      .limit(limit)
      .offset(offset),
    db
      .select({ count: count() })
      .from(apps)
      .where(whereClause),
  ]);

  const total = totalResult[0]?.count ?? 0;
  return { items: rows, total, page, limit };
}

export async function getAppById(db: Database, appId: string) {
  const appRows = await db
    .select()
    .from(apps)
    .where(eq(apps.id, appId))
    .limit(1);

  const app = appRows[0];
  if (!app) return null;

  const [components, sources] = await Promise.all([
    db.select().from(appComponents).where(eq(appComponents.appId, appId)),
    db.select().from(dataSources).where(eq(dataSources.appId, appId)),
  ]);

  return { ...app, components, dataSources: sources };
}

export async function createApp(
  db: Database,
  data: {
    tenantId: string;
    creatorId: string;
    name: string;
    description?: string | null;
    archetype: string;
    schemaJson?: Record<string, unknown>;
  },
) {
  const archetypeValue = data.archetype as typeof apps.archetype.enumValues[number];
  const defaultSchema = {
    id: '',
    name: data.name,
    archetype: data.archetype,
    layout: { type: 'single_page' },
    components: [],
    dataBindings: [],
  };
  const rows = await db
    .insert(apps)
    .values({
      tenantId: data.tenantId,
      creatorId: data.creatorId,
      name: data.name,
      description: data.description ?? null,
      archetype: archetypeValue,
      schemaJson: data.schemaJson ?? defaultSchema,
      status: 'draft',
      visibility: 'private',
    })
    .returning();

  return rows[0] ?? null;
}

export async function updateApp(
  db: Database,
  appId: string,
  data: Partial<{
    name: string;
    description: string | null;
    status: string;
    visibility: string;
    expiresAt: Date | null;
  }>,
) {
  const setData: Record<string, unknown> = { updatedAt: new Date() };
  if (data.name !== undefined) setData['name'] = data.name;
  if (data.description !== undefined) setData['description'] = data.description;
  if (data.status !== undefined) setData['status'] = data.status;
  if (data.visibility !== undefined) setData['visibility'] = data.visibility;
  if (data.expiresAt !== undefined) setData['expiresAt'] = data.expiresAt;

  const rows = await db
    .update(apps)
    .set(setData)
    .where(eq(apps.id, appId))
    .returning();

  return rows[0] ?? null;
}

export async function countAppsByTenant(db: Database, tenantId: string): Promise<number> {
  const result = await db
    .select({ count: count() })
    .from(apps)
    .where(eq(apps.tenantId, tenantId));
  return result[0]?.count ?? 0;
}
