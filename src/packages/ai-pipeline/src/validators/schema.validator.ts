/**
 * Pass 1: Schema Validator — Zod type checking.
 * @NEURON owns this file.
 *
 * Validates the raw JSON from Claude against the generatedAppSchema Zod schema.
 * Returns structured errors on failure.
 */

import type { Result } from '@instack/shared';
import { ok, err } from '@instack/shared';
import type { ValidationError } from '../errors';
import { validationError } from '../errors';
import type { GeneratedAppSchema } from '../schemas/generate.schema';
import { generatedAppSchema } from '../schemas/generate.schema';

export interface SchemaValidationResult {
  readonly valid: boolean;
  readonly schema: GeneratedAppSchema;
}

/**
 * Pass 1: Validate raw JSON against Zod schema.
 * No auto-correction — strict type checking only.
 */
export function validateSchema(
  raw: unknown,
): Result<SchemaValidationResult, ValidationError> {
  const parsed = generatedAppSchema.safeParse(raw);

  if (!parsed.success) {
    const issues = parsed.error.issues
      .slice(0, 10)
      .map((issue) => `${issue.path.join('.')}: ${issue.message}`)
      .join('; ');

    return err(
      validationError(
        'SCHEMA_INVALID',
        `Schema echoue la validation Zod: ${issues}`,
        true,
      ),
    );
  }

  return ok({ valid: true, schema: parsed.data });
}
