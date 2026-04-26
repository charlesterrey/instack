import { z } from 'zod';

export const userRoleSchema = z.enum(['admin', 'creator', 'viewer']);

export const userSchema = z.object({
  id: z.string().uuid(),
  tenantId: z.string().uuid(),
  email: z.string().email(),
  name: z.string().min(1).max(255),
  role: userRoleSchema,
  m365UserId: z.string().min(1),
  lastActiveAt: z.coerce.date().nullable(),
  createdAt: z.coerce.date(),
});

export const createUserSchema = z.object({
  tenantId: z.string().uuid(),
  email: z.string().email(),
  name: z.string().min(1).max(255),
  role: userRoleSchema.optional(),
  m365UserId: z.string().min(1),
});

export type UserInput = z.infer<typeof createUserSchema>;
