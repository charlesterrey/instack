// @instack/ai-pipeline — 4-stage constrained generation pipeline

// Pipeline orchestrator
export { executePipeline, executePreview } from './pipeline';
export type { PipelineConfig } from './pipeline';

// Individual stages
export { classifyIntent } from './stages/01-classify';
export { inferSchema } from './stages/02-infer-schema';
export { generateAppSchema } from './stages/03-generate';
export type { GenerateResult } from './stages/03-generate';
export { validateAppSchema } from './stages/04-validate';
export type { ValidationResult } from './stages/04-validate';

// Validators
export { validateSchema } from './validators/schema.validator';
export { validateLayout } from './validators/layout.validator';
export { validateSecurity } from './validators/security.validator';
export type { SecurityViolation, SecurityValidationResult } from './validators/security.validator';

// Schemas
export { generatedAppSchema, brandAsValidated, PHASE_A_COMPONENT_TYPES } from './schemas/generate.schema';
export type { GeneratedAppSchema, GeneratedComponent, GeneratedDataBinding, ValidatedAppSchema } from './schemas/generate.schema';

// Prompts
export { CREATE_APP_TOOL_DEFINITION, buildGenerateUserMessage } from './prompts/generate.prompt';

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
