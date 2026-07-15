import type { IndustryPackId } from '../packs/types';

/** Product plan identifiers — catalog keys, not DB ids. */
export type PlanCode = 'FREE' | 'STARTER' | 'BUSINESS' | 'ENTERPRISE';

export type PlanFeature =
  | 'reports'
  | 'reportsAdvanced'
  | 'aiAssistant'
  | 'automation'
  | 'files'
  | 'conversation';

export type PlanQuota =
  | 'members'
  | 'customers'
  | 'leads'
  | 'invoicesPerMonth'
  | 'automationRules'
  | 'fileAttachments';

export type PackEntitlementMode = 'none' | 'single' | 'all';

export interface PlanQuotaLimits {
  members: number;
  customers: number;
  leads: number;
  invoicesPerMonth: number;
  automationRules: number;
  fileAttachments: number;
}

export interface PlanFeatureFlags {
  reports: boolean;
  reportsAdvanced: boolean;
  aiAssistant: boolean;
  automation: boolean;
  files: boolean;
  conversation: boolean;
}

export interface PlanPackEntitlement {
  mode: PackEntitlementMode;
}

export interface PlanDefinition {
  code: PlanCode;
  name: string;
  description: string;
  priceMonthlyIrr: number;
  priceYearlyIrr: number;
  features: PlanFeatureFlags;
  quotas: PlanQuotaLimits;
  packs: PlanPackEntitlement;
  /** Suggested upgrade when hitting limits on this plan */
  upgradeTo?: PlanCode;
  sortOrder: number;
  highlighted?: boolean;
}

export interface EntitlementCheckResult {
  allowed: boolean;
  reason?: 'feature' | 'quota' | 'pack' | 'subscription_inactive';
  message?: string;
  feature?: PlanFeature;
  quota?: PlanQuota;
  limit?: number;
  current?: number;
  suggestedPlan?: PlanCode;
}

export interface UsageSnapshot {
  members: number;
  customers: number;
  leads: number;
  invoicesThisMonth: number;
  automationRules: number;
  fileAttachments: number;
}

export interface SubscriptionSummary {
  planCode: PlanCode;
  planName: string;
  status: string;
  billingPeriod: string;
  isTrialing: boolean;
  trialEndsAt: string | null;
  currentPeriodEnd: string | null;
  capabilities: {
    features: PlanFeatureFlags;
    quotas: PlanQuotaLimits;
    packs: PlanPackEntitlement;
  };
  usage: UsageSnapshot;
}
