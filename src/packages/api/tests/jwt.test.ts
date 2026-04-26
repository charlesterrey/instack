import { describe, it, expect } from 'vitest';
import { createJWT, verifyJWT } from '../src/lib/jwt';

const SECRET = 'test-secret-key-at-least-32-chars-long!!';

describe('JWT', () => {
  it('creates and verifies a valid JWT', async () => {
    const jwt = await createJWT(
      { userId: 'user-1', tenantId: 'tenant-1', role: 'admin', email: 'test@example.com' },
      SECRET,
    );

    expect(jwt).toContain('.');
    expect(jwt.split('.')).toHaveLength(3);

    const result = await verifyJWT(jwt, SECRET);
    expect(result.ok).toBe(true);
    if (result.ok) {
      expect(result.payload.sub).toBe('user-1');
      expect(result.payload.tid).toBe('tenant-1');
      expect(result.payload.role).toBe('admin');
      expect(result.payload.email).toBe('test@example.com');
    }
  });

  it('rejects a JWT with wrong secret', async () => {
    const jwt = await createJWT(
      { userId: 'user-1', tenantId: 'tenant-1', role: 'creator', email: 'a@b.com' },
      SECRET,
    );

    const result = await verifyJWT(jwt, 'wrong-secret-that-is-also-32-chars-long');
    expect(result.ok).toBe(false);
    if (!result.ok) {
      expect(result.error).toBe('Invalid signature');
    }
  });

  it('rejects a malformed token', async () => {
    const result = await verifyJWT('not.a.jwt', SECRET);
    expect(result.ok).toBe(false);
  });

  it('rejects a token with only 2 parts', async () => {
    const result = await verifyJWT('part1.part2', SECRET);
    expect(result.ok).toBe(false);
    if (!result.ok) {
      expect(result.error).toBe('Invalid token format');
    }
  });
});
