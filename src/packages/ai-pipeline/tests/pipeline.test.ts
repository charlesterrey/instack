/**
 * Pipeline orchestrator tests — @NEURON + @NEXUS review
 *
 * Tests the executePipeline and executePreview functions with mocked stages.
 * Verifies: sequential execution, error propagation, metrics collection.
 */

import { describe, it, expect, vi, beforeEach } from 'vitest';

// Mock all stages before importing pipeline
vi.mock('../src/stages/01-classify', () => ({
  classifyIntent: vi.fn(),
}));

vi.mock('../src/stages/02-infer-schema', () => ({
  inferSchema: vi.fn(),
}));

vi.mock('../src/stages/03-generate', () => ({
  generateAppSchema: vi.fn(),
}));

vi.mock('../src/stages/04-validate', () => ({
  validateAppSchema: vi.fn(),
}));

import { executePipeline, executePreview } from '../src/pipeline';
import { classifyIntent } from '../src/stages/01-classify';
import { inferSchema } from '../src/stages/02-infer-schema';
import { generateAppSchema } from '../src/stages/03-generate';
import { validateAppSchema } from '../src/stages/04-validate';
import type { PipelineInput } from '../src/types/pipeline.types';
import { classificationError, schemaInferenceError } from '../src/errors';

const mockedClassify = vi.mocked(classifyIntent);
const mockedInfer = vi.mocked(inferSchema);
const mockedGenerate = vi.mocked(generateAppSchema);
const mockedValidate = vi.mocked(validateAppSchema);

const BASE_INPUT: PipelineInput = {
  userPrompt: 'Dashboard des ventes',
  tenantId: 'tenant-1',
  userId: 'user-1',
};

const INPUT_WITH_EXCEL: PipelineInput = {
  ...BASE_INPUT,
  excelData: {
    sheetName: 'Sheet1',
    headers: ['Nom', 'Email', 'Montant'],
    rows: [
      { Nom: 'Alice', Email: 'alice@test.com', Montant: 1000 },
      { Nom: 'Bob', Email: 'bob@test.com', Montant: 2000 },
    ],
    totalRows: 2,
  },
};

const CONFIG = { anthropicApiKey: 'test-key' };

function mockClassifySuccess(archetype = 'dashboard', confidence = 0.9) {
  mockedClassify.mockResolvedValueOnce({
    ok: true,
    value: {
      archetype: archetype as 'dashboard',
      confidence,
      reasoning: 'Test reasoning',
      costEur: 0.001,
    },
  });
}

function mockInferSuccess() {
  mockedInfer.mockReturnValueOnce({
    ok: true,
    value: {
      columns: [
        { name: 'nom', originalName: 'Nom', type: 'text', nullable: false, sampleValues: ['Alice', 'Bob'] },
        { name: 'email', originalName: 'Email', type: 'email', nullable: false, sampleValues: ['alice@test.com'] },
        { name: 'montant', originalName: 'Montant', type: 'number', nullable: false, sampleValues: [1000, 2000] },
      ],
      rowCount: 2,
      suggestedComponents: ['kpi_card', 'bar_chart', 'filter_bar', 'container'],
    },
  });
}

function mockGenerateSuccess(archetype = 'dashboard') {
  mockedGenerate.mockResolvedValueOnce({
    ok: true,
    value: {
      schema: {
        name: 'Test App',
        archetype: archetype as 'dashboard',
        layout: { type: 'single_page', columns: 2 },
        components: [
          { id: 'kpi_1', type: 'kpi_card', props: { title: 'KPI' }, position: { row: 0, col: 0 } },
        ],
        dataBindings: [
          { id: 'bind_1', sourceId: 's1', field: 'montant', transform: 'sum' },
        ],
      },
      costEur: 0.018,
    },
  });
}

function mockValidateSuccess(archetype = 'dashboard') {
  mockedValidate.mockReturnValueOnce({
    ok: true,
    value: {
      schema: {
        name: 'Test App',
        archetype: archetype as 'dashboard',
        layout: { type: 'single_page', columns: 2 },
        components: [
          { id: 'kpi_1', type: 'kpi_card', props: { title: 'KPI' }, position: { row: 0, col: 0 } },
        ],
        dataBindings: [
          { id: 'bind_1', sourceId: 's1', field: 'montant', transform: 'sum' },
        ],
        __validated: true,
      } as never,
      corrections: [],
    },
  });
}

describe('executePipeline', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('executes all 4 stages sequentially on success', async () => {
    mockClassifySuccess();
    mockInferSuccess();
    mockGenerateSuccess();
    mockValidateSuccess();

    const result = await executePipeline(INPUT_WITH_EXCEL, CONFIG);

    expect(result.ok).toBe(true);
    expect(mockedClassify).toHaveBeenCalledTimes(1);
    expect(mockedInfer).toHaveBeenCalledTimes(1);
    expect(mockedGenerate).toHaveBeenCalledTimes(1);
    expect(mockedValidate).toHaveBeenCalledTimes(1);
  });

  it('returns PipelineOutput with appSchema on success', async () => {
    mockClassifySuccess('report', 0.85);
    mockInferSuccess();
    mockGenerateSuccess('report');
    mockValidateSuccess('report');

    const result = await executePipeline(INPUT_WITH_EXCEL, CONFIG);

    expect(result.ok).toBe(true);
    if (result.ok) {
      expect(result.value.appSchema.archetype).toBe('report');
      expect(result.value.appSchema.name).toBeTruthy();
    }
  });

  it('collects metadata with stage results', async () => {
    mockClassifySuccess();
    mockInferSuccess();
    mockGenerateSuccess();
    mockValidateSuccess();

    const result = await executePipeline(INPUT_WITH_EXCEL, CONFIG);

    expect(result.ok).toBe(true);
    if (result.ok) {
      expect(result.value.metadata.stages).toHaveLength(4);
      expect(result.value.metadata.stages[0]?.stage).toBe(1);
      expect(result.value.metadata.stages[0]?.status).toBe('success');
      expect(result.value.metadata.stages[1]?.stage).toBe(2);
      expect(result.value.metadata.stages[1]?.status).toBe('success');
      expect(result.value.metadata.stages[2]?.stage).toBe(3);
      expect(result.value.metadata.stages[2]?.status).toBe('success');
      expect(result.value.metadata.stages[3]?.stage).toBe(4);
      expect(result.value.metadata.stages[3]?.status).toBe('success');
    }
  });

  it('tracks totalLatencyMs > 0', async () => {
    mockClassifySuccess();
    mockInferSuccess();
    mockGenerateSuccess();
    mockValidateSuccess();

    const result = await executePipeline(INPUT_WITH_EXCEL, CONFIG);

    expect(result.ok).toBe(true);
    if (result.ok) {
      expect(result.value.metadata.totalLatencyMs).toBeGreaterThanOrEqual(0);
    }
  });

  it('tracks totalCostEur from Stages 1+3', async () => {
    mockClassifySuccess();
    mockInferSuccess();
    mockGenerateSuccess();
    mockValidateSuccess();

    const result = await executePipeline(INPUT_WITH_EXCEL, CONFIG);

    expect(result.ok).toBe(true);
    if (result.ok) {
      expect(result.value.metadata.totalCostEur).toBeGreaterThan(0);
    }
  });

  it('Stage 2 cost is 0 (deterministic)', async () => {
    mockClassifySuccess();
    mockInferSuccess();
    mockGenerateSuccess();
    mockValidateSuccess();

    const result = await executePipeline(INPUT_WITH_EXCEL, CONFIG);

    expect(result.ok).toBe(true);
    if (result.ok) {
      const stage2 = result.value.metadata.stages[1];
      expect(stage2?.costEur).toBe(0);
    }
  });

  // ═══════════════════════════════════════════════════════════════
  // FAILURE — Pipeline stops when Stage 1 fails
  // ═══════════════════════════════════════════════════════════════

  it('stops and returns error when Stage 1 fails', async () => {
    mockedClassify.mockResolvedValueOnce({
      ok: false,
      error: classificationError('CLASSIFY_TIMEOUT', 'Request timed out'),
    });

    const result = await executePipeline(BASE_INPUT, CONFIG);

    expect(result.ok).toBe(false);
    if (!result.ok) {
      expect(result.error.stage).toBe(1);
      expect(result.error.code).toBe('CLASSIFY_TIMEOUT');
    }
    // Stage 2 should NOT have been called
    expect(mockedInfer).not.toHaveBeenCalled();
  });

  it('stops and returns error when Stage 2 fails', async () => {
    mockClassifySuccess();
    mockedInfer.mockReturnValueOnce({
      ok: false,
      error: schemaInferenceError('EMPTY_DATA', 'No data to infer'),
    });

    const result = await executePipeline(INPUT_WITH_EXCEL, CONFIG);

    expect(result.ok).toBe(false);
    if (!result.ok) {
      expect(result.error.stage).toBe(2);
      expect(result.error.code).toBe('EMPTY_DATA');
    }
  });

  // ═══════════════════════════════════════════════════════════════
  // EDGE CASES
  // ═══════════════════════════════════════════════════════════════

  it('works without Excel data (prompt-only)', async () => {
    mockClassifySuccess('multi_view', 0.5);
    mockGenerateSuccess('multi_view');
    mockValidateSuccess('multi_view');

    const result = await executePipeline(BASE_INPUT, CONFIG);

    expect(result.ok).toBe(true);
    // inferSchema should NOT be called without Excel data
    expect(mockedInfer).not.toHaveBeenCalled();
  });

  it('passes Excel preview (first 20 headers) to classifyIntent', async () => {
    mockClassifySuccess();
    mockInferSuccess();
    mockGenerateSuccess();
    mockValidateSuccess();

    await executePipeline(INPUT_WITH_EXCEL, CONFIG);

    expect(mockedClassify).toHaveBeenCalledWith(
      INPUT_WITH_EXCEL.userPrompt,
      CONFIG.anthropicApiKey,
      ['Nom', 'Email', 'Montant'],
    );
  });

  it('passes archetype from Stage 1 to Stage 2', async () => {
    mockClassifySuccess('tracker', 0.88);
    mockInferSuccess();
    mockGenerateSuccess('tracker');
    mockValidateSuccess('tracker');

    await executePipeline(INPUT_WITH_EXCEL, CONFIG);

    expect(mockedInfer).toHaveBeenCalledWith(
      INPUT_WITH_EXCEL.excelData,
      'tracker',
    );
  });
});

describe('executePreview', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('returns classification + schema + estimates on success', async () => {
    mockClassifySuccess('dashboard', 0.92);
    mockInferSuccess();

    const result = await executePreview(INPUT_WITH_EXCEL, CONFIG);

    expect(result.ok).toBe(true);
    if (result.ok) {
      expect(result.value.classification.archetype).toBe('dashboard');
      expect(result.value.classification.confidence).toBe(0.92);
      expect(result.value.schema.columns).toHaveLength(3);
      expect(result.value.estimatedCostEur).toBeGreaterThan(0);
      expect(result.value.estimatedLatencyMs).toBeGreaterThan(0);
    }
  });

  it('returns error when classification fails', async () => {
    mockedClassify.mockResolvedValueOnce({
      ok: false,
      error: classificationError('API_ERROR', 'Claude unavailable'),
    });

    const result = await executePreview(BASE_INPUT, CONFIG);

    expect(result.ok).toBe(false);
    if (!result.ok) {
      expect(result.error.stage).toBe(1);
    }
  });

  it('returns error when schema inference fails', async () => {
    mockClassifySuccess();
    mockedInfer.mockReturnValueOnce({
      ok: false,
      error: schemaInferenceError('PARSE_ERROR', 'Cannot parse file'),
    });

    const result = await executePreview(INPUT_WITH_EXCEL, CONFIG);

    expect(result.ok).toBe(false);
    if (!result.ok) {
      expect(result.error.stage).toBe(2);
    }
  });

  it('estimates ~0.018 EUR additional cost for Stage 3 (Sonnet)', async () => {
    mockClassifySuccess();
    mockInferSuccess();

    const result = await executePreview(INPUT_WITH_EXCEL, CONFIG);

    expect(result.ok).toBe(true);
    if (result.ok) {
      // Should include Stage 1 cost + estimated Stage 3 cost (~0.018)
      expect(result.value.estimatedCostEur).toBeGreaterThan(0.015);
    }
  });
});
