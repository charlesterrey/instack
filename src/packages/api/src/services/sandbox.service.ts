/**
 * Sandbox service — @FORGE
 *
 * Creates ephemeral sandbox tenants for the demo experience.
 * Sandbox tenants auto-expire after 24 hours and are cleaned up by the cron job.
 */

import { ok, err } from '@instack/shared';
import type { Result } from '@instack/shared';
import { createJWT } from '../lib/jwt';
import { logger } from '../lib/logger';
import {
  tenants,
  users,
  apps,
  appComponents,
  dataSources,
  contextGraph,
  auditLog,
} from '../../drizzle/schema';
import { sql, eq } from 'drizzle-orm';
import type { Database } from '../lib/db';
import { DEMO_DATASETS, getDemoDatasetById as _getDemoDatasetById } from '../fixtures/demo-data';
import type { DemoDataset } from '../fixtures/demo-data';

export { DEMO_DATASETS };
export type { DemoDataset };

export interface SandboxSession {
  readonly tenantId: string;
  readonly userId: string;
  readonly jwt: string;
  readonly expiresAt: Date;
}

/**
 * Create a new sandbox session with an ephemeral tenant and demo user.
 * Returns a signed JWT valid for 24 hours with sandbox:true flag.
 */
export async function createSandboxSession(
  db: Database,
  jwtSecret: string,
): Promise<Result<SandboxSession, string>> {
  const sandboxId = crypto.randomUUID();
  const sandboxName = `sandbox_${sandboxId}`;
  const expiresAt = new Date(Date.now() + 86400 * 1000); // 24h

  try {
    // 1. Create sandbox tenant
    const insertedTenants = await db
      .insert(tenants)
      .values({
        name: sandboxName,
        m365TenantId: sandboxName,
        plan: 'free',
      })
      .returning({ id: tenants.id });

    const tenant = insertedTenants[0];
    if (!tenant) {
      return err('Failed to create sandbox tenant');
    }

    // 2. Create demo user
    const insertedUsers = await db
      .insert(users)
      .values({
        tenantId: tenant.id,
        email: 'demo@sandbox.instack.io',
        name: 'Utilisateur Demo',
        role: 'admin',
        m365UserId: `sandbox_user_${sandboxId}`,
        lastActiveAt: new Date(),
      })
      .returning({ id: users.id });

    const user = insertedUsers[0];
    if (!user) {
      return err('Failed to create sandbox user');
    }

    // 3. Create JWT with sandbox flag and 24h expiry
    const jwt = await createJWT(
      {
        userId: user.id,
        tenantId: tenant.id,
        role: 'admin',
        email: 'demo@sandbox.instack.io',
        sandbox: true,
        expirySeconds: 86400,
      },
      jwtSecret,
    );

    // 4. Audit log the sandbox creation
    await db.insert(auditLog).values({
      tenantId: tenant.id,
      userId: user.id,
      action: 'user.login',
      resourceType: 'session',
      metadata: { sandbox: true },
    });

    logger.info('sandbox: session created', {
      tenantId: tenant.id,
      userId: user.id,
      sandboxName,
    });

    return ok({
      tenantId: tenant.id,
      userId: user.id,
      jwt,
      expiresAt,
    });
  } catch (caught: unknown) {
    const message = caught instanceof Error ? caught.message : String(caught);
    logger.error('sandbox: failed to create session', { error: message });
    return err(`Sandbox creation failed: ${message}`);
  }
}

/**
 * Clean up expired sandbox tenants (older than 24 hours).
 * Deletes related data in correct order to respect foreign key constraints.
 */
export async function cleanupExpiredSandboxes(
  db: Database,
): Promise<{ deleted: number }> {
  const cutoff = new Date(Date.now() - 86400 * 1000);

  try {
    // Find expired sandbox tenants
    const expiredTenants = await db
      .select({ id: tenants.id })
      .from(tenants)
      .where(
        sql`${tenants.name} LIKE 'sandbox_%' AND ${tenants.createdAt} < ${cutoff}`,
      );

    if (expiredTenants.length === 0) {
      return { deleted: 0 };
    }

    const tenantIds = expiredTenants.map((t) => t.id);

    // Delete in FK-safe order for each tenant
    for (const tenantId of tenantIds) {
      await db.delete(auditLog).where(eq(auditLog.tenantId, tenantId));
      await db.delete(contextGraph).where(eq(contextGraph.tenantId, tenantId));
      await db.delete(appComponents).where(eq(appComponents.tenantId, tenantId));
      await db.delete(dataSources).where(eq(dataSources.tenantId, tenantId));
      await db.delete(apps).where(eq(apps.tenantId, tenantId));
      await db.delete(users).where(eq(users.tenantId, tenantId));
      await db.delete(tenants).where(eq(tenants.id, tenantId));
    }

    logger.info('sandbox: cleanup complete', { deleted: tenantIds.length });
    return { deleted: tenantIds.length };
  } catch (caught: unknown) {
    const message = caught instanceof Error ? caught.message : String(caught);
    logger.error('sandbox: cleanup failed', { error: message });
    return { deleted: 0 };
  }
}

/**
 * Get a demo dataset by ID.
 */
export function getDemoData(datasetId: string): DemoDataset | undefined {
  return _getDemoDatasetById(datasetId);
}
