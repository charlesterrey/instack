import { z } from 'zod';

export const tenantPlanSchema = z.enum(['free', 'pro', 'enterprise']);

export const tenantSettingsSchema = z.object({
  maxApps: z.number().int().positive().optional(),
  maxUsers: z.number().int().positive().optional(),
  allowPublicApps: z.boolean().optional(),
  customDomain: z.string().min(1).optional(),
});

export const tenantSchema = z.object({
  id: z.string().uuid(),
  name: z.string().min(1).max(255),
  m365TenantId: z.string().min(1),
  plan: tenantPlanSchema,
  settings: tenantSettingsSchema,
  createdAt: z.coerce.date(),
  updatedAt: z.coerce.date(),
});

export const createTenantSchema = z.object({
  name: z.string().min(1).max(255),
  m365TenantId: z.string().min(1),
  plan: tenantPlanSchema.optional(),
  settings: tenantSettingsSchema.optional(),
});

export type TenantInput = z.infer<typeof createTenantSchema>;
