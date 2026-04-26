/** Pricing plan tiers */
export type TenantPlan = 'free' | 'pro' | 'enterprise';

/** Tenant-level settings stored as JSONB */
export interface TenantSettings {
  readonly maxApps?: number;
  readonly maxUsers?: number;
  readonly allowPublicApps?: boolean;
  readonly customDomain?: string;
}

/** A tenant organisation */
export interface Tenant {
  readonly id: string;
  readonly name: string;
  readonly m365TenantId: string;
  readonly plan: TenantPlan;
  readonly settings: TenantSettings;
  readonly createdAt: Date;
  readonly updatedAt: Date;
}
