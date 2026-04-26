// @instack/ai-pipeline — 4-stage constrained generation pipeline

// Pipeline orchestrator
export { executePipeline, executePreview } from './pipeline';
export type { PipelineConfig } from './pipeline';

// Individual stages
export { classifyIntent } from './stages/01-classify';
export { inferSchema } from './stages/02-infer-schema';

// Excel parser
export { parseExcelBuffer, parseCSVString } from './lib/excel-parser';

// Types
export type {
  PipelineInput,
  PipelineOutput,
  PipelineMetadata,
  StageResult,
  ClassificationResult,
  InferredSchema,
  TypedColumn,
  ColumnDataType,
  ExcelSheet,
} from './types/pipeline.types';

// Errors
export type {
  PipelineError,
  ClassificationError,
  SchemaInferenceError,
  GenerationError,
  ValidationError,
} from './errors';
export {
  classificationError,
  schemaInferenceError,
  generationError,
  validationError,
} from './errors';
