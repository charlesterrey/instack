import { z } from 'zod';

export const dataSourceTypeSchema = z.enum(['excel_file', 'sharepoint_list', 'demo_data']);

export const syncStatusSchema = z.enum(['pending', 'syncing', 'synced', 'error']);

export const syncConfigSchema = z.object({
  sheetName: z.string().optional(),
  range: z.string().optional(),
  refreshInterval: z.number().int().positive().optional(),
  columns: z.array(z.string()).optional(),
});

export const dataSourceSchema = z.object({
  id: z.string().uuid(),
  tenantId: z.string().uuid(),
  appId: z.string().uuid().nullable(),
  sourceType: dataSourceTypeSchema,
  m365ResourceId: z.string().nullable(),
  syncConfig: syncConfigSchema,
  lastSyncedAt: z.coerce.date().nullable(),
  syncStatus: syncStatusSchema,
  createdAt: z.coerce.date(),
});

export const createDataSourceSchema = z.object({
  tenantId: z.string().uuid(),
  appId: z.string().uuid().nullable().optional(),
  sourceType: dataSourceTypeSchema,
  m365ResourceId: z.string().nullable().optional(),
  syncConfig: syncConfigSchema.optional(),
});

export type DataSourceInput = z.infer<typeof createDataSourceSchema>;
