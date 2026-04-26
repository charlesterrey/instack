/**
 * Stage 4: 3-Pass Validation — orchestrates schema, layout, and security checks.
 * @NEURON owns this file. @PHANTOM reviews security pass.
 *
 * Pass 1: Zod type checking (schema.validator.ts)
 * Pass 2: Layout + structural checks with auto-correction (layout.validator.ts)
 * Pass 3: Security scan — hard rejection on threats (security.validator.ts)
 *
 * Returns a branded ValidatedAppSchema if all passes succeed.
 */

import type { Result } from '@instack/shared';
import { ok, err } from '@instack/shared';
import type { ValidationError } from '../errors';
import type { ValidatedAppSchema } from '../schemas/generate.schema';
import { brandAsValidated } from '../schemas/generate.schema';
import { validateSchema } from '../validators/schema.validator';
import { validateLayout } from '../validators/layout.validator';
import { validateSecurity } from '../validators/security.validator';

export interface ValidationResult {
  readonly schema: ValidatedAppSchema;
  readonly corrections: readonly string[];
}

/**
 * Run 3 sequential validation passes on a raw app schema.
 *
 * @param rawSchema - The raw JSON output from Stage 3
 * @param sourceColumns - Column names from Stage 2 for reference validation
 * @returns Result with validated + possibly auto-corrected schema
 */
export function validateAppSchema(
  rawSchema: unknown,
  sourceColumns: readonly string[],
): Result<ValidationResult, ValidationError> {
  // ═══════════════════════════════════════════════════════════════
  // PASS 1: Zod type checking
  // ═══════════════════════════════════════════════════════════════
  const pass1 = validateSchema(rawSchema);
  if (!pass1.ok) {
    return err(pass1.error);
  }

  // ═══════════════════════════════════════════════════════════════
  // PASS 2: Layout + structural validation with auto-correction
  // ═══════════════════════════════════════════════════════════════
  const pass2 = validateLayout(pass1.value.schema, sourceColumns);
  if (!pass2.ok) {
    return err(pass2.error);
  }

  // ═══════════════════════════════════════════════════════════════
  // PASS 3: Security scan — hard rejection on threats
  // ═══════════════════════════════════════════════════════════════
  const pass3 = validateSecurity(
    pass2.value.schema as unknown as Record<string, unknown>,
  );
  if (!pass3.ok) {
    return err(pass3.error);
  }

  // All 3 passes succeeded — brand as validated
  const validatedSchema = brandAsValidated(pass2.value.schema);

  return ok({
    schema: validatedSchema,
    corrections: pass2.value.corrections,
  });
}
