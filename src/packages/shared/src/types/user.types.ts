/** User roles within a tenant */
export type UserRole = 'admin' | 'creator' | 'viewer';

/** A user belonging to a tenant */
export interface User {
  /** UUID primary key */
  readonly id: string;
  /** FK to tenant this user belongs to */
  readonly tenantId: string;
  /** User email, unique within tenant */
  readonly email: string;
  /** Display name */
  readonly name: string;
  /** Permission level within the tenant */
  readonly role: UserRole;
  /** Microsoft Entra ID user identifier */
  readonly m365UserId: string;
  /** Last activity timestamp, null if never active */
  readonly lastActiveAt: Date | null;
  readonly createdAt: Date;
}
