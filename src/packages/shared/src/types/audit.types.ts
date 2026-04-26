/** Exhaustive list of auditable actions */
export type AuditAction =
  | 'app.created'
  | 'app.updated'
  | 'app.deleted'
  | 'app.archived'
  | 'app.shared'
  | 'app.published'
  | 'app.cloned'
  | 'user.login'
  | 'user.logout'
  | 'user.invited'
  | 'user.role_changed'
  | 'data.synced'
  | 'data.sync_failed'
  | 'data.source_connected'
  | 'data.source_disconnected'
  | 'tenant.settings_updated'
  | 'tenant.plan_changed'
  | 'pipeline.started'
  | 'pipeline.completed'
  | 'pipeline.failed';

/** An immutable entry in the audit log for governance */
export interface AuditEntry {
  readonly id: string;
  /** FK to tenant — RLS boundary */
  readonly tenantId: string;
  /** FK to user who performed the action, null for system events */
  readonly userId: string | null;
  /** The auditable action performed */
  readonly action: AuditAction;
  /** Type of resource affected (e.g. 'app', 'user', 'data_source') */
  readonly resourceType: string;
  /** UUID of the affected resource, null if N/A */
  readonly resourceId: string | null;
  /** Additional structured context for the event */
  readonly metadata: Record<string, unknown>;
  /** Client IP address, null if unavailable */
  readonly ipAddress: string | null;
  readonly createdAt: Date;
}
