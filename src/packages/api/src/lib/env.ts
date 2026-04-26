import { z } from 'zod';

const envSchema = z.object({
  DATABASE_URL: z.string().min(1),
  ANTHROPIC_API_KEY: z.string().min(1).optional(),
  ENVIRONMENT: z.enum(['development', 'preview', 'production']).default('development'),
  // OAuth 2.0 — Microsoft Entra ID
  MICROSOFT_CLIENT_ID: z.string().min(1),
  MICROSOFT_CLIENT_SECRET: z.string().min(1),
  MICROSOFT_TENANT_ID: z.string().min(1).default('common'),
  // JWT
  JWT_SECRET: z.string().min(32),
  // Token encryption
  TOKEN_ENCRYPTION_KEY: z.string().min(32),
  // App
  API_BASE_URL: z.string().url().default('http://localhost:8787'),
  FRONTEND_URL: z.string().url().default('http://localhost:5173'),
});

export type Env = z.infer<typeof envSchema>;

type EnvResult =
  | { readonly ok: true; readonly value: Env }
  | { readonly ok: false; readonly error: string };

export function validateEnv(raw: Record<string, unknown>): EnvResult {
  const parsed = envSchema.safeParse(raw);
  if (parsed.success) {
    return { ok: true, value: parsed.data };
  }
  const issues = parsed.error.issues.map((i) => `${i.path.join('.')}: ${i.message}`).join(', ');
  return { ok: false, error: `Invalid environment variables: ${issues}` };
}
