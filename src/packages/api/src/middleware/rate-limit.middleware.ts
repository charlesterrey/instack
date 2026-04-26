import type { MiddlewareHandler } from 'hono';

interface RateLimitBucket {
  count: number;
  resetAt: number;
}

// In-memory rate limit store (replaced by KV in production)
const buckets = new Map<string, RateLimitBucket>();

const PLAN_LIMITS: Record<string, { reqPerMin: number; generationsPerDay: number }> = {
  free: { reqPerMin: 60, generationsPerDay: 10 },
  pro: { reqPerMin: 300, generationsPerDay: 100 },
  enterprise: { reqPerMin: 1000, generationsPerDay: -1 },
};

function getBucket(key: string, windowMs: number): RateLimitBucket {
  const now = Date.now();
  const existing = buckets.get(key);
  if (existing && existing.resetAt > now) {
    return existing;
  }
  const bucket: RateLimitBucket = { count: 0, resetAt: now + windowMs };
  buckets.set(key, bucket);
  return bucket;
}

/** Rate limiting middleware — limits per plan tier */
export const rateLimitMiddleware: MiddlewareHandler = async (c, next) => {
  const auth = c.get('auth');
  // Default to free plan limits
  const plan = 'free';
  const limits = PLAN_LIMITS[plan] ?? { reqPerMin: 60, generationsPerDay: 10 };
  const windowMs = 60_000; // 1 minute

  const key = `ratelimit:${auth.userId}`;
  const bucket = getBucket(key, windowMs);
  bucket.count++;

  const remaining = Math.max(0, limits.reqPerMin - bucket.count);

  c.header('X-RateLimit-Limit', String(limits.reqPerMin));
  c.header('X-RateLimit-Remaining', String(remaining));
  c.header('X-RateLimit-Reset', String(Math.ceil(bucket.resetAt / 1000)));

  if (bucket.count > limits.reqPerMin) {
    return c.json(
      { error: { message: 'Rate limit exceeded', status: 429 } },
      429,
    );
  }

  return next();
};
