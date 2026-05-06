/**
 * Server-side PostHog Analytics — @CATALYST
 *
 * Lightweight server-side event tracking for the Hono API layer.
 * Uses the same mock/capture pattern as the client-side wrapper.
 *
 * In production: use posthog-node SDK with batch mode.
 */

// ═══════════════════════════════════════════════════════════════════
// Types
// ═══════════════════════════════════════════════════════════════════

interface CapturedEvent {
  name: string;
  distinctId: string;
  properties?: Record<string, unknown>;
  timestamp: string;
}

// ═══════════════════════════════════════════════════════════════════
// Internal State
// ═══════════════════════════════════════════════════════════════════

const captured: CapturedEvent[] = [];

// ═══════════════════════════════════════════════════════════════════
// Public API
// ═══════════════════════════════════════════════════════════════════

/**
 * Track a server-side event.
 *
 * In production: posthogClient.capture({ distinctId, event, properties })
 */
export function trackServerEvent(
  event: string,
  distinctId: string,
  properties?: Record<string, unknown>,
): void {
  captured.push({
    name: event,
    distinctId,
    properties,
    timestamp: new Date().toISOString(),
  });
  // Production: posthogClient.capture({ distinctId, event, properties })
}

// ═══════════════════════════════════════════════════════════════════
// Server-side Event Constants
// ═══════════════════════════════════════════════════════════════════

export const SERVER_EVENTS = {
  // API lifecycle
  API_REQUEST: 'api.request',
  API_ERROR: 'api.error',
  API_RATE_LIMITED: 'api.rate_limited',

  // Auth server-side
  AUTH_TOKEN_REFRESHED: 'auth.token_refreshed',
  AUTH_TOKEN_REVOKED: 'auth.token_revoked',
  AUTH_SESSION_CREATED: 'auth.session_created',

  // Pipeline server-side
  PIPELINE_CLASSIFY_COMPLETED: 'pipeline.classify_completed',
  PIPELINE_GENERATE_COMPLETED: 'pipeline.generate_completed',
  PIPELINE_VALIDATE_COMPLETED: 'pipeline.validate_completed',
  PIPELINE_ASSEMBLE_COMPLETED: 'pipeline.assemble_completed',

  // Data server-side
  DATASOURCE_SYNC_STARTED: 'datasource.sync_started',
  DATASOURCE_SYNC_COMPLETED: 'datasource.sync_completed',
  DATASOURCE_SYNC_FAILED: 'datasource.sync_failed',

  // Tenant
  TENANT_CREATED: 'tenant.created',
  TENANT_PLAN_CHANGED: 'tenant.plan_changed',
} as const;

export type ServerEventName = (typeof SERVER_EVENTS)[keyof typeof SERVER_EVENTS];

// ═══════════════════════════════════════════════════════════════════
// Test Helpers
// ═══════════════════════════════════════════════════════════════════

/** Return all captured server events (read-only). */
export function getCapturedServerEvents(): readonly CapturedEvent[] {
  return captured;
}

/** Clear all captured server events (useful between tests). */
export function clearCapturedServerEvents(): void {
  captured.length = 0;
}

/** Filter captured server events by name. */
export function getServerEventsByName(name: string): readonly CapturedEvent[] {
  return captured.filter((e) => e.name === name);
}
