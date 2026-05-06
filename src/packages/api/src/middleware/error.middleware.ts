import type { ErrorHandler } from 'hono';
import { logger } from '../lib/logger';
import { captureException } from '../lib/sentry';

export const errorHandler: ErrorHandler = (error, c) => {
  const status = 'status' in error && typeof error.status === 'number' ? error.status : 500;

  captureException(error, {
    path: c.req.path,
    method: c.req.method,
    status,
  });

  logger.error('Unhandled error', {
    message: error.message,
    path: c.req.path,
    method: c.req.method,
  });

  return c.json(
    {
      error: {
        message: status >= 500 ? 'Internal server error' : error.message,
        status,
      },
    },
    status as 500,
  );
};
