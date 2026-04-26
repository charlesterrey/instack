import type { AppArchetype, ComponentType, AppSchema } from '@instack/shared';

/** Raw Excel sheet data fed into the pipeline */
export interface ExcelSheet {
  readonly sheetName: string;
  readonly headers: readonly string[];
  readonly rows: readonly Record<string, unknown>[];
  readonly totalRows: number;
}

/** Input to the full pipeline */
export interface PipelineInput {
  readonly userPrompt: string;
  readonly excelData?: ExcelSheet;
  readonly tenantId: string;
  readonly userId: string;
}

/** Output of a successful pipeline run */
export interface PipelineOutput {
  readonly appSchema: AppSchema;
  readonly metadata: PipelineMetadata;
}

/** Metadata collected across all stages */
export interface PipelineMetadata {
  readonly stages: readonly StageResult[];
  readonly totalLatencyMs: number;
  readonly totalCostEur: number;
}

/** Result of a single pipeline stage */
export interface StageResult {
  readonly stage: 1 | 2 | 3 | 4;
  readonly status: 'success' | 'error';
  readonly latencyMs: number;
  readonly costEur: number;
}

/** Stage 1 output: intent classification */
export interface ClassificationResult {
  readonly archetype: AppArchetype;
  readonly confidence: number;
  readonly reasoning: string;
}

/** A column with inferred type */
export interface TypedColumn {
  readonly name: string;
  readonly originalName: string;
  readonly type: ColumnDataType;
  readonly nullable: boolean;
  readonly sampleValues: readonly unknown[];
  readonly enumValues?: readonly string[];
}

/** Supported column data types (10 types) */
export type ColumnDataType =
  | 'text'
  | 'number'
  | 'date'
  | 'boolean'
  | 'email'
  | 'phone'
  | 'url'
  | 'currency'
  | 'percentage'
  | 'enum';

/** Stage 2 output: inferred schema */
export interface InferredSchema {
  readonly columns: readonly TypedColumn[];
  readonly rowCount: number;
  readonly suggestedComponents: readonly ComponentType[];
}
