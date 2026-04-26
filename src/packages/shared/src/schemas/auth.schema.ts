import { z } from 'zod';

export const graphProxyRequestSchema = z.object({
  endpoint: z.string().min(1),
  method: z.enum(['GET', 'POST', 'PATCH', 'DELETE']),
  body: z.unknown().optional(),
});

export const shareAppSchema = z.object({
  visibility: z.enum(['private', 'team', 'public']),
});

export const updateAppSchema = z.object({
  name: z.string().min(1).max(255).optional(),
  description: z.string().nullable().optional(),
  status: z.enum(['draft', 'active', 'archived', 'expired']).optional(),
  visibility: z.enum(['private', 'team', 'public']).optional(),
  expiresAt: z.coerce.date().nullable().optional(),
});

export const listAppsQuerySchema = z.object({
  page: z.coerce.number().int().positive().default(1),
  limit: z.coerce.number().int().positive().max(100).default(20),
  status: z.enum(['draft', 'active', 'archived', 'expired']).optional(),
  archetype: z.enum([
    'crud_form', 'dashboard', 'tracker', 'report',
    'approval', 'checklist', 'gallery', 'multi_view',
  ]).optional(),
  sort: z.enum(['created_at', 'updated_at', 'name']).default('created_at'),
  order: z.enum(['asc', 'desc']).default('desc'),
});

export const updateUserRoleSchema = z.object({
  role: z.enum(['admin', 'creator', 'viewer']),
});

export const updateTenantSettingsSchema = z.object({
  maxApps: z.number().int().positive().optional(),
  maxUsers: z.number().int().positive().optional(),
  allowPublicApps: z.boolean().optional(),
  customDomain: z.string().min(1).optional(),
});
