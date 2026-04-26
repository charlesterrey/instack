import type { Database } from '../lib/db';
import * as appRepo from '../repositories/app.repository';
import { PLAN_LIMITS } from '@instack/shared';
import type { AuthContext } from '@instack/shared';

type ServiceResult<T> =
  | { readonly ok: true; readonly data: T }
  | { readonly ok: false; readonly error: string; readonly status: number };

export async function listApps(
  db: Database,
  params: appRepo.ListAppsParams,
): Promise<ServiceResult<Awaited<ReturnType<typeof appRepo.listApps>>>> {
  const result = await appRepo.listApps(db, params);
  return { ok: true, data: result };
}

export async function getApp(
  db: Database,
  appId: string,
): Promise<ServiceResult<NonNullable<Awaited<ReturnType<typeof appRepo.getAppById>>>>> {
  const app = await appRepo.getAppById(db, appId);
  if (!app) {
    return { ok: false, error: 'App not found', status: 404 };
  }
  return { ok: true, data: app };
}

export async function createApp(
  db: Database,
  auth: AuthContext,
  input: { name: string; description?: string | null; archetype: string },
  tenantPlan: string,
): Promise<ServiceResult<NonNullable<Awaited<ReturnType<typeof appRepo.createApp>>>>> {
  // Check plan limits
  const plan = (tenantPlan as keyof typeof PLAN_LIMITS) || 'free';
  const limits = PLAN_LIMITS[plan];
  if (limits && limits.maxApps > 0) {
    const currentCount = await appRepo.countAppsByTenant(db, auth.tenantId);
    if (currentCount >= limits.maxApps) {
      return { ok: false, error: `Plan limit reached: maximum ${String(limits.maxApps)} apps`, status: 403 };
    }
  }

  const app = await appRepo.createApp(db, {
    tenantId: auth.tenantId,
    creatorId: auth.userId,
    name: input.name,
    description: input.description,
    archetype: input.archetype,
  });

  if (!app) {
    return { ok: false, error: 'Failed to create app', status: 500 };
  }

  return { ok: true, data: app };
}

export async function updateApp(
  db: Database,
  auth: AuthContext,
  appId: string,
  input: Partial<{
    name: string;
    description: string | null;
    status: string;
    visibility: string;
    expiresAt: Date | null;
  }>,
): Promise<ServiceResult<NonNullable<Awaited<ReturnType<typeof appRepo.updateApp>>>>> {
  // Verify app exists and belongs to tenant (RLS handles tenant check)
  const existing = await appRepo.getAppById(db, appId);
  if (!existing) {
    return { ok: false, error: 'App not found', status: 404 };
  }

  // Only creator or admin can modify
  if (existing.creatorId !== auth.userId && auth.role !== 'admin') {
    return { ok: false, error: 'Not authorized to modify this app', status: 403 };
  }

  const updated = await appRepo.updateApp(db, appId, input);
  if (!updated) {
    return { ok: false, error: 'Failed to update app', status: 500 };
  }

  return { ok: true, data: updated };
}

export async function archiveApp(
  db: Database,
  auth: AuthContext,
  appId: string,
): Promise<ServiceResult<NonNullable<Awaited<ReturnType<typeof appRepo.updateApp>>>>> {
  return updateApp(db, auth, appId, { status: 'archived' });
}
