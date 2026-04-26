/**
 * Generation API endpoints — @FORGE + @NEURON
 * POST /api/generate/classify — Stage 1 only
 * POST /api/generate/infer-schema — Stage 2 only (with file upload)
 * POST /api/generate/preview — Stages 1+2 combined
 *
 * @PHANTOM review: no token in responses, file upload validated, rate limited
 */

import { Hono } from 'hono';
import { z } from 'zod';
import { zValidator } from '@hono/zod-validator';
import { classifyIntent, inferSchema, parseExcelBuffer, executePreview } from '@instack/ai-pipeline';

const classifyBodySchema = z.object({
  prompt: z.string().min(1).max(2000),
});

const previewBodySchema = z.object({
  prompt: z.string().min(1).max(2000),
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
