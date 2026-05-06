/**
 * PostHog Analytics Wrapper — @CATALYST
 *
 * Testable mock pattern: all events are captured to an in-memory array.
 * In production, swap the captured.push calls for posthog-js SDK calls.
 *
 * 40+ events organised by category for the instack App Store.
 */

// ═══════════════════════════════════════════════════════════════════
// Event Name Constants
// ═══════════════════════════════════════════════════════════════════

export const EVENTS = {
  // AUTH (4)
  AUTH_LOGIN_STARTED: 'auth.login_started',
  AUTH_LOGIN_COMPLETED: 'auth.login_completed',
  AUTH_LOGIN_FAILED: 'auth.login_failed',
  AUTH_LOGOUT: 'auth.logout',

  // GENERATION (5)
  GENERATION_STARTED: 'generation.started',
  GENERATION_STAGE_COMPLETED: 'generation.stage_completed',
  GENERATION_COMPLETED: 'generation.completed',
  GENERATION_FAILED: 'generation.failed',
  GENERATION_RETRIED: 'generation.retried',

  // APP LIFECYCLE (5)
  APP_CREATED: 'app.created',
  APP_VIEWED: 'app.viewed',
  APP_SHARED: 'app.shared',
  APP_ARCHIVED: 'app.archived',
  APP_DELETED: 'app.deleted',

  // DATA SOURCE (3)
  DATASOURCE_CONNECTED: 'datasource.connected',
  DATASOURCE_SYNCED: 'datasource.synced',
  DATASOURCE_ERROR: 'datasource.error',

  // NAVIGATION (3)
  PAGE_VIEWED: 'page.viewed',
  WIZARD_STEP_COMPLETED: 'wizard.step_completed',
  WIZARD_ABANDONED: 'wizard.abandoned',

  // ENGAGEMENT (4)
  APP_INTERACTED: 'app.interacted',
  FILTER_APPLIED: 'filter.applied',
  TABLE_SORTED: 'table.sorted',
  TABLE_PAGINATED: 'table.paginated',

  // SANDBOX (3)
  SANDBOX_STARTED: 'sandbox.started',
  SANDBOX_CONVERTED: 'sandbox.converted',
  SANDBOX_EXPIRED: 'sandbox.expired',

  // STORE (3)
  STORE_BROWSED: 'store.browsed',
  STORE_APP_INSTALLED: 'store.app_installed',
  STORE_SEARCH: 'store.search',

  // ONBOARDING (3)
  ONBOARDING_STARTED: 'onboarding.started',
  ONBOARDING_STEP_COMPLETED: 'onboarding.step_completed',
  ONBOARDING_COMPLETED: 'onboarding.completed',

  // SETTINGS (2)
  SETTINGS_UPDATED: 'settings.updated',
  TEAM_MEMBER_INVITED: 'team.member_invited',

  // ERRORS (2)
  ERROR_BOUNDARY_HIT: 'error.boundary_hit',
  API_ERROR: 'error.api',
} as const;

export type EventName = (typeof EVENTS)[keyof typeof EVENTS];

// ═══════════════════════════════════════════════════════════════════
// Types
// ═══════════════════════════════════════════════════════════════════

interface CapturedEvent {
  name: string;
  properties?: Record<string, unknown>;
  timestamp: string;
}

// ═══════════════════════════════════════════════════════════════════
// Internal State
// ═══════════════════════════════════════════════════════════════════

const captured: CapturedEvent[] = [];
let _initialized = false;

// ═══════════════════════════════════════════════════════════════════
// Public API
// ═══════════════════════════════════════════════════════════════════

/**
 * Initialise PostHog analytics.
 * In production: posthog.init(apiKey, { api_host: options?.host ?? 'https://eu.i.posthog.com' })
 */
export function initAnalytics(apiKey?: string, options?: { host?: string }): void {
  if (_initialized) return;
  _initialized = true;
  // Production: posthog.init(apiKey, { api_host: options?.host ?? 'https://eu.i.posthog.com' })
  void apiKey;
  void options;
}

/**
 * Track a named event with optional properties.
 * In production: posthog.capture(event, properties)
 */
export function track(event: EventName, properties?: Record<string, unknown>): void {
  captured.push({
    name: event,
    properties,
    timestamp: new Date().toISOString(),
  });
  // Production: posthog.capture(event, properties)
}

/**
 * Identify a user with optional traits.
 * In production: posthog.identify(userId, traits)
 */
export function identify(userId: string, traits?: Record<string, unknown>): void {
  captured.push({
    name: '$identify',
    properties: { userId, ...traits },
    timestamp: new Date().toISOString(),
  });
  // Production: posthog.identify(userId, traits)
}

/**
 * Reset the current user identity (on logout).
 * In production: posthog.reset()
 */
export function reset(): void {
  // Production: posthog.reset()
}

// ═══════════════════════════════════════════════════════════════════
// Test Helpers
// ═══════════════════════════════════════════════════════════════════

/** Return all captured events (read-only). */
export function getCapturedEvents(): readonly CapturedEvent[] {
  return captured;
}

/** Clear all captured events (useful between tests). */
export function clearCapturedEvents(): void {
  captured.length = 0;
}

/** Filter captured events by name. */
export function getEventsByName(name: string): readonly CapturedEvent[] {
  return captured.filter((e) => e.name === name);
}

/** Check whether analytics has been initialised. */
export function isInitialized(): boolean {
  return _initialized;
}
