import { Hono } from 'hono';
import { cors } from 'hono/cors';
import { secureHeaders } from 'hono/secure-headers';
import { errorHandler } from './middleware/error.middleware';
import { appsRoutes } from './routes/apps.routes';
import { authRoutes } from './routes/auth.routes';
import { dataSourcesRoutes } from './routes/data-sources.routes';
import { generationRoutes } from './routes/generation.routes';
import { logger } from './lib/logger';
import { validateEnv } from './lib/env';

interface Bindings {
  DATABASE_URL: string;
  ANTHROPIC_API_KEY?: string;
  ENVIRONMENT?: string;
  [key: string]: unknown;
}

const app = new Hono<{ Bindings: Bindings }>();

// Global middleware
app.use('*', cors({
  origin: ['http://localhost:5173', 'https://app.instack.io'],
  allowMethods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
  allowHeaders: ['Content-Type', 'Authorization'],
  maxAge: 86400,
}));

app.use('*', secureHeaders({
  contentSecurityPolicy: {
    defaultSrc: ["'self'"],
    scriptSrc: ["'self'"],
    styleSrc: ["'self'", "'unsafe-inline'"],
    imgSrc: ["'self'", 'data:', 'https:'],
    connectSrc: ["'self'", 'https://api.anthropic.com'],
  },
  xFrameOptions: 'DENY',
  xContentTypeOptions: 'nosniff',
  referrerPolicy: 'strict-origin-when-cross-origin',
}));

// Error handler — never leak stack traces
app.onError(errorHandler);

// Health check
app.get('/health', (c) => {
  const envResult = validateEnv(c.env as Record<string, unknown>);
  const dbConnected = envResult.ok;

  return c.json({
    status: 'ok',
    version: '0.1.0',
    timestamp: new Date().toISOString(),
    checks: {
      env: dbConnected ? 'ok' : 'missing',
    },
  });
});

// Route groups
app.route('/api/auth', authRoutes);
app.route('/api/apps', appsRoutes);
app.route('/api/data-sources', dataSourcesRoutes);
app.route('/api/generate', generationRoutes);

// 404 handler
app.notFound((c) => {
  return c.json({ error: { message: 'Not found', status: 404 } }, 404);
});

logger.info('instack API initialized');

export default app;
