/**
 * Pass 3: Security Validator — @PHANTOM owns this file.
 *
 * Scans the generated app schema for security threats.
 * Hard rejection on any match — no auto-correct.
 *
 * Checks:
 * - XSS: <script>, <iframe>, <object>, <embed>, <svg onload>
 * - javascript: protocol URIs
 * - on* event handlers (onclick, onerror, etc.)
 * - Template literals ${} (potential code injection)
 * - SQL injection patterns (UNION SELECT, DROP TABLE, etc.)
 * - data: URIs (can embed executable content)
 */

import type { Result } from '@instack/shared';
import { ok, err } from '@instack/shared';
import type { ValidationError } from '../errors';
import { validationError } from '../errors';

export interface SecurityViolation {
  readonly path: string;
  readonly pattern: string;
  readonly value: string;
}

export interface SecurityValidationResult {
  readonly passed: boolean;
  readonly violations: readonly SecurityViolation[];
}

/** Patterns that indicate XSS or injection attempts */
const DANGEROUS_PATTERNS: ReadonlyArray<{ name: string; regex: RegExp }> = [
  { name: 'script_tag', regex: /<script[\s>]/i },
  { name: 'iframe_tag', regex: /<iframe[\s>]/i },
  { name: 'object_tag', regex: /<object[\s>]/i },
  { name: 'embed_tag', regex: /<embed[\s>]/i },
  { name: 'svg_event', regex: /<svg[^>]*\bon\w+\s*=/i },
  { name: 'javascript_uri', regex: /javascript\s*:/i },
  { name: 'vbscript_uri', regex: /vbscript\s*:/i },
  { name: 'on_event_handler', regex: /\bon[a-z]{2,}\s*=/i },
  { name: 'template_literal', regex: /\$\{[^}]*\}/i },
  { name: 'data_uri', regex: /data\s*:[^,]*;base64/i },
  { name: 'sql_union_select', regex: /\bUNION\s+SELECT\b/i },
  { name: 'sql_drop_table', regex: /\bDROP\s+TABLE\b/i },
  { name: 'sql_delete_from', regex: /\bDELETE\s+FROM\b/i },
  { name: 'sql_insert_into', regex: /\bINSERT\s+INTO\b/i },
  { name: 'sql_update_set', regex: /\bUPDATE\s+\w+\s+SET\b/i },
  { name: 'sql_or_1_eq_1', regex: /'\s*OR\s+'?\d+'\s*=\s*'?\d+/i },
  { name: 'expression_eval', regex: /\beval\s*\(/i },
  { name: 'expression_function', regex: /\bFunction\s*\(/i },
  { name: 'import_expression', regex: /\bimport\s*\(/i },
  { name: 'require_expression', regex: /\brequire\s*\(/i },
];

/**
 * Scan an app schema for security threats.
 * Returns hard failure if any dangerous pattern is found.
 */
export function validateSecurity(
  schema: Record<string, unknown>,
): Result<SecurityValidationResult, ValidationError> {
  const violations: SecurityViolation[] = [];
  scanValue(schema, '', violations);

  if (violations.length > 0) {
    const summary = violations
      .slice(0, 5)
      .map((v) => `[${v.pattern}] at ${v.path}`)
      .join('; ');

    return err(
      validationError(
        'SECURITY_VIOLATION',
        `Schema contient ${violations.length} menace(s) de securite: ${summary}`,
        false,
      ),
    );
  }

  return ok({ passed: true, violations: [] });
}

/** Recursively scan all string values in an object */
function scanValue(
  value: unknown,
  path: string,
  violations: SecurityViolation[],
): void {
  if (typeof value === 'string') {
    for (const pattern of DANGEROUS_PATTERNS) {
      if (pattern.regex.test(value)) {
        violations.push({
          path,
          pattern: pattern.name,
          value: value.slice(0, 100),
        });
      }
    }
    return;
  }

  if (Array.isArray(value)) {
    for (let i = 0; i < value.length; i++) {
      scanValue(value[i], `${path}[${i}]`, violations);
    }
    return;
  }

  if (value !== null && typeof value === 'object') {
    for (const [key, val] of Object.entries(value as Record<string, unknown>)) {
      scanValue(val, path ? `${path}.${key}` : key, violations);
    }
  }
}
