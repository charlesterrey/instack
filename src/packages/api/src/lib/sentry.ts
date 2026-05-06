/**
 * @module sentry (server / Cloudflare Workers)
 * @description Mock Sentry server SDK for error tracking in Workers.
 * Captures errors to an in-memory array for testing.
 * Replace with @sentry/cloudflare SDK when npm packages are available.
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

const capturedEvents: SentryEvent[] = [];

let config: SentryConfig = {
  dsn: '',
  environment: 'production',
  initialized: false,
};

/**
 * Initialize the Sentry server SDK (mock).
 * In production, replace with Sentry.init({ dsn, environment, ... }).
 */
export function initSentry(dsn?: string, environment?: string): void {
  config = {
    dsn: dsn ?? '',
    environment: environment ?? 'production',
    initialized: true,
  };
}

/**
 * Capture an exception event with optional context.
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
  };

  capturedEvents.push(event);
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
