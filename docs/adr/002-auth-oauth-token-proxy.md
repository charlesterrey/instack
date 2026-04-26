# ADR-002: Authentication — OAuth 2.0 + Token Proxy Pattern

## Status
Accepted

## Context
instack needs enterprise SSO via Microsoft Entra ID. Generated apps must access Excel/SharePoint data via Microsoft Graph API, but OAuth tokens must never be exposed to the frontend or generated apps.

## Decision

### OAuth 2.0 Authorization Code Flow with PKCE
- PKCE (S256) for code exchange security
- State parameter (HMAC-signed) for CSRF protection
- Scopes: openid, profile, email, User.Read, Files.Read.All, Sites.Read.All

### JWT Session Token
- HMAC-SHA256 signed
- Stored in HttpOnly, Secure, SameSite=Lax cookie
- 1-hour expiration
- Payload: sub (userId), tid (tenantId), role, email

### Token Proxy Pattern
- OAuth tokens encrypted with AES-256-GCM (unique IV per encryption)
- Stored in users table (encrypted_access_token, encrypted_refresh_token)
- Apps call instack API, never Microsoft directly
- API decrypts token, calls Graph API, returns result
- Whitelist of allowed Graph API endpoints

### Middleware Chain
1. Auth middleware: validate JWT, inject auth context
2. Tenant middleware: SET LOCAL app.current_tenant_id for RLS
3. Rate limit middleware: per-plan limits (60/300/1000 req/min)

## Alternatives Considered
- **Supabase Auth**: Less control over token proxy pattern
- **Auth0/Clerk**: Additional cost, external dependency
- **Token in localStorage**: Security risk (XSS)

## Consequences
- All protected API calls require valid JWT cookie
- Token refresh is transparent to the user
- No token ever appears in HTTP responses, logs, or frontend code
- RLS isolation guaranteed at middleware + database level
