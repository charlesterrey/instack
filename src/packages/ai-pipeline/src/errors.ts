/** Pipeline error types — discriminated union by stage */

interface BaseError {
  readonly code: string;
  readonly message: string;
  readonly recoverable: boolean;
}

export interface ClassificationError extends BaseError {
  readonly stage: 1;
}

export interface SchemaInferenceError extends BaseError {
  readonly stage: 2;
}

export interface GenerationError extends BaseError {
  readonly stage: 3;
}

export interface ValidationError extends BaseError {
  readonly stage: 4;
}

export type PipelineError =
  | ClassificationError
  | SchemaInferenceError
  | GenerationError
  | ValidationError;

export function classificationError(code: string, message: string, recoverable = false): ClassificationError {
  return { stage: 1, code, message, recoverable };
}

export function schemaInferenceError(code: string, message: string, recoverable = false): SchemaInferenceError {
  return { stage: 2, code, message, recoverable };
}

export function generationError(code: string, message: string, recoverable = false): GenerationError {
  return { stage: 3, code, message, recoverable };
}

export function validationError(code: string, message: string, recoverable = false): ValidationError {
  return { stage: 4, code, message, recoverable };
}
