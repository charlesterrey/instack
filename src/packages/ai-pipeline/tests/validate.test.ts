/**
 * Tests for Stage 4: 3-Pass Validation.
 * @NEURON + @PHANTOM own this file.
 *
 * 18+ tests covering:
 * - Pass 1: Zod schema validation (5 tests)
 * - Pass 2: Layout validation + auto-correction (5 tests)
 * - Pass 3: Security scanning (6 tests)
 * - Integration: full 3-pass pipeline (2 tests)
 */

import { describe, it, expect } from 'vitest';
import { validateAppSchema } from '../src/stages/04-validate';
import { validateSchema } from '../src/validators/schema.validator';
import { validateLayout } from '../src/validators/layout.validator';
import { validateSecurity } from '../src/validators/security.validator';
import type { GeneratedAppSchema } from '../src/schemas/generate.schema';

function makeValidSchema(overrides?: Partial<GeneratedAppSchema>): GeneratedAppSchema {
  return {
    name: 'Test App',
    archetype: 'dashboard',
    layout: { type: 'single_page', columns: 2 },
    components: [
      { id: 'kpi_1', type: 'kpi_card', props: { title: 'Total' }, position: { row: 0, col: 0 } },
      { id: 'table_1', type: 'data_table', props: { title: 'Details' }, position: { row: 1, col: 0, span: 2 } },
    ],
    dataBindings: [
      { id: 'bind_1', sourceId: 'source_1', field: 'montant', transform: 'sum' },
    ],
    ...overrides,
  };
}

const SOURCE_COLUMNS = ['montant', 'date', 'categorie', 'statut'];

// ─── Pass 1: Zod Schema Validation ──────────────────────────────────────

describe('Pass 1: Schema Validation', () => {
  it('accepts a valid schema', () => {
    const result = validateSchema(makeValidSchema());
    expect(result.ok).toBe(true);
  });

  it('rejects schema without name', () => {
    const schema = makeValidSchema();
    const { name: _, ...noName } = schema;
    const result = validateSchema(noName);
    expect(result.ok).toBe(false);
  });

  it('rejects schema with empty components array', () => {
    const result = validateSchema(makeValidSchema({ components: [] }));
    expect(result.ok).toBe(false);
  });

  it('rejects schema with invalid component type', () => {
    const result = validateSchema({
      ...makeValidSchema(),
      components: [
        { id: 'pie_1', type: 'pie_chart', props: {}, position: { row: 0, col: 0 } },
      ],
    });
    expect(result.ok).toBe(false);
  });

  it('rejects schema with >20 components', () => {
    const components = Array.from({ length: 21 }, (_, i) => ({
      id: `comp_${i}`, type: 'kpi_card' as const, props: {}, position: { row: i, col: 0 },
    }));
    const result = validateSchema(makeValidSchema({ components }));
    expect(result.ok).toBe(false);
  });
});

// ─── Pass 2: Layout Validation ──────────────────────────────────────────

describe('Pass 2: Layout Validation', () => {
  it('accepts valid layout', () => {
    const result = validateLayout(makeValidSchema());
    expect(result.ok).toBe(true);
    if (result.ok) expect(result.value.corrections).toHaveLength(0);
  });

  it('clamps layout columns > 4', () => {
    const schema = makeValidSchema({ layout: { type: 'single_page', columns: 8 } });
    const result = validateLayout(schema);
    expect(result.ok).toBe(true);
    if (result.ok) {
      expect(result.value.schema.layout.columns).toBe(4);
      expect(result.value.corrections.length).toBeGreaterThan(0);
    }
  });

  it('fixes duplicate component IDs', () => {
    const schema = makeValidSchema({
      components: [
        { id: 'dup', type: 'kpi_card', props: {}, position: { row: 0, col: 0 } },
        { id: 'dup', type: 'kpi_card', props: {}, position: { row: 1, col: 0 } },
      ],
    });
    const result = validateLayout(schema);
    expect(result.ok).toBe(true);
    if (result.ok) {
      const ids = result.value.schema.components.map((c) => c.id);
      expect(new Set(ids).size).toBe(ids.length);
    }
  });

  it('removes references to unknown bindings', () => {
    const schema = makeValidSchema({
      components: [
        { id: 'kpi_1', type: 'kpi_card', props: {}, position: { row: 0, col: 0 }, dataBinding: 'nonexistent' },
      ],
    });
    const result = validateLayout(schema);
    expect(result.ok).toBe(true);
    if (result.ok) {
      expect(result.value.schema.components[0].dataBinding).toBeUndefined();
    }
  });

  it('removes bindings referencing unknown source columns', () => {
    const schema = makeValidSchema({
      dataBindings: [
        { id: 'bind_1', sourceId: 's1', field: 'unknown_column' },
      ],
    });
    const result = validateLayout(schema, SOURCE_COLUMNS);
    expect(result.ok).toBe(true);
    if (result.ok) {
      expect(result.value.schema.dataBindings).toHaveLength(0);
    }
  });
});

// ─── Pass 3: Security Validation ────────────────────────────────────────

describe('Pass 3: Security Validation', () => {
  it('accepts clean schema', () => {
    const result = validateSecurity(makeValidSchema() as unknown as Record<string, unknown>);
    expect(result.ok).toBe(true);
  });

  it('rejects schema with <script> tag', () => {
    const schema = makeValidSchema();
    (schema as Record<string, unknown>).components = [
      { id: 'xss', type: 'kpi_card', props: { title: '<script>alert(1)</script>' }, position: { row: 0, col: 0 } },
    ];
    const result = validateSecurity(schema as unknown as Record<string, unknown>);
    expect(result.ok).toBe(false);
  });

  it('rejects javascript: URI', () => {
    const schema = {
      ...makeValidSchema(),
      components: [
        { id: 'xss', type: 'kpi_card', props: { title: 'javascript:alert(1)' }, position: { row: 0, col: 0 } },
      ],
    };
    const result = validateSecurity(schema as unknown as Record<string, unknown>);
    expect(result.ok).toBe(false);
  });

  it('rejects on* event handlers', () => {
    const schema = {
      ...makeValidSchema(),
      components: [
        { id: 'xss', type: 'kpi_card', props: { title: 'onerror=alert(1)' }, position: { row: 0, col: 0 } },
      ],
    };
    const result = validateSecurity(schema as unknown as Record<string, unknown>);
    expect(result.ok).toBe(false);
  });

  it('rejects template literal injection ${}', () => {
    const schema = {
      ...makeValidSchema(),
      components: [
        { id: 'inj', type: 'kpi_card', props: { title: '${process.env.SECRET}' }, position: { row: 0, col: 0 } },
      ],
    };
    const result = validateSecurity(schema as unknown as Record<string, unknown>);
    expect(result.ok).toBe(false);
  });

  it('rejects SQL injection patterns', () => {
    const schema = {
      ...makeValidSchema(),
      components: [
        { id: 'sql', type: 'kpi_card', props: { title: "' OR '1'='1" }, position: { row: 0, col: 0 } },
      ],
    };
    const result = validateSecurity(schema as unknown as Record<string, unknown>);
    expect(result.ok).toBe(false);
  });
});

// ─── Integration: Full 3-Pass Validation ────────────────────────────────

describe('Stage 4: Full Validation Pipeline', () => {
  it('validates a clean schema end-to-end', () => {
    const result = validateAppSchema(makeValidSchema(), SOURCE_COLUMNS);
    expect(result.ok).toBe(true);
    if (result.ok) {
      expect(result.value.schema.name).toBe('Test App');
      expect(result.value.schema.archetype).toBe('dashboard');
      expect(result.value.corrections).toHaveLength(0);
    }
  });

  it('rejects schema with security threat even if structurally valid', () => {
    const schema = {
      ...makeValidSchema(),
      components: [
        { id: 'kpi_1', type: 'kpi_card', props: { title: '<script>hack</script>' }, position: { row: 0, col: 0 } },
      ],
    };
    const result = validateAppSchema(schema, SOURCE_COLUMNS);
    expect(result.ok).toBe(false);
    if (!result.ok) {
      expect(result.error.code).toBe('SECURITY_VIOLATION');
    }
  });
});
