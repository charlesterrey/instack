/**
 * Pipeline orchestrator — executes the 4-stage AI pipeline sequentially.
 * @NEURON owns this file. @NEXUS reviews architecture.
 *
 * Invariants:
 * - Every stage returns Result<T, PipelineError> — no throws
 * - If a stage fails, pipeline stops and returns the error with full context
 * - Latency and cost measured at every stage transition
 * - Total pipeline budget: <4s latency, <0.02 EUR cost
 */

import type { Result } from '@instack/shared';
import { ok, err } from '@instack/shared';
import type { PipelineInput, PipelineOutput, PipelineMetadata, StageResult, ClassificationResult, InferredSchema } from './types/pipeline.types';
import type { PipelineError } from './errors';
import { classifyIntent } from './stages/01-classify';
import { inferSchema } from './stages/02-infer-schema';

export interface PipelineConfig {
  readonly anthropicApiKey: string;
}

/** Execute the full AI pipeline (stages 1-2 for S03, stages 3-4 added in S04) */
export async function executePipeline(
  input: PipelineInput,
  config: PipelineConfig,
): Promise<Result<PipelineOutput, PipelineError>> {
  const pipelineStart = Date.now();
  const stageResults: StageResult[] = [];

  // ═══════════════════════════════════════════════════════════════════
  // STAGE 1: Intent Classification (@NEURON — Claude Haiku)
  // ═══════════════════════════════════════════════════════════════════
  const stage1Start = Date.now();

  const excelPreview = input.excelData
    ? input.excelData.headers.slice(0, 20).map(String)
    : undefined;

  const classifyResult = await classifyIntent(
    input.userPrompt,
    config.anthropicApiKey,
    excelPreview,
  );

  const stage1Latency = Date.now() - stage1Start;

  if (!classifyResult.ok) {
    stageResults.push({ stage: 1, status: 'error', latencyMs: stage1Latency, costEur: 0 });
    return err(classifyResult.error);
  }

  stageResults.push({
    stage: 1,
    status: 'success',
    latencyMs: stage1Latency,
    costEur: classifyResult.value.costEur ?? 0,
  });

  const classification: ClassificationResult = {
    archetype: classifyResult.value.archetype,
    confidence: classifyResult.value.confidence,
    reasoning: classifyResult.value.reasoning,
  };

  // ═══════════════════════════════════════════════════════════════════
  // STAGE 2: Schema Inference (@CONDUIT + @NEURON — Deterministic)
  // ═══════════════════════════════════════════════════════════════════
  const stage2Start = Date.now();

  let schema: InferredSchema;
  if (input.excelData) {
    const schemaResult = inferSchema(input.excelData, classification.archetype);
    if (!schemaResult.ok) {
      stageResults.push({ stage: 2, status: 'error', latencyMs: Date.now() - stage2Start, costEur: 0 });
      return err(schemaResult.error);
    }
    schema = schemaResult.value;
  } else {
    schema = { columns: [], rowCount: 0, suggestedComponents: [] };
  }

  stageResults.push({
    stage: 2,
    status: 'success',
    latencyMs: Date.now() - stage2Start,
    costEur: 0,
  });

  // ═══════════════════════════════════════════════════════════════════
  // STAGES 3-4: Generation + Validation (added in S04)
  // For now, return a draft AppSchema from stages 1-2
  // ═══════════════════════════════════════════════════════════════════

  const totalLatencyMs = Date.now() - pipelineStart;
  const totalCostEur = stageResults.reduce((sum, s) => sum + s.costEur, 0);

  const metadata: PipelineMetadata = {
    stages: stageResults,
    totalLatencyMs,
    totalCostEur,
  };

  const appSchema = {
    id: '',
    name: input.userPrompt.slice(0, 100),
    archetype: classification.archetype,
    layout: { type: 'single_page' as const, columns: schema.columns.length > 5 ? 2 : 1 },
    components: [],
    dataBindings: [],
  };

  return ok({ appSchema, metadata });
}

/** Execute only stages 1+2 for the preview endpoint */
export async function executePreview(
  input: PipelineInput,
  config: PipelineConfig,
): Promise<Result<{
  classification: ClassificationResult;
  schema: InferredSchema;
  estimatedCostEur: number;
  estimatedLatencyMs: number;
}, PipelineError>> {
  const start = Date.now();

  const excelPreview = input.excelData
    ? input.excelData.headers.slice(0, 20).map(String)
    : undefined;

  const classifyResult = await classifyIntent(
    input.userPrompt,
    config.anthropicApiKey,
    excelPreview,
  );

  if (!classifyResult.ok) {
    return err(classifyResult.error);
  }

  const classification: ClassificationResult = {
    archetype: classifyResult.value.archetype,
    confidence: classifyResult.value.confidence,
    reasoning: classifyResult.value.reasoning,
  };

  let schema: InferredSchema = { columns: [], rowCount: 0, suggestedComponents: [] };
  if (input.excelData) {
    const schemaResult = inferSchema(input.excelData, classification.archetype);
    if (!schemaResult.ok) {
      return err(schemaResult.error);
    }
    schema = schemaResult.value;
  }

  return ok({
    classification,
    schema,
    estimatedCostEur: (classifyResult.value.costEur ?? 0) + 0.018,
    estimatedLatencyMs: Date.now() - start + 3000,
  });
}
