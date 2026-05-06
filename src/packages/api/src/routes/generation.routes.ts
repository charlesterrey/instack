/**
 * Generation API endpoints — @FORGE + @NEURON
 * POST /api/generate/classify — Stage 1 only
 * POST /api/generate/infer-schema — Stage 2 only (with file upload)
 * POST /api/generate/preview — Stages 1+2 combined
 * POST /api/generate/full — Full pipeline (stages 1-4)
 * POST /api/generate/retry — Retry a failed generation
 * GET  /api/generate/render/:appId — Get render-ready schema
 *
 * @PHANTOM review: no token in responses, file upload validated, rate limited
 */

import { Hono } from 'hono';
import { z } from 'zod';
import { zValidator } from '@hono/zod-validator';
import { classifyIntent, inferSchema, parseExcelBuffer, executePreview, executePipeline } from '@instack/ai-pipeline';
import { getDemoData } from '../services/sandbox.service';

const classifyBodySchema = z.object({
  prompt: z.string().min(1).max(2000),
});

const previewBodySchema = z.object({
  prompt: z.string().min(1).max(2000),
  dataSourceId: z.string().uuid().optional(),
});

const generateFullBodySchema = z.object({
  prompt: z.string().min(1).max(2000),
  dataSourceId: z.string().uuid().optional(),
  demoDatasetId: z.string().optional(),
});

const retryBodySchema = z.object({
  prompt: z.string().min(1).max(2000),
  previousError: z.string().optional(),
  dataSourceId: z.string().uuid().optional(),
});

export const generationRoutes = new Hono();

// POST /api/generate/classify — Run Stage 1 only
generationRoutes.post(
  '/classify',
  zValidator('json', classifyBodySchema),
  async (c) => {
    const { prompt } = c.req.valid('json');
    const apiKey = (c.env as Record<string, unknown>)['ANTHROPIC_API_KEY'];

    if (typeof apiKey !== 'string') {
      return c.json({ error: { message: 'AI pipeline not configured', status: 500 } }, 500);
    }

    const result = await classifyIntent(prompt, apiKey);

    if (!result.ok) {
      return c.json({
        error: { message: result.error.message, code: result.error.code, status: 422 },
      }, 422);
    }

    return c.json({
      data: {
        archetype: result.value.archetype,
        confidence: result.value.confidence,
        reasoning: result.value.reasoning,
      },
    });
  },
);

// POST /api/generate/infer-schema — Run Stage 2 with file upload
generationRoutes.post('/infer-schema', async (c) => {
  const contentType = c.req.header('content-type') ?? '';

  if (!contentType.includes('multipart/form-data')) {
    return c.json({ error: { message: 'Expected multipart/form-data with file', status: 400 } }, 400);
  }

  const formData = await c.req.formData();
  const file = formData.get('file');

  if (!file || typeof file === 'string') {
    return c.json({ error: { message: 'No file provided', status: 400 } }, 400);
  }

  const uploadedFile = file as unknown as { name: string; size: number; arrayBuffer(): Promise<ArrayBuffer> };

  if (uploadedFile.size > 10 * 1024 * 1024) {
    return c.json({ error: { message: 'File exceeds 10MB limit', status: 400 } }, 400);
  }

  const allowedExtensions = ['.xlsx', '.xls', '.csv'];
  const fileName = uploadedFile.name.toLowerCase();
  if (!allowedExtensions.some((ext) => fileName.endsWith(ext))) {
    return c.json({
      error: { message: 'Unsupported file type. Allowed: xlsx, xls, csv', status: 400 },
    }, 400);
  }

  const buffer = await uploadedFile.arrayBuffer();
  const parseResult = parseExcelBuffer(buffer);

  if (!parseResult.ok) {
    return c.json({
      error: { message: parseResult.error.message, code: parseResult.error.code, status: 422 },
    }, 422);
  }

  const schemaResult = inferSchema(parseResult.value, 'multi_view');

  if (!schemaResult.ok) {
    return c.json({
      error: { message: schemaResult.error.message, code: schemaResult.error.code, status: 422 },
    }, 422);
  }

  return c.json({ data: schemaResult.value });
});

// POST /api/generate/preview — Stages 1+2 combined
generationRoutes.post(
  '/preview',
  zValidator('json', previewBodySchema),
  async (c) => {
    const auth = c.get('auth');
    const { prompt } = c.req.valid('json');
    const apiKey = (c.env as Record<string, unknown>)['ANTHROPIC_API_KEY'];

    if (typeof apiKey !== 'string') {
      return c.json({ error: { message: 'AI pipeline not configured', status: 500 } }, 500);
    }

    const result = await executePreview(
      { userPrompt: prompt, tenantId: auth.tenantId, userId: auth.userId },
      { anthropicApiKey: apiKey },
    );

    if (!result.ok) {
      return c.json({
        error: { message: result.error.message, code: result.error.code, status: 422 },
      }, 422);
    }

    return c.json({ data: result.value });
  },
);

// POST /api/generate/full — Run full pipeline (stages 1-4)
generationRoutes.post(
  '/full',
  zValidator('json', generateFullBodySchema),
  async (c) => {
    const auth = c.get('auth');
    const { prompt, demoDatasetId } = c.req.valid('json');
    const apiKey = (c.env as Record<string, unknown>)['ANTHROPIC_API_KEY'];

    if (typeof apiKey !== 'string') {
      return c.json({ error: { message: 'AI pipeline not configured', status: 500 } }, 500);
    }

    // If a demo dataset is specified, load it and pass as excelData
    let excelData: import('@instack/ai-pipeline').ExcelSheet | undefined;
    if (demoDatasetId) {
      const dataset = getDemoData(demoDatasetId);
      if (!dataset) {
        return c.json({ error: { message: 'Demo dataset not found', status: 404 } }, 404);
      }
      excelData = dataset.data;
    }

    const result = await executePipeline(
      { userPrompt: prompt, tenantId: auth.tenantId, userId: auth.userId, excelData },
      { anthropicApiKey: apiKey },
    );

    if (!result.ok) {
      const status = result.error.recoverable ? 422 : 500;
      return c.json({
        error: {
          message: result.error.message,
          code: result.error.code,
          stage: result.error.stage,
          recoverable: result.error.recoverable,
          status,
        },
      }, status);
    }

    return c.json({
      data: {
        appSchema: result.value.appSchema,
        metadata: result.value.metadata,
      },
    });
  },
);

// POST /api/generate/retry — Retry a failed generation
generationRoutes.post(
  '/retry',
  zValidator('json', retryBodySchema),
  async (c) => {
    const auth = c.get('auth');
    const { prompt } = c.req.valid('json');
    const apiKey = (c.env as Record<string, unknown>)['ANTHROPIC_API_KEY'];

    if (typeof apiKey !== 'string') {
      return c.json({ error: { message: 'AI pipeline not configured', status: 500 } }, 500);
    }

    const result = await executePipeline(
      { userPrompt: prompt, tenantId: auth.tenantId, userId: auth.userId },
      { anthropicApiKey: apiKey },
    );

    if (!result.ok) {
      const status = result.error.recoverable ? 422 : 500;
      return c.json({
        error: {
          message: result.error.message,
          code: result.error.code,
          stage: result.error.stage,
          recoverable: result.error.recoverable,
          status,
        },
      }, status);
    }

    return c.json({
      data: {
        appSchema: result.value.appSchema,
        metadata: result.value.metadata,
      },
    });
  },
);

// GET /api/generate/render/:appId — Get render-ready schema for an app
generationRoutes.get('/render/:appId', async (c) => {
  const appId = c.req.param('appId');

  if (!appId) {
    return c.json({ error: { message: 'App ID is required', status: 400 } }, 400);
  }

  // TODO: In production, fetch from DB via app.repository
  // For now, return a placeholder that signals the client to use the stored schema
  return c.json({
    data: {
      appId,
      message: 'Use the app schema from the generation response or fetch from /api/apps/:id',
    },
  });
});
