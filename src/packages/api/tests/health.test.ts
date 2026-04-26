import { describe, it, expect } from 'vitest';
import app from '../src/index';

describe('Health endpoint', () => {
  it('responds with status ok', async () => {
    const res = await app.request('/health', undefined, {
      DATABASE_URL: 'postgresql://localhost:5432/test',
      ENVIRONMENT: 'development',
    });
    expect(res.status).toBe(200);
    const body = await res.json() as { status: string };
    expect(body.status).toBe('ok');
  });

  it('returns 404 for unknown routes', async () => {
    const res = await app.request('/unknown');
    expect(res.status).toBe(404);
  });
});
