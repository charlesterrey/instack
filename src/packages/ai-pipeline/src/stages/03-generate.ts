/**
 * Stage 3: Constrained App Generation using Claude Sonnet 4.
 * @NEURON owns this file. @NEXUS reviews architecture.
 *
 * Generates a complete app schema via tool_use mode.
 * Claude is forced to call the create_app tool — no raw JSON parsing.
 *
 * Invariants:
 * - Uses tool_use with tool_choice forced to create_app
 * - 15-second timeout per request
 * - 2 retries with exponential backoff
 * - Post-processing: ID uniqueness, column ref validation, component limits
 * - Tracks token usage and cost in EUR
 */

import Anthropic from '@anthropic-ai/sdk';
import type { Result } from '@instack/shared';
import { ok, err } from '@instack/shared';
import type { GenerationError } from '../errors';
import { generationError } from '../errors';
import type { ClassificationResult, InferredSchema } from '../types/pipeline.types';
import type { GeneratedAppSchema } from '../schemas/generate.schema';
import { generatedAppSchema, PHASE_A_COMPONENT_TYPES } from '../schemas/generate.schema';
import {
  GENERATE_SYSTEM_PROMPT,
  CREATE_APP_TOOL_DEFINITION,
  buildGenerateUserMessage,
} from '../prompts/generate.prompt';

/** Claude Sonnet 4 model identifier */
const MODEL = 'claude-sonnet-4-20250514';

/** Request timeout in milliseconds */
const TIMEOUT_MS = 15_000;

/** Maximum number of attempts (initial + retries) */
const MAX_ATTEMPTS = 3;

/** Base delay for exponential backoff in milliseconds */
const BASE_BACKOFF_MS = 1_000;

/** Max components per app */
const MAX_COMPONENTS = 20;

/** Cost per token in EUR (Sonnet pricing) */
const INPUT_TOKEN_COST_EUR = 3.0 / 1_000_000;
const OUTPUT_TOKEN_COST_EUR = 15.0 / 1_000_000;

export interface GenerateResult {
  readonly schema: GeneratedAppSchema;
  readonly costEur: number;
}

/**
 * Generate a complete app schema from classification + inferred schema.
 *
 * @param classification - Stage 1 output
 * @param schema - Stage 2 output (inferred columns)
 * @param userPrompt - Original user prompt
 * @param apiKey - Anthropic API key
 * @returns Result with GeneratedAppSchema on success
 */
export async function generateAppSchema(
  classification: ClassificationResult,
  schema: InferredSchema,
  userPrompt: string,
  apiKey: string,
): Promise<Result<GenerateResult, GenerationError>> {
  if (!apiKey.trim()) {
    return err(
      generationError('MISSING_API_KEY', 'La cle API Anthropic est manquante.', false),
    );
  }

  const client = new Anthropic({ apiKey });
  const userMessage = buildGenerateUserMessage(userPrompt, classification, schema);
  const sourceColumns = schema.columns.map((c) => c.name);

  let lastError: unknown;

  for (let attempt = 0; attempt < MAX_ATTEMPTS; attempt++) {
    if (attempt > 0) {
      const delay = BASE_BACKOFF_MS * Math.pow(2, attempt - 1);
      await sleep(delay);
    }

    try {
      const result = await callSonnetWithTimeout(client, userMessage, sourceColumns);
      if (result.ok) {
        return result;
      }
      lastError = result.error;

      // Non-recoverable errors stop retries
      if (!result.error.recoverable) {
        return result;
      }
    } catch (caught: unknown) {
      lastError = caught;
    }
  }

  const errorMessage = lastError instanceof Error ? lastError.message : String(lastError);
  return err(
    generationError(
      'GENERATION_FAILED',
      `La generation a echoue apres ${MAX_ATTEMPTS} tentatives: ${errorMessage}`,
      false,
    ),
  );
}

/** Call Claude Sonnet with timeout and validate response */
async function callSonnetWithTimeout(
  client: Anthropic,
  userMessage: string,
  sourceColumns: readonly string[],
): Promise<Result<GenerateResult, GenerationError>> {
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), TIMEOUT_MS);

  try {
    const response = await client.messages.create(
      {
        model: MODEL,
        max_tokens: 4096,
        temperature: 0,
        system: GENERATE_SYSTEM_PROMPT,
        tools: [CREATE_APP_TOOL_DEFINITION as Anthropic.Tool],
        tool_choice: { type: 'tool', name: 'create_app' },
        messages: [{ role: 'user', content: userMessage }],
      },
      { signal: controller.signal },
    );

    clearTimeout(timeoutId);
    return parseAndPostProcess(response, sourceColumns);
  } catch (caught: unknown) {
    clearTimeout(timeoutId);

    if (isAbortError(caught)) {
      return err(
        generationError('TIMEOUT', `Le delai de ${TIMEOUT_MS}ms a ete depasse.`, true),
      );
    }

    throw caught;
  }
}

/** Parse tool_use response and apply post-processing fixes */
function parseAndPostProcess(
  response: Anthropic.Message,
  sourceColumns: readonly string[],
): Result<GenerateResult, GenerationError> {
  const toolUseBlock = response.content.find(
    (block): block is Anthropic.ContentBlock & { type: 'tool_use' } =>
      block.type === 'tool_use',
  );

  if (!toolUseBlock) {
    return err(
      generationError('NO_TOOL_USE', 'Claude n\'a pas utilise l\'outil create_app.', true),
    );
  }

  if (toolUseBlock.name !== 'create_app') {
    return err(
      generationError('WRONG_TOOL', `Outil inattendu: ${toolUseBlock.name}`, true),
    );
  }

  // Compute cost
  const inputTokens = response.usage?.input_tokens ?? 0;
  const outputTokens = response.usage?.output_tokens ?? 0;
  const costEur = inputTokens * INPUT_TOKEN_COST_EUR + outputTokens * OUTPUT_TOKEN_COST_EUR;

  const rawInput = toolUseBlock.input as Record<string, unknown>;

  // Post-process before validation
  const processed = postProcess(rawInput, sourceColumns);

  // Validate with Zod
  const parsed = generatedAppSchema.safeParse(processed);

  if (!parsed.success) {
    return err(
      generationError(
        'INVALID_SCHEMA',
        `Schema genere invalide: ${parsed.error.message}`,
        true,
      ),
    );
  }

  return ok({ schema: parsed.data, costEur });
}

/**
 * Post-processing to fix common Claude generation issues:
 * 1. Ensure unique component IDs
 * 2. Clamp component count to MAX_COMPONENTS
 * 3. Fix invalid column references in dataBindings
 * 4. Clamp positions to valid grid ranges
 * 5. Filter out non-Phase-A component types
 */
function postProcess(
  raw: Record<string, unknown>,
  sourceColumns: readonly string[],
): Record<string, unknown> {
  const result = { ...raw };

  // Ensure components is an array
  if (!Array.isArray(result['components'])) {
    result['components'] = [];
  }

  let components = (result['components'] as Record<string, unknown>[]).slice();

  // Filter to Phase A component types only
  components = components.filter((c) => {
    const type = c['type'];
    return typeof type === 'string' && (PHASE_A_COMPONENT_TYPES as readonly string[]).includes(type);
  });

  // Clamp to max components
  if (components.length > MAX_COMPONENTS) {
    components = components.slice(0, MAX_COMPONENTS);
  }

  // Ensure unique IDs
  const seenIds = new Set<string>();
  components = components.map((comp, index) => {
    const newComp = { ...comp };
    let id = typeof newComp['id'] === 'string' ? newComp['id'] : `comp_${index}`;

    if (seenIds.has(id)) {
      id = `${id}_${index}`;
    }
    seenIds.add(id);
    newComp['id'] = id;

    // Clamp position values
    if (newComp['position'] && typeof newComp['position'] === 'object') {
      const pos = { ...(newComp['position'] as Record<string, unknown>) };
      pos['row'] = Math.max(0, Math.min(99, Number(pos['row']) || 0));
      pos['col'] = Math.max(0, Math.min(3, Number(pos['col']) || 0));
      if (pos['span'] !== undefined) {
        pos['span'] = Math.max(1, Math.min(4, Number(pos['span']) || 1));
      }
      newComp['position'] = pos;
    }

    return newComp;
  });

  result['components'] = components;

  // Validate dataBindings field references
  if (Array.isArray(result['dataBindings']) && sourceColumns.length > 0) {
    const bindings = (result['dataBindings'] as Record<string, unknown>[]).map((binding, index) => {
      const newBinding = { ...binding };
      if (!newBinding['id'] || typeof newBinding['id'] !== 'string') {
        newBinding['id'] = `binding_${index}`;
      }
      // If field doesn't match any source column, try case-insensitive match
      const field = String(newBinding['field'] ?? '');
      if (!sourceColumns.includes(field)) {
        const match = sourceColumns.find(
          (col) => col.toLowerCase() === field.toLowerCase(),
        );
        if (match) {
          newBinding['field'] = match;
        }
      }
      return newBinding;
    });

    // Ensure unique binding IDs
    const seenBindingIds = new Set<string>();
    result['dataBindings'] = bindings.map((b, i) => {
      const nb = { ...b };
      let bid = String(nb['id']);
      if (seenBindingIds.has(bid)) {
        bid = `${bid}_${i}`;
      }
      seenBindingIds.add(bid);
      nb['id'] = bid;
      return nb;
    });
  }

  if (!Array.isArray(result['dataBindings'])) {
    result['dataBindings'] = [];
  }

  return result;
}

/** Type guard for abort errors */
function isAbortError(error: unknown): boolean {
  if (error instanceof DOMException && error.name === 'AbortError') return true;
  if (error instanceof Error && error.name === 'AbortError') return true;
  return false;
}

/** Promise-based sleep utility */
function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}
