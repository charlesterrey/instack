import { secureHeaders } from 'hono/secure-headers';

/** Content Security Policy + security headers middleware */
export const cspMiddleware = secureHeaders({
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
});
