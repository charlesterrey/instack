/**
 * Tests for Stage 3: App Generation.
 * @NEURON owns this file.
 *
 * 20+ tests covering:
 * - All 8 archetype generation patterns
 * - Post-processing (ID uniqueness, column refs, limits)
 * - Retry logic and timeout handling
 * - Cost calculation
 * - Edge cases (empty bindings, max components)
 *
 * ALL tests mock the Anthropic SDK — zero real API calls.
 */

import { describe, it, expect, vi, beforeEach } from 'vitest';
import { generateAppSchema } from '../src/stages/03-generate';
import type { ClassificationResult, InferredSchema } from '../src/types/pipeline.types';

// ─── Mock Setup ──────────────────────────────────────────────────────────

interface MockToolUseBlock {
  type: 'tool_use';
  id: string;
  name: string;
  input: Record<string, unknown>;
}

interface MockResponse {
  id: string;
  type: string;
  role: string;
  content: Array<MockToolUseBlock | { type: 'text'; text: string }>;
  model: string;
  stop_reason: string;
  usage: { input_tokens: number; output_tokens: number };
}

function makeGenerateResponse(
  schema: Record<string, unknown>,
  inputTokens = 2000,
  outputTokens = 800,
): MockResponse {
  return {
    id: 'msg_gen_test',
    type: 'message',
    role: 'assistant',
    content: [
      {
        type: 'tool_use',
        id: 'toolu_gen_test',
        name: 'create_app',
        input: schema,
      },
    ],
    model: 'claude-sonnet-4-20250514',
    stop_reason: 'tool_use',
    usage: { input_tokens: inputTokens, output_tokens: outputTokens },
  };
}

function makeValidAppSchema(archetype = 'dashboard', componentType = 'kpi_card') {
  return {
    name: 'Test App',
    archetype,
    layout: { type: 'single_page', columns: 2 },
    components: [
      {
        id: `${componentType}_1`,
        type: componentType,
        props: { title: 'Test KPI' },
        position: { row: 0, col: 0 },
      },
    ],
    dataBindings: [
      { id: 'bind_1', sourceId: 'source_1', field: 'montant', transform: 'sum' },
    ],
  };
}

let mockCreate: ReturnType<typeof vi.fn>;

vi.mock('@anthropic-ai/sdk', () => {
  return {
    default: class MockAnthropic {
      messages: { create: ReturnType<typeof vi.fn> };
      constructor() {
        this.messages = { create: mockCreate };
      }
    },
  };
});

beforeEach(() => {
  mockCreate = vi.fn();
});

const API_KEY = 'sk-test-key-for-testing';

const defaultClassification: ClassificationResult = {
  archetype: 'dashboard',
  confidence: 0.9,
  reasoning: 'Besoin de KPIs et graphiques.',
};

const defaultSchema: InferredSchema = {
  columns: [
    { name: 'montant', originalName: 'Montant', type: 'currency', nullable: false, sampleValues: [100, 200] },
    { name: 'date', originalName: 'Date', type: 'date', nullable: false, sampleValues: ['2024-01-01'] },
    { name: 'categorie', originalName: 'Categorie', type: 'enum', nullable: false, sampleValues: ['A', 'B'], enumValues: ['A', 'B', 'C'] },
  ],
  rowCount: 100,
  suggestedComponents: ['kpi_card', 'bar_chart', 'filter_bar', 'container'],
};

// ─── Tests ───────────────────────────────────────────────────────────────

describe('Stage 3: App Generation', () => {
  describe('Successful generation', () => {
    it('generates a valid dashboard app', async () => {
      mockCreate.mockResolvedValueOnce(makeGenerateResponse(makeValidAppSchema()));
      const result = await generateAppSchema(defaultClassification, defaultSchema, 'tableau de bord ventes', API_KEY);

      expect(result.ok).toBe(true);
      if (result.ok) {
        expect(result.value.schema.archetype).toBe('dashboard');
        expect(result.value.schema.components.length).toBeGreaterThan(0);
        expect(result.value.costEur).toBeGreaterThan(0);
      }
    });

    it('generates crud_form archetype', async () => {
      mockCreate.mockResolvedValueOnce(makeGenerateResponse(makeValidAppSchema('crud_form', 'form_field')));
      const result = await generateAppSchema(
        { ...defaultClassification, archetype: 'crud_form' },
        defaultSchema, 'formulaire incidents', API_KEY,
      );
      expect(result.ok).toBe(true);
      if (result.ok) expect(result.value.schema.archetype).toBe('crud_form');
    });

    it('generates tracker archetype', async () => {
      mockCreate.mockResolvedValueOnce(makeGenerateResponse(makeValidAppSchema('tracker', 'data_table')));
      const result = await generateAppSchema(
        { ...defaultClassification, archetype: 'tracker' },
        defaultSchema, 'suivi projets', API_KEY,
      );
      expect(result.ok).toBe(true);
      if (result.ok) expect(result.value.schema.archetype).toBe('tracker');
    });

    it('generates report archetype', async () => {
      mockCreate.mockResolvedValueOnce(makeGenerateResponse(makeValidAppSchema('report', 'data_table')));
      const result = await generateAppSchema(
        { ...defaultClassification, archetype: 'report' },
        defaultSchema, 'rapport mensuel', API_KEY,
      );
      expect(result.ok).toBe(true);
      if (result.ok) expect(result.value.schema.archetype).toBe('report');
    });

    it('generates approval archetype', async () => {
      mockCreate.mockResolvedValueOnce(makeGenerateResponse(makeValidAppSchema('approval', 'form_field')));
      const result = await generateAppSchema(
        { ...defaultClassification, archetype: 'approval' },
        defaultSchema, 'demandes de conge', API_KEY,
      );
      expect(result.ok).toBe(true);
      if (result.ok) expect(result.value.schema.archetype).toBe('approval');
    });

    it('generates checklist archetype', async () => {
      mockCreate.mockResolvedValueOnce(makeGenerateResponse(makeValidAppSchema('checklist', 'form_field')));
      const result = await generateAppSchema(
        { ...defaultClassification, archetype: 'checklist' },
        defaultSchema, 'inspection vehicules', API_KEY,
      );
      expect(result.ok).toBe(true);
      if (result.ok) expect(result.value.schema.archetype).toBe('checklist');
    });

    it('generates gallery archetype', async () => {
      mockCreate.mockResolvedValueOnce(makeGenerateResponse(makeValidAppSchema('gallery', 'data_table')));
      const result = await generateAppSchema(
        { ...defaultClassification, archetype: 'gallery' },
        defaultSchema, 'catalogue produits', API_KEY,
      );
      expect(result.ok).toBe(true);
      if (result.ok) expect(result.value.schema.archetype).toBe('gallery');
    });

    it('generates multi_view archetype', async () => {
      mockCreate.mockResolvedValueOnce(makeGenerateResponse(makeValidAppSchema('multi_view', 'data_table')));
      const result = await generateAppSchema(
        { ...defaultClassification, archetype: 'multi_view' },
        defaultSchema, 'gestion complete equipe', API_KEY,
      );
      expect(result.ok).toBe(true);
      if (result.ok) expect(result.value.schema.archetype).toBe('multi_view');
    });
  });

  describe('Post-processing', () => {
    it('fixes duplicate component IDs', async () => {
      const schema = makeValidAppSchema();
      schema.components = [
        { id: 'kpi_1', type: 'kpi_card', props: { title: 'A' }, position: { row: 0, col: 0 } },
        { id: 'kpi_1', type: 'kpi_card', props: { title: 'B' }, position: { row: 0, col: 1 } },
      ];
      mockCreate.mockResolvedValueOnce(makeGenerateResponse(schema));
      const result = await generateAppSchema(defaultClassification, defaultSchema, 'test', API_KEY);
      expect(result.ok).toBe(true);
      if (result.ok) {
        const ids = result.value.schema.components.map((c) => c.id);
        expect(new Set(ids).size).toBe(ids.length);
      }
    });

    it('clamps component count to 20', async () => {
      const schema = makeValidAppSchema();
      schema.components = Array.from({ length: 25 }, (_, i) => ({
        id: `comp_${i}`,
        type: 'kpi_card' as const,
        props: { title: `KPI ${i}` },
        position: { row: i, col: 0 },
      }));
      mockCreate.mockResolvedValueOnce(makeGenerateResponse(schema));
      const result = await generateAppSchema(defaultClassification, defaultSchema, 'test', API_KEY);
      expect(result.ok).toBe(true);
      if (result.ok) {
        expect(result.value.schema.components.length).toBeLessThanOrEqual(20);
      }
    });

    it('fixes case-insensitive column references', async () => {
      const schema = makeValidAppSchema();
      schema.dataBindings = [
        { id: 'bind_1', sourceId: 's1', field: 'MONTANT', transform: 'sum' },
      ];
      mockCreate.mockResolvedValueOnce(makeGenerateResponse(schema));
      const result = await generateAppSchema(defaultClassification, defaultSchema, 'test', API_KEY);
      expect(result.ok).toBe(true);
      if (result.ok) {
        expect(result.value.schema.dataBindings[0].field).toBe('montant');
      }
    });

    it('filters out non-Phase-A component types', async () => {
      const schema = makeValidAppSchema();
      schema.components = [
        { id: 'kpi_1', type: 'kpi_card', props: {}, position: { row: 0, col: 0 } },
        { id: 'pie_1', type: 'pie_chart', props: {}, position: { row: 1, col: 0 } },
      ];
      mockCreate.mockResolvedValueOnce(makeGenerateResponse(schema as Record<string, unknown>));
      const result = await generateAppSchema(defaultClassification, defaultSchema, 'test', API_KEY);
      expect(result.ok).toBe(true);
      if (result.ok) {
        const types = result.value.schema.components.map((c) => c.type);
        expect(types).not.toContain('pie_chart');
      }
    });

    it('clamps position col to valid range', async () => {
      const schema = makeValidAppSchema();
      schema.components = [
        { id: 'kpi_1', type: 'kpi_card', props: {}, position: { row: 0, col: 99 } },
      ];
      mockCreate.mockResolvedValueOnce(makeGenerateResponse(schema));
      const result = await generateAppSchema(defaultClassification, defaultSchema, 'test', API_KEY);
      expect(result.ok).toBe(true);
      if (result.ok) {
        expect(result.value.schema.components[0].position.col).toBeLessThanOrEqual(3);
      }
    });
  });

  describe('Error handling', () => {
    it('returns error for missing API key', async () => {
      const result = await generateAppSchema(defaultClassification, defaultSchema, 'test', '');
      expect(result.ok).toBe(false);
      if (!result.ok) {
        expect(result.error.code).toBe('MISSING_API_KEY');
      }
    });

    it('returns error when Claude returns no tool_use', async () => {
      mockCreate.mockResolvedValue({
        id: 'msg', type: 'message', role: 'assistant',
        content: [{ type: 'text', text: 'Bonjour' }],
        model: 'claude-sonnet-4-20250514',
        stop_reason: 'end_turn',
        usage: { input_tokens: 100, output_tokens: 20 },
      });
      const result = await generateAppSchema(defaultClassification, defaultSchema, 'test', API_KEY);
      expect(result.ok).toBe(false);
      if (!result.ok) expect(result.error.code).toBe('GENERATION_FAILED');
    });

    it('returns error when Claude uses wrong tool', async () => {
      mockCreate.mockResolvedValue({
        id: 'msg', type: 'message', role: 'assistant',
        content: [{ type: 'tool_use', id: 'toolu', name: 'wrong_tool', input: {} }],
        model: 'claude-sonnet-4-20250514',
        stop_reason: 'tool_use',
        usage: { input_tokens: 100, output_tokens: 20 },
      });
      const result = await generateAppSchema(defaultClassification, defaultSchema, 'test', API_KEY);
      expect(result.ok).toBe(false);
    });

    it('retries on timeout', async () => {
      const abortError = new DOMException('The operation was aborted', 'AbortError');
      mockCreate.mockRejectedValueOnce(abortError);
      mockCreate.mockResolvedValueOnce(makeGenerateResponse(makeValidAppSchema()));

      const result = await generateAppSchema(defaultClassification, defaultSchema, 'test', API_KEY);
      expect(result.ok).toBe(true);
      expect(mockCreate).toHaveBeenCalledTimes(2);
    });

    it('fails after max retries', async () => {
      const abortError = new DOMException('The operation was aborted', 'AbortError');
      mockCreate.mockRejectedValue(abortError);

      const result = await generateAppSchema(defaultClassification, defaultSchema, 'test', API_KEY);
      expect(result.ok).toBe(false);
      if (!result.ok) expect(result.error.code).toBe('GENERATION_FAILED');
    });
  });

  describe('Cost calculation', () => {
    it('calculates cost from token usage', async () => {
      mockCreate.mockResolvedValueOnce(makeGenerateResponse(makeValidAppSchema(), 2000, 800));
      const result = await generateAppSchema(defaultClassification, defaultSchema, 'test', API_KEY);
      expect(result.ok).toBe(true);
      if (result.ok) {
        // 2000 * 3/1M + 800 * 15/1M = 0.006 + 0.012 = 0.018
        expect(result.value.costEur).toBeCloseTo(0.018, 4);
      }
    });
  });

  describe('Schema without data', () => {
    it('generates app without Excel data', async () => {
      const emptySchema: InferredSchema = { columns: [], rowCount: 0, suggestedComponents: [] };
      mockCreate.mockResolvedValueOnce(makeGenerateResponse({
        name: 'Simple App',
        archetype: 'checklist',
        layout: { type: 'single_page' },
        components: [
          { id: 'form_1', type: 'form_field', props: { label: 'Task' }, position: { row: 0, col: 0 } },
        ],
        dataBindings: [],
      }));
      const result = await generateAppSchema(
        { archetype: 'checklist', confidence: 0.8, reasoning: 'test' },
        emptySchema, 'checklist simple', API_KEY,
      );
      expect(result.ok).toBe(true);
      if (result.ok) {
        expect(result.value.schema.dataBindings).toHaveLength(0);
      }
    });
  });
});
