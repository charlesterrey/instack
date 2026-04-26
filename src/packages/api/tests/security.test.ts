import { describe, it, expect } from 'vitest';
import app from '../src/index';
import { TEST_ENV, TENANT_A_ADMIN, authRequest } from './helpers';
import { isEndpointAllowed } from '../src/services/token-proxy.service';

describe('CSP headers', () => {
  it('health endpoint has CSP header', async () => {
    const res = await app.request('/health', undefined, TEST_ENV);
    const csp = res.headers.get('content-security-policy');
    expect(csp).toBeTruthy();
    expect(csp).toContain("default-src 'self'");
    expect(csp).toContain("script-src 'self'");
    expect(csp).toContain("frame-ancestors 'none'");
    expect(csp).toContain("form-action 'self'");
  });

  it('CSP includes connect-src with graph.microsoft.com', async () => {
    const res = await app.request('/health', undefined, TEST_ENV);
    const csp = res.headers.get('content-security-policy');
    expect(csp).toContain('graph.microsoft.com');
  });

  it('has X-Frame-Options DENY', async () => {
    const res = await app.request('/health', undefined, TEST_ENV);
    expect(res.headers.get('x-frame-options')).toBe('DENY');
  });

  it('has X-Content-Type-Options nosniff', async () => {
    const res = await app.request('/health', undefined, TEST_ENV);
    expect(res.headers.get('x-content-type-options')).toBe('nosniff');
  });

  it('CSP present on 404 responses', async () => {
    const res = await app.request('/nonexistent', undefined, TEST_ENV);
    expect(res.headers.get('content-security-policy')).toBeTruthy();
  });

  it('CSP present on 401 responses', async () => {
    const res = await app.request('/api/apps', undefined, TEST_ENV);
    expect(res.headers.get('content-security-policy')).toBeTruthy();
  });
});

describe('Token proxy — endpoint whitelist', () => {
  it('allows /me', () => {
    expect(isEndpointAllowed('/me')).toBe(true);
  });

  it('allows /me/drive/items/abc', () => {
    expect(isEndpointAllowed('/me/drive/items/abc')).toBe(true);
  });

  it('allows /sites/root', () => {
    expect(isEndpointAllowed('/sites/root')).toBe(true);
  });

  it('allows /drives/abc', () => {
    expect(isEndpointAllowed('/drives/abc')).toBe(true);
  });

  it('blocks /users', () => {
    expect(isEndpointAllowed('/users')).toBe(false);
  });

  it('blocks /applications', () => {
    expect(isEndpointAllowed('/applications')).toBe(false);
  });

  it('blocks /admin', () => {
    expect(isEndpointAllowed('/admin')).toBe(false);
  });

  it('blocks empty string', () => {
    expect(isEndpointAllowed('')).toBe(false);
  });
});

describe('Token proxy — POST /api/graph-proxy', () => {
  it('returns 401 without auth', async () => {
    const res = await app.request('/api/graph-proxy', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ endpoint: '/me', method: 'GET' }),
    }, TEST_ENV);
    expect(res.status).toBe(401);
  });
});
