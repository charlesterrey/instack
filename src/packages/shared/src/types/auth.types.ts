/** JWT session token payload */
export interface JWTPayload {
  /** User UUID (subject) */
  readonly sub: string;
  /** Tenant UUID */
  readonly tid: string;
  /** User role */
  readonly role: 'admin' | 'creator' | 'viewer';
  /** User email */
  readonly email: string;
  /** Issued at (unix timestamp) */
  readonly iat: number;
  /** Expiration (unix timestamp) */
  readonly exp: number;
  /** Sandbox session flag */
  readonly sandbox?: boolean;
}

/** OAuth 2.0 state parameter for CSRF protection */
export interface OAuthState {
  readonly nonce: string;
  readonly redirectUrl: string;
  readonly createdAt: number;
}

/** Microsoft Entra ID token response */
export interface MicrosoftTokenResponse {
  readonly access_token: string;
  readonly refresh_token: string;
  readonly id_token: string;
  readonly token_type: string;
  readonly expires_in: number;
  readonly scope: string;
}

/** Decoded Microsoft ID token claims */
export interface MicrosoftIdTokenClaims {
  /** Object ID — unique user identifier in Entra */
  readonly oid: string;
  /** Tenant ID */
  readonly tid: string;
  /** User email */
  readonly email?: string;
  /** Preferred username (usually email) */
  readonly preferred_username?: string;
  /** Display name */
  readonly name?: string;
}

/** Encrypted token stored in the database */
export interface EncryptedToken {
  readonly ciphertext: string;
  readonly iv: string;
  readonly tag: string;
}

/** User context injected into Hono after auth middleware */
export interface AuthContext {
  readonly userId: string;
  readonly tenantId: string;
  readonly role: 'admin' | 'creator' | 'viewer';
  readonly email: string;
  readonly sandbox?: boolean;
}

/** Graph API proxy request */
export interface GraphProxyRequest {
  readonly endpoint: string;
  readonly method: 'GET' | 'POST' | 'PATCH' | 'DELETE';
  readonly body?: unknown;
}
