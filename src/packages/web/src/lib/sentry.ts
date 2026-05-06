/**
 * @module sentry (browser)
 * @description Mock Sentry browser SDK for error tracking.
 * Captures errors to an in-memory array for testing.
 * Replace with real @sentry/browser SDK when npm packages are available.
 *
 * @agent @WATCHDOG — DevOps/SRE
 * @sprint S08_INTEGRATION_BETA
 */

export interface SentryEvent {
  readonly type: 'error' | 'message';
  readonly message: string;
  readonly timestamp: string;
  readonly level?: 'info' | 'warning' | 'error';
  readonly extra?: Record<string, unknown>;
}

interface SentryConfig {
  dsn: string;
  environment: string;
  initialized: boolean;
}

interface SentryUser {
  id: string;
  email: string;
}

const capturedEvents: SentryEvent[] = [];

let config: SentryConfig = {
  dsn: '',
  environment: 'development',
  initialized: false,
};

let currentUser: SentryUser | null = null;

/**
 * Initialize the Sentry browser SDK (mock).
 * In production, replace with Sentry.init({ dsn, environment, ... }).
 */
export function initSentry(dsn?: string, environment?: string): void {
  config = {
    dsn: dsn ?? '',
    environment: environment ?? 'development',
    initialized: true,
  };
}

/**
 * Capture an exception event.
 */
export function captureException(
  error: unknown,
  context?: Record<string, unknown>,
): void {
  if (!config.initialized) return;

  const message =
    error instanceof Error
      ? error.message
      : typeof error === 'string'
        ? error
        : 'Unknown error';

  const event: SentryEvent = {
    type: 'error',
    message,
    timestamp: new Date().toISOString(),
    level: 'error',
    extra: {
      ...context,
      ...(currentUser ? { user: currentUser } : {}),
      ...(error instanceof Error && error.stack ? { stack: error.stack } : {}),
    },
  };

  capturedEvents.push(event);
}

/**
 * Capture a message event.
 */
export function captureMessage(
  message: string,
  level: 'info' | 'warning' | 'error' = 'info',
): void {
  if (!config.initialized) return;

  const event: SentryEvent = {
    type: 'message',
    message,
    timestamp: new Date().toISOString(),
    level,
    extra: currentUser ? { user: currentUser } : undefined,
  };

  capturedEvents.push(event);
}

/**
 * Set the current user context for Sentry events.
 */
export function setUser(user: { id: string; email: string } | null): void {
  currentUser = user ? { id: user.id, email: user.email } : null;
}

/**
 * Retrieve all captured events (for testing assertions).
 */
export function getCapturedEvents(): readonly SentryEvent[] {
  return capturedEvents;
}

/**
 * Clear all captured events (for test teardown).
 */
export function clearCapturedEvents(): void {
  capturedEvents.length = 0;
}

/**
 * Check if Sentry has been initialized.
 */
export function isInitialized(): boolean {
  return config.initialized;
}
