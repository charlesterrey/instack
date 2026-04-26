import type { TenantPlan } from '../types/tenant.types';

export const TENANT_PLANS = ['free', 'pro', 'enterprise'] as const satisfies readonly TenantPlan[];

export interface PlanLimits {
  readonly maxApps: number;
  readonly maxUsers: number;
  readonly maxDataSources: number;
  readonly allowPublicApps: boolean;
  readonly allowWriteBack: boolean;
}

export const PLAN_LIMITS: Record<TenantPlan, PlanLimits> = {
  free: {
    maxApps: 5,
    maxUsers: 3,
    maxDataSources: 3,
    allowPublicApps: false,
    allowWriteBack: false,
  },
  pro: {
    maxApps: 50,
    maxUsers: 25,
    maxDataSources: 25,
    allowPublicApps: true,
    allowWriteBack: true,
  },
  enterprise: {
    maxApps: -1,
    maxUsers: -1,
    maxDataSources: -1,
    allowPublicApps: true,
    allowWriteBack: true,
  },
};
