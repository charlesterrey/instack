import { describe, it, expect } from 'vitest';
import {
  generatePKCE,
  generateState,
  verifyState,
  buildAuthorizationUrl,
  decodeIdToken,
} from '../src/services/oauth.service';

const SECRET = 'test-secret-key-at-least-32-chars-long!!';

describe('OAuth service', () => {
  describe('PKCE', () => {
    it('generates a verifier and challenge', async () => {
      const pkce = await generatePKCE();
      expect(pkce.verifier).toBeTruthy();
      expect(pkce.challenge).toBeTruthy();
      expect(pkce.verifier).not.toBe(pkce.challenge);
    });

    it('generates unique values each time', async () => {
      const pkce1 = await generatePKCE();
      const pkce2 = await generatePKCE();
      expect(pkce1.verifier).not.toBe(pkce2.verifier);
    });
  });

  describe('State CSRF', () => {
    it('generates and verifies a valid state', async () => {
      const state = await generateState(SECRET, 'http://localhost:5173');
      expect(state).toContain('.');

      const result = await verifyState(state, SECRET);
      expect(result.valid).toBe(true);
      expect(result.redirectUrl).toBe('http://localhost:5173');
    });

    it('rejects a state with wrong secret', async () => {
      const state = await generateState(SECRET, 'http://localhost:5173');
      const result = await verifyState(state, 'wrong-secret');
      expect(result.valid).toBe(false);
    });

    it('rejects a tampered state', async () => {
      const state = await generateState(SECRET, 'http://localhost:5173');
      const tampered = 'tampered' + state.substring(8);
      const result = await verifyState(tampered, SECRET);
      expect(result.valid).toBe(false);
    });

    it('rejects a state without dot separator', async () => {
      const result = await verifyState('nodot', SECRET);
      expect(result.valid).toBe(false);
    });
  });

  describe('buildAuthorizationUrl', () => {
    it('builds a valid Microsoft authorization URL', () => {
      const url = buildAuthorizationUrl(
        {
          clientId: 'client-123',
          clientSecret: 'secret',
          tenantId: 'common',
          redirectUri: 'http://localhost:8787/api/auth/callback',
        },
        'state-value',
        'challenge-value',
      );

      expect(url).toContain('https://login.microsoftonline.com/common/oauth2/v2.0/authorize');
      expect(url).toContain('client_id=client-123');
      expect(url).toContain('redirect_uri=');
      expect(url).toContain('state=state-value');
      expect(url).toContain('code_challenge=challenge-value');
      expect(url).toContain('code_challenge_method=S256');
      expect(url).toContain('response_type=code');
    });
  });

  describe('decodeIdToken', () => {
    it('decodes a valid ID token payload', () => {
      // Build a fake JWT with base64url-encoded payload
      const payload = {
        oid: 'user-object-id',
        tid: 'tenant-object-id',
        email: 'test@example.com',
        name: 'Test User',
        preferred_username: 'test@example.com',
      };
      const encodedPayload = btoa(JSON.stringify(payload))
        .replace(/\+/g, '-')
        .replace(/\//g, '_')
        .replace(/=+$/, '');

      const fakeJwt = `eyJhbGciOiJSUzI1NiJ9.${encodedPayload}.fake-signature`;
      const claims = decodeIdToken(fakeJwt);

      expect(claims.oid).toBe('user-object-id');
      expect(claims.tid).toBe('tenant-object-id');
      expect(claims.email).toBe('test@example.com');
      expect(claims.name).toBe('Test User');
    });

    it('throws on invalid ID token', () => {
      expect(() => decodeIdToken('invalid')).toThrow('Invalid ID token format');
    });
  });
});
