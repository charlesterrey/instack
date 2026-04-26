/**
 * Stage 2: Schema Inference — DETERMINISTIC (no AI, no randomness)
 * @CONDUIT owns this file. @NEURON reviews.
 *
 * Takes raw Excel data + archetype from Stage 1, infers typed columns,
 * normalizes names, and suggests components. Same input = same output ALWAYS.
 */

import type { Result } from '@instack/shared';
import type { AppArchetype, ComponentType } from '@instack/shared';
import { ok, err } from '@instack/shared';
import type { ExcelSheet, InferredSchema, TypedColumn, ColumnDataType } from '../types/pipeline.types';
import type { SchemaInferenceError } from '../errors';
import { schemaInferenceError } from '../errors';

// ═══════════════════════════════════════════════════════════════════════════
// Constants
// ═══════════════════════════════════════════════════════════════════════════

/** Maximum sample size for type inference */
const MAX_SAMPLE_SIZE = 50;

/** Minimum match ratio for a type rule to win */
const TYPE_MATCH_THRESHOLD = 0.8;

/** Nullable threshold — column is nullable if >5% of values are null/empty */
const NULLABLE_THRESHOLD = 0.05;

/** Enum detection: max unique values */
const ENUM_MAX_UNIQUE = 20;

/** Enum detection: max ratio unique/total */
const ENUM_RATIO_THRESHOLD = 0.3;

/** Max normalized column name length */
const MAX_COLUMN_NAME_LENGTH = 64;

/** Number of representative sample values to store */
const SAMPLE_VALUES_COUNT = 5;

// ═══════════════════════════════════════════════════════════════════════════
// Component suggestions by archetype
// ═══════════════════════════════════════════════════════════════════════════

const ARCHETYPE_COMPONENTS: Record<AppArchetype, readonly ComponentType[]> = {
  crud_form: ['form_field', 'data_table', 'filter_bar', 'container'],
  dashboard: ['kpi_card', 'bar_chart', 'filter_bar', 'container'],
  tracker: ['data_table', 'filter_bar', 'container'],
  report: ['data_table', 'bar_chart', 'filter_bar', 'container'],
  approval: ['form_field', 'data_table', 'container'],
  checklist: ['form_field', 'data_table', 'container'],
  gallery: ['data_table', 'filter_bar', 'container'],
  multi_view: ['data_table', 'form_field', 'kpi_card', 'container'],
} as const;

// ═══════════════════════════════════════════════════════════════════════════
// Regex patterns
// ═══════════════════════════════════════════════════════════════════════════

const EMAIL_REGEX = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;

/** French phone: 0X XX XX XX XX, +33 X XX XX XX XX, international +XX...
 * Must start with 0 or + to avoid matching date patterns like 2024-01-15 */
const PHONE_REGEX = /^(?:\+\d{1,3}[\s.-]?|0)\(?\d{1,4}\)?[\s.-]?\d{1,4}[\s.-]?\d{1,4}[\s.-]?\d{0,4}[\s.-]?\d{0,4}$/;

/** Stricter phone: must have at least 8 digits total */
const PHONE_MIN_DIGITS = 8;

const URL_REGEX = /^https?:\/\//;

/** ISO 8601: YYYY-MM-DD or YYYY-MM-DDTHH:mm:ss */
const ISO_DATE_REGEX = /^\d{4}-\d{2}-\d{2}(?:T\d{2}:\d{2}(?::\d{2})?(?:\.\d+)?(?:Z|[+-]\d{2}:?\d{2})?)?$/;

/** FR date: DD/MM/YYYY or DD-MM-YYYY */
const FR_DATE_REGEX = /^\d{1,2}[/\-.]\d{1,2}[/\-.]\d{2,4}$/;

/** US date: MM/DD/YYYY */
const US_DATE_REGEX = /^\d{1,2}\/\d{1,2}\/\d{2,4}$/;

/** English month name dates: "January 15, 2024", "15 January 2024" */
const MONTH_NAME_REGEX = /^(?:\d{1,2}\s+)?(?:January|February|March|April|May|June|July|August|September|October|November|December)(?:\s+\d{1,2})?,?\s*\d{2,4}$/i;

/** Boolean values */
const BOOLEAN_VALUES = new Set([
  'oui', 'non', 'true', 'false', 'vrai', 'faux', '0', '1',
]);

/** Percentage regex: number followed by % */
const PERCENTAGE_REGEX = /^-?\d+([.,]\d+)?[\s]*%$/;

/** Currency patterns in label */
const CURRENCY_LABEL_KEYWORDS = ['prix', 'cout', 'coût', 'montant', 'total', 'price', 'cost', 'amount'];

/** Currency regex: number with optional €/$ */
const CURRENCY_SUFFIX_REGEX = /^-?\d+([.,]\d+)?\s*[€$£]$/;
const CURRENCY_PREFIX_REGEX = /^[€$£]\s*-?\d+([.,]\d+)?$/;

// ═══════════════════════════════════════════════════════════════════════════
// Main export
// ═══════════════════════════════════════════════════════════════════════════

/**
 * Infer a typed schema from raw Excel data and an app archetype.
 * DETERMINISTIC: same input always produces same output.
 */
export function inferSchema(
  excelData: ExcelSheet,
  archetype: AppArchetype,
): Result<InferredSchema, SchemaInferenceError> {
  // Validate input
  if (excelData.headers.length === 0) {
    return err(schemaInferenceError(
      'EMPTY_HEADERS',
      'Excel sheet has no headers. Cannot infer schema from empty data.',
      true,
    ));
  }

  if (excelData.rows.length === 0) {
    // No rows — return columns typed as text, all nullable
    const columns: TypedColumn[] = excelData.headers.map((header) => ({
      name: normalizeColumnName(header),
      originalName: header,
      type: 'text' as const,
      nullable: true,
      sampleValues: [],
    }));

    return ok({
      columns,
      rowCount: 0,
      suggestedComponents: [...ARCHETYPE_COMPONENTS[archetype]],
    });
  }

  // Sample rows (deterministic: always first N rows)
  const sampleSize = Math.min(MAX_SAMPLE_SIZE, excelData.rows.length);
  const sampleRows = excelData.rows.slice(0, sampleSize);

  // Infer each column
  const columns: TypedColumn[] = excelData.headers.map((header) => {
    const values = extractColumnValues(sampleRows, header);
    const normalizedName = normalizeColumnName(header);
    const nullable = computeNullable(values);
    const nonNullValues = values.filter((v) => !isNullOrEmpty(v));

    const inferredType = inferColumnType(nonNullValues, header);
    const sampleValues = pickSampleValues(nonNullValues);

    const column: TypedColumn = {
      name: normalizedName,
      originalName: header,
      type: inferredType,
      nullable,
      sampleValues,
    };

    // Attach enum values if applicable
    if (inferredType === 'enum') {
      const uniqueValues = [...new Set(nonNullValues.map(String).map((s) => s.trim()))].sort();
      return { ...column, enumValues: uniqueValues };
    }

    return column;
  });

  const suggestedComponents: ComponentType[] = [...ARCHETYPE_COMPONENTS[archetype]];

  return ok({
    columns,
    rowCount: excelData.totalRows,
    suggestedComponents,
  });
}

// ═══════════════════════════════════════════════════════════════════════════
// Column value extraction
// ═══════════════════════════════════════════════════════════════════════════

/** Extract all values for a given column header from sample rows */
function extractColumnValues(
  rows: readonly Record<string, unknown>[],
  header: string,
): readonly unknown[] {
  return rows.map((row) => row[header]);
}

// ═══════════════════════════════════════════════════════════════════════════
// Null/empty detection
// ═══════════════════════════════════════════════════════════════════════════

/** Check if a value is null, undefined, or empty string */
function isNullOrEmpty(value: unknown): boolean {
  if (value === null || value === undefined) return true;
  if (typeof value === 'string' && value.trim() === '') return true;
  return false;
}

/** Compute if >NULLABLE_THRESHOLD of values are null/empty */
function computeNullable(values: readonly unknown[]): boolean {
  if (values.length === 0) return true;
  const nullCount = values.filter(isNullOrEmpty).length;
  return nullCount / values.length > NULLABLE_THRESHOLD;
}

// ═══════════════════════════════════════════════════════════════════════════
// Sample values picker
// ═══════════════════════════════════════════════════════════════════════════

/** Pick up to SAMPLE_VALUES_COUNT representative non-null values */
function pickSampleValues(nonNullValues: readonly unknown[]): readonly unknown[] {
  if (nonNullValues.length <= SAMPLE_VALUES_COUNT) {
    return [...nonNullValues];
  }

  // Deterministic: pick evenly spaced values
  const result: unknown[] = [];
  const step = nonNullValues.length / SAMPLE_VALUES_COUNT;
  for (let i = 0; i < SAMPLE_VALUES_COUNT; i++) {
    const index = Math.floor(i * step);
    result.push(nonNullValues[index]);
  }
  return result;
}

// ═══════════════════════════════════════════════════════════════════════════
// Column name normalization
// ═══════════════════════════════════════════════════════════════════════════

/**
 * Normalize a column name:
 * - Remove accents (NFD + strip diacritics)
 * - Lowercase
 * - Replace spaces/special chars with _
 * - Collapse multiple underscores
 * - Remove leading/trailing underscores
 * - Truncate to MAX_COLUMN_NAME_LENGTH
 */
export function normalizeColumnName(name: string): string {
  let normalized = name
    // Remove accents via NFD decomposition
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    // Lowercase
    .toLowerCase()
    // Replace non-alphanumeric with underscore
    .replace(/[^a-z0-9]/g, '_')
    // Collapse multiple underscores
    .replace(/_+/g, '_')
    // Remove leading/trailing underscores
    .replace(/^_+|_+$/g, '');

  // Handle empty result
  if (normalized === '') {
    normalized = 'column';
  }

  // Truncate
  if (normalized.length > MAX_COLUMN_NAME_LENGTH) {
    normalized = normalized.slice(0, MAX_COLUMN_NAME_LENGTH);
    // Don't end on an underscore after truncation
    normalized = normalized.replace(/_+$/, '');
  }

  return normalized;
}

// ═══════════════════════════════════════════════════════════════════════════
// Type inference rules (ordered — first >80% match wins)
// ═══════════════════════════════════════════════════════════════════════════

/**
 * Infer the ColumnDataType for a set of non-null values.
 * 10 rules tested in order; first rule matching >80% wins.
 */
function inferColumnType(
  nonNullValues: readonly unknown[],
  headerName: string,
): ColumnDataType {
  if (nonNullValues.length === 0) return 'text';

  const stringValues = nonNullValues.map((v) => String(v).trim());

  // Rule 1: Email
  if (matchRatio(stringValues, isEmail) >= TYPE_MATCH_THRESHOLD) return 'email';

  // Rule 2: Phone
  if (matchRatio(stringValues, isPhone) >= TYPE_MATCH_THRESHOLD) return 'phone';

  // Rule 3: URL
  if (matchRatio(stringValues, isUrl) >= TYPE_MATCH_THRESHOLD) return 'url';

  // Rule 4: Date
  if (matchRatio(stringValues, isDate) >= TYPE_MATCH_THRESHOLD) return 'date';

  // Rule 5: Boolean
  if (matchRatio(stringValues, isBoolean) >= TYPE_MATCH_THRESHOLD) return 'boolean';

  // Rule 6: Percentage
  if (matchRatio(stringValues, isPercentage) >= TYPE_MATCH_THRESHOLD) return 'percentage';
  // Also check: values 0-1 with label containing "%"
  if (
    headerName.includes('%') &&
    matchRatio(stringValues, isZeroToOneNumber) >= TYPE_MATCH_THRESHOLD
  ) {
    return 'percentage';
  }

  // Rule 7: Currency
  if (matchRatio(stringValues, isCurrency) >= TYPE_MATCH_THRESHOLD) return 'currency';
  // Also check: numeric values with label containing currency keywords
  const headerLower = headerName
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase();
  if (
    CURRENCY_LABEL_KEYWORDS.some((kw) => headerLower.includes(kw)) &&
    matchRatio(stringValues, isNumericString) >= TYPE_MATCH_THRESHOLD
  ) {
    return 'currency';
  }

  // Rule 8: Number
  if (matchRatio(stringValues, isNumericString) >= TYPE_MATCH_THRESHOLD) return 'number';

  // Rule 9: Enum (< 20 unique values AND ratio < 0.3)
  if (isEnumColumn(stringValues)) return 'enum';

  // Rule 10: Default → text
  return 'text';
}

/** Compute ratio of values matching a predicate */
function matchRatio(values: readonly string[], predicate: (v: string) => boolean): number {
  if (values.length === 0) return 0;
  const matches = values.filter(predicate).length;
  return matches / values.length;
}

// ═══════════════════════════════════════════════════════════════════════════
// Individual type-check predicates
// ═══════════════════════════════════════════════════════════════════════════

function isEmail(value: string): boolean {
  return EMAIL_REGEX.test(value);
}

function isPhone(value: string): boolean {
  // Strip common formatting chars for digit count
  const digitsOnly = value.replace(/[^0-9]/g, '');
  if (digitsOnly.length < PHONE_MIN_DIGITS) return false;
  return PHONE_REGEX.test(value);
}

function isUrl(value: string): boolean {
  return URL_REGEX.test(value);
}

function isDate(value: string): boolean {
  if (ISO_DATE_REGEX.test(value)) return true;
  if (FR_DATE_REGEX.test(value)) return true;
  if (US_DATE_REGEX.test(value)) return true;
  if (MONTH_NAME_REGEX.test(value)) return true;
  return false;
}

function isBoolean(value: string): boolean {
  return BOOLEAN_VALUES.has(value.toLowerCase());
}

function isPercentage(value: string): boolean {
  return PERCENTAGE_REGEX.test(value);
}

function isZeroToOneNumber(value: string): boolean {
  const num = parseFloat(value);
  return !isNaN(num) && num >= 0 && num <= 1;
}

function isCurrency(value: string): boolean {
  return CURRENCY_SUFFIX_REGEX.test(value) || CURRENCY_PREFIX_REGEX.test(value);
}

function isNumericString(value: string): boolean {
  // Handle French number format: replace comma with dot
  const normalized = value.replace(/,/g, '.');
  // Remove spaces (thousand separators)
  const cleaned = normalized.replace(/\s/g, '');
  if (cleaned === '') return false;
  return !isNaN(parseFloat(cleaned)) && isFinite(Number(cleaned));
}

function isEnumColumn(values: readonly string[]): boolean {
  if (values.length === 0) return false;
  const uniqueValues = new Set(values.map((v) => v.trim()));
  if (uniqueValues.size >= ENUM_MAX_UNIQUE) return false;
  if (uniqueValues.size / values.length >= ENUM_RATIO_THRESHOLD) return false;
  return true;
}
