import { Hono } from 'hono';
import { cors } from 'hono/cors';
import { secureHeaders } from 'hono/secure-headers';
import { errorHandler } from './middleware/error.middleware';
import { authMiddleware } from './middleware/auth.middleware';
import { tenantMiddleware } from './middleware/tenant.middleware';
import { rateLimitMiddleware } from './middleware/rate-limit.middleware';
import { authRoutes } from './routes/auth.routes';
import { appsRoutes } from './routes/apps.routes';
import { usersRoutes } from './routes/users.routes';
import { tenantsRoutes } from './routes/tenants.routes';
import { dataSourcesRoutes } from './routes/data-sources.routes';
import { generationRoutes } from './routes/generation.routes';
import { graphProxyRoutes } from './routes/graph-proxy.routes';
import { logger } from './lib/logger';
import { validateEnv } from './lib/env';

interface Bindings {
  DATABASE_URL: string;
  ANTHROPIC_API_KEY?: string;
  ENVIRONMENT?: string;
  MICROSOFT_CLIENT_ID: string;
  MICROSOFT_CLIENT_SECRET: string;
  MICROSOFT_TENANT_ID: string;
  JWT_SECRET: string;
  TOKEN_ENCRYPTION_KEY: string;
  API_BASE_URL: string;
  FRONTEND_URL: string;
  [key: string]: unknown;
}

const app = new Hono<{ Bindings: Bindings }>();

// Global middleware
app.use('*', cors({
  origin: (origin) => {
    const allowed = ['http://localhost:5173', 'https://app.instack.io'];
    if (allowed.includes(origin)) {
      return origin;
    }
    // Allow *.instack.io subdomains
    if (origin.endsWith('.instack.io')) {
      return origin;
    }
    return null;
  },
  allowMethods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
  allowHeaders: ['Content-Type', 'Authorization'],
  credentials: true,
  maxAge: 86400,
}));

app.use('*', secureHeaders({
  contentSecurityPolicy: {
    defaultSrc: ["'self'"],
    scriptSrc: ["'self'"],
    styleSrc: ["'self'", "'unsafe-inline'"],
    imgSrc: ["'self'", 'data:', 'https:'],
    connectSrc: ["'self'", 'https://graph.microsoft.com', 'https://api.anthropic.com'],
    frameAncestors: ["'none'"],
    formAction: ["'self'"],
  },
  xFrameOptions: 'DENY',
  xContentTypeOptions: 'nosniff',
  referrerPolicy: 'strict-origin-when-cross-origin',
}));

// Error handler — never leak stack traces
app.onError(errorHandler);

// Health check (no auth required)
app.get('/health', (c) => {
  const envResult = validateEnv(c.env as Record<string, unknown>);
  return c.json({
    status: 'ok',
    version: '0.2.0',
    timestamp: new Date().toISOString(),
    checks: { env: envResult.ok ? 'ok' : 'missing' },
  });
});

// Auth routes (no auth middleware — these handle login/callback)
app.route('/api/auth', authRoutes);

// Protected routes — require auth + tenant isolation + rate limiting
app.use('/api/*', authMiddleware);
app.use('/api/*', tenantMiddleware);
app.use('/api/*', rateLimitMiddleware);

app.route('/api/apps', appsRoutes);
app.route('/api/users', usersRoutes);
app.route('/api/tenants', tenantsRoutes);
app.route('/api/data-sources', dataSourcesRoutes);
app.route('/api/generate', generationRoutes);
app.route('/api/graph-proxy', graphProxyRoutes);

// 404 handler
app.notFound((c) => {
  return c.json({ error: { message: 'Not found', status: 404 } }, 404);
});

logger.info('instack API initialized');

export default app;
