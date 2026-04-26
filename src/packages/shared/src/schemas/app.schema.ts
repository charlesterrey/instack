import { z } from 'zod';

export const appArchetypeSchema = z.enum([
  'crud_form',
  'dashboard',
  'tracker',
  'report',
  'approval',
  'checklist',
  'gallery',
  'multi_view',
]);

export const appStatusSchema = z.enum(['draft', 'active', 'archived', 'expired']);

export const appVisibilitySchema = z.enum(['private', 'team', 'public']);

export const componentTypeSchema = z.enum([
  'form_field',
  'data_table',
  'kpi_card',
  'bar_chart',
  'pie_chart',
  'line_chart',
  'kanban_board',
  'detail_view',
  'image_gallery',
  'filter_bar',
  'container',
  'page_nav',
]);

export const componentInstanceSchema = z.object({
  id: z.string().min(1),
  type: componentTypeSchema,
  props: z.record(z.unknown()),
  position: z.object({
    row: z.number().int().nonnegative(),
    col: z.number().int().nonnegative(),
    span: z.number().int().positive().optional(),
  }),
  dataBinding: z.string().optional(),
});

export const layoutConfigSchema = z.object({
  type: z.enum(['single_page', 'multi_page', 'sidebar']),
  columns: z.number().int().positive().optional(),
  gap: z.string().optional(),
});

export const dataBindingSchema = z.object({
  id: z.string().min(1),
  sourceId: z.string().min(1),
  field: z.string().min(1),
  transform: z.string().optional(),
});

export const appSchemaJsonSchema = z.object({
  id: z.string().min(1),
  name: z.string().min(1),
  archetype: appArchetypeSchema,
  layout: layoutConfigSchema,
  components: z.array(componentInstanceSchema),
  dataBindings: z.array(dataBindingSchema),
});

export const appSchema = z.object({
  id: z.string().uuid(),
  tenantId: z.string().uuid(),
  creatorId: z.string().uuid(),
  name: z.string().min(1).max(255),
  description: z.string().nullable(),
  schemaJson: appSchemaJsonSchema,
  archetype: appArchetypeSchema,
  status: appStatusSchema,
  visibility: appVisibilitySchema,
  expiresAt: z.coerce.date().nullable(),
  createdAt: z.coerce.date(),
  updatedAt: z.coerce.date(),
});

export const createAppSchema = z.object({
  tenantId: z.string().uuid(),
  creatorId: z.string().uuid(),
  name: z.string().min(1).max(255),
  description: z.string().nullable().optional(),
  archetype: appArchetypeSchema,
});

export type AppInput = z.infer<typeof createAppSchema>;
