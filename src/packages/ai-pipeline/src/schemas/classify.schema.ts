/**
 * Zod schema for validating classification responses.
 * @NEURON owns this file.
 *
 * Used to validate the structured output from Claude Haiku
 * in Stage 1 of the AI pipeline (intent classification).
 */

import { z } from 'zod';

/** The 8 valid app archetypes */
export const APP_ARCHETYPE_VALUES = [
  'crud_form',
  'dashboard',
  'tracker',
  'report',
  'approval',
  'checklist',
  'gallery',
  'multi_view',
] as const;

export const appArchetypeSchema = z.enum(APP_ARCHETYPE_VALUES);

/** Schema for the classification tool output */
export const classificationToolInputSchema = z.object({
  archetype: appArchetypeSchema,
  confidence: z.number().min(0).max(1),
  reasoning: z.string().min(1).max(500),
});

export type ClassificationToolInput = z.infer<typeof classificationToolInputSchema>;

/** Extended classification output with cost tracking */
export const classificationOutputSchema = classificationToolInputSchema.extend({
  costEur: z.number().nonnegative(),
});

export type ClassificationOutput = z.infer<typeof classificationOutputSchema>;
