import { z } from 'zod';

const envSchema = z.object({
  DATABASE_URL: z.string().min(1),
  ANTHROPIC_API_KEY: z.string().min(1).optional(),
  ENVIRONMENT: z.enum(['development', 'preview', 'production']).default('development'),
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
