# ADR-003: AI Pipeline — 4-Stage Constrained Generation

## Status
Accepted

## Context
instack generates business apps from natural language prompts + Excel data. The AI must produce safe, valid JSON configurations — never executable code. The pipeline must be fast (<4s), cheap (<0.02 EUR), and reliable (>95% success rate).

## Decision

### 4-Stage Sequential Pipeline

| Stage | Engine | Latency | Cost | Purpose |
|-------|--------|---------|------|---------|
| 1. Classification | Claude Haiku (tool_use) | ~200ms | ~0.001 EUR | Classify intent → 1 of 8 archetypes |
| 2. Schema Inference | Deterministic (no AI) | ~50ms | 0 EUR | Infer column types from Excel data |
| 3. Generation | Claude Sonnet 4 (tool_use) | ~3s | ~0.018 EUR | Assemble JSON from 12 atomic components |
| 4. Validation | Deterministic (Zod) | ~100ms | 0 EUR | Validate + sanitize output |

### Key Design Choices

**tool_use over raw JSON**: Claude's tool_use mode forces structured JSON output matching a schema. This eliminates JSON parsing failures and reduces hallucination. The LLM never outputs free-form text.

**Result pattern (no throws)**: Every stage returns `Result<T, PipelineError>`. If a stage fails, the pipeline stops immediately and returns the error with stage context. No exceptions propagate.

**Anti-injection by design**: User input is always wrapped in XML tags (`<user_request>`). System prompts have clear boundaries. Output is validated against strict Zod schemas. Temperature 0 for classification.

**Cost tracking**: Every API call tracks input/output tokens and computes cost. Haiku: (input * 0.25 + output * 1.25) / 1M. Sonnet: (input * 3 + output * 15) / 1M.

**Retry with fallback**: Stage 1 retries once with exponential backoff. If both attempts fail, returns `multi_view` as a safe default (recoverable error). Stage 3 retries up to 3 times if validation fails.

## Alternatives Considered

- **Single-model approach (Sonnet only)**: Simpler but 10x more expensive per call and slower. Haiku for classification is a cost optimization.
- **Raw JSON mode**: Anthropic's JSON mode exists but tool_use provides stronger schema guarantees and better error handling.
- **Streaming**: Not used for app generation (need complete JSON), but could be used for progress feedback.
- **Parallel stages**: Stages are inherently sequential (each depends on the previous output). No parallelization opportunity.

## Consequences

- Stage 3 and 4 are defined but not yet implemented (S04)
- The pipeline is extensible: adding a new archetype only requires updating the prompt and adding component patterns
- Cost is predictable: ~0.019 EUR per full generation
- The LLM NEVER generates executable code — this is an architectural invariant enforced at every layer
