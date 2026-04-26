import { z } from 'zod';

export const nodeTypeSchema = z.enum(['user', 'team', 'app', 'data_source', 'file', 'column']);

export const relationTypeSchema = z.enum([
  'created',
  'uses',
  'owns',
  'shares',
  'derived_from',
  'belongs_to',
  'connected_to',
  'viewed',
  'edited',
]);

export const graphEdgeSchema = z.object({
  targetId: z.string().uuid(),
  relation: relationTypeSchema,
  weight: z.number().min(0).max(1),
  updatedAt: z.coerce.date(),
});

export const graphNodeSchema = z.object({
  id: z.string().uuid(),
  tenantId: z.string().uuid(),
  nodeType: nodeTypeSchema,
  nodeId: z.string().uuid(),
  edges: z.array(graphEdgeSchema),
  metadata: z.record(z.unknown()),
  createdAt: z.coerce.date(),
  updatedAt: z.coerce.date(),
});

export const createGraphNodeSchema = z.object({
  tenantId: z.string().uuid(),
  nodeType: nodeTypeSchema,
  nodeId: z.string().uuid(),
  edges: z.array(graphEdgeSchema).optional(),
  metadata: z.record(z.unknown()).optional(),
});

export type GraphNodeInput = z.infer<typeof createGraphNodeSchema>;
