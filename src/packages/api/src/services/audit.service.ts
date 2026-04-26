import type { Database } from '../lib/db';
import type { AuthContext, AuditAction } from '@instack/shared';
import { auditLog } from '../../drizzle/schema';

interface AuditInput {
  action: AuditAction;
  resourceType: string;
  resourceId?: string;
  metadata?: Record<string, unknown>;
  ipAddress?: string;
}

export async function logAudit(
  db: Database,
  auth: AuthContext,
  input: AuditInput,
): Promise<void> {
  await db.insert(auditLog).values({
    tenantId: auth.tenantId,
    userId: auth.userId,
    action: input.action,
    resourceType: input.resourceType,
    resourceId: input.resourceId ?? null,
    metadata: input.metadata ?? {},
    ipAddress: input.ipAddress ?? null,
  });
}
