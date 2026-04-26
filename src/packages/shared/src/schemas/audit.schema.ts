import { z } from 'zod';

export const auditActionSchema = z.enum([
  'app.created',
  'app.updated',
  'app.deleted',
  'app.archived',
  'app.shared',
  'app.published',
  'app.cloned',
  'user.login',
  'user.logout',
  'user.invited',
  'user.role_changed',
  'data.synced',
  'data.sync_failed',
  'data.source_connected',
  'data.source_disconnected',
  'tenant.settings_updated',
  'tenant.plan_changed',
  'pipeline.started',
  'pipeline.completed',
  'pipeline.failed',
]);

export const auditEntrySchema = z.object({
  id: z.string().uuid(),
  tenantId: z.string().uuid(),
  userId: z.string().uuid().nullable(),
  action: auditActionSchema,
  resourceType: z.string().min(1),
  resourceId: z.string().uuid().nullable(),
  metadata: z.record(z.unknown()),
  ipAddress: z.string().nullable(),
  createdAt: z.coerce.date(),
});

export const createAuditEntrySchema = z.object({
  tenantId: z.string().uuid(),
  userId: z.string().uuid().nullable().optional(),
  action: auditActionSchema,
  resourceType: z.string().min(1),
  resourceId: z.string().uuid().nullable().optional(),
  metadata: z.record(z.unknown()).optional(),
  ipAddress: z.string().nullable().optional(),
});

export type AuditEntryInput = z.infer<typeof createAuditEntrySchema>;
