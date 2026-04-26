/**
 * Stage 1: Intent Classification using Claude Haiku.
 * @NEURON owns this file. @NEXUS reviews architecture.
 *
 * Classifies user prompts into one of 8 app archetypes using
 * Claude Haiku via tool_use mode for structured output.
 *
 * Invariants:
 * - Uses tool_use mode, NEVER parses raw text as JSON
 * - 5-second timeout per request
 * - 1 retry with exponential backoff
 * - Falls back to multi_view on unrecoverable failure
 * - Validates all output with Zod
 * - Tracks token usage and cost in EUR
 * - NEVER uses eval or trusts raw text output
 */

import Anthropic from '@anthropic-ai/sdk';
import type { Result } from '@instack/shared';
import { ok, err } from '@instack/shared';
import type { ClassificationError } from '../errors';
import { classificationError } from '../errors';
import { classificationOutputSchema } from '../schemas/classify.schema';
import type { ClassificationOutput } from '../schemas/classify.schema';
import {
  CLASSIFY_SYSTEM_PROMPT,
  CLASSIFY_TOOL_DEFINITION,
  buildUserMessage,
} from '../prompts/classify.prompt';

/** Claude Haiku model identifier */
const MODEL = 'claude-haiku-4-5-20251001';

/** Request timeout in milliseconds */
const TIMEOUT_MS = 5_000;

/** Maximum number of attempts (initial + retries) */
const MAX_ATTEMPTS = 2;

/** Base delay for exponential backoff in milliseconds */
const BASE_BACKOFF_MS = 500;

/** Cost per token in EUR (Haiku pricing) */
const INPUT_TOKEN_COST_EUR = 0.25 / 1_000_000;
const OUTPUT_TOKEN_COST_EUR = 1.25 / 1_000_000;

/**
 * Classify user intent into one of 8 app archetypes.
 *
 * @param userPrompt - The user's description of what they need
 * @param apiKey - Anthropic API key
 * @param excelPreview - Optional array of Excel column names for context
 * @returns Result with ClassificationOutput on success, ClassificationError on failure
 */
export async function classifyIntent(
  userPrompt: string,
  apiKey: string,
  excelPreview?: string[],
): Promise<Result<ClassificationOutput, ClassificationError>> {
  if (!userPrompt.trim()) {
    return err(
      classificationError(
        'EMPTY_PROMPT',
        'Le prompt utilisateur est vide.',
        false,
      ),
    );
  }

  if (!apiKey.trim()) {
    return err(
      classificationError(
        'MISSING_API_KEY',
        'La cle API Anthropic est manquante.',
        false,
      ),
    );
  }

  const client = new Anthropic({ apiKey });
  const userMessage = buildUserMessage(userPrompt, excelPreview);

  let lastError: unknown;

  for (let attempt = 0; attempt < MAX_ATTEMPTS; attempt++) {
    if (attempt > 0) {
      const delay = BASE_BACKOFF_MS * Math.pow(2, attempt - 1);
      await sleep(delay);
    }

    try {
      const result = await callClaudeWithTimeout(client, userMessage);
      if (result.ok) {
        return result;
      }
      lastError = result.error;
    } catch (caught: unknown) {
      lastError = caught;
    }
  }

  // Both attempts failed — return recoverable error with multi_view default
  const errorMessage =
    lastError instanceof Error
      ? lastError.message
      : String(lastError);

  return err(
    classificationError(
      'CLASSIFICATION_FAILED',
      `La classification a echoue apres ${MAX_ATTEMPTS} tentatives: ${errorMessage}`,
      true,
    ),
  );
}

/**
 * Calls Claude Haiku with a timeout and validates the response.
 */
async function callClaudeWithTimeout(
  client: Anthropic,
  userMessage: string,
): Promise<Result<ClassificationOutput, ClassificationError>> {
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), TIMEOUT_MS);

  try {
    const response = await client.messages.create(
      {
        model: MODEL,
        max_tokens: 256,
        temperature: 0,
        system: CLASSIFY_SYSTEM_PROMPT,
        tools: [CLASSIFY_TOOL_DEFINITION as Anthropic.Tool],
        tool_choice: { type: 'tool', name: 'classify_intent' },
        messages: [{ role: 'user', content: userMessage }],
      },
      { signal: controller.signal },
    );

    clearTimeout(timeoutId);

    return parseToolUseResponse(response);
  } catch (caught: unknown) {
    clearTimeout(timeoutId);

    if (isAbortError(caught)) {
      return err(
        classificationError(
          'TIMEOUT',
          `Le delai de ${TIMEOUT_MS}ms a ete depasse.`,
          true,
        ),
      );
    }

    throw caught;
  }
}

/**
 * Extracts and validates the tool_use response from Claude.
 * NEVER parses raw text — only processes structured tool_use blocks.
 */
function parseToolUseResponse(
  response: Anthropic.Message,
): Result<ClassificationOutput, ClassificationError> {
  const toolUseBlock = response.content.find(
    (block): block is Anthropic.ContentBlock & { type: 'tool_use' } =>
      block.type === 'tool_use',
  );

  if (!toolUseBlock) {
    return err(
      classificationError(
        'NO_TOOL_USE',
        'Claude n\'a pas utilise l\'outil classify_intent.',
        true,
      ),
    );
  }

  if (toolUseBlock.name !== 'classify_intent') {
    return err(
      classificationError(
        'WRONG_TOOL',
        `Outil inattendu: ${toolUseBlock.name}`,
        true,
      ),
    );
  }

  // Compute cost from token usage
  const inputTokens = response.usage?.input_tokens ?? 0;
  const outputTokens = response.usage?.output_tokens ?? 0;
  const costEur =
    inputTokens * INPUT_TOKEN_COST_EUR + outputTokens * OUTPUT_TOKEN_COST_EUR;

  // Validate tool input with Zod
  const toolInput = toolUseBlock.input as Record<string, unknown>;
  const parsed = classificationOutputSchema.safeParse({
    ...toolInput,
    costEur,
  });

  if (!parsed.success) {
    return err(
      classificationError(
        'INVALID_RESPONSE',
        `Reponse invalide: ${parsed.error.message}`,
        true,
      ),
    );
  }

  // Apply confidence threshold: if < 0.6, default to multi_view
  const output = parsed.data;
  if (output.confidence < 0.6) {
    return ok({
      archetype: 'multi_view',
      confidence: output.confidence,
      reasoning: output.reasoning,
      costEur: output.costEur,
    });
  }

  return ok(output);
}

/** Type guard for abort errors */
function isAbortError(error: unknown): boolean {
  if (error instanceof DOMException && error.name === 'AbortError') {
    return true;
  }
  if (error instanceof Error && error.name === 'AbortError') {
    return true;
  }
  return false;
}

/** Promise-based sleep utility */
function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}
