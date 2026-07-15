import type { IndustryPackId } from '../packs/types';

import type { PlanCode, PlanDefinition, PlanFeature, PlanQuota } from './types';

const UNLIMITED = 999_999;

export const PLAN_CATALOG: Record<PlanCode, PlanDefinition> = {
  FREE: {
    code: 'FREE',
    name: 'رایگان',
    description: 'شروع کار با امکانات پایه برای تیم‌های کوچک',
    priceMonthlyIrr: 0,
    priceYearlyIrr: 0,
    sortOrder: 0,
    upgradeTo: 'STARTER',
    features: {
      reports: false,
      reportsAdvanced: false,
      aiAssistant: false,
      automation: false,
      files: true,
      conversation: false,
    },
    quotas: {
      members: 2,
      customers: 25,
      leads: 15,
      invoicesPerMonth: 10,
      automationRules: 0,
      fileAttachments: 20,
    },
    packs: { mode: 'none' },
  },
  STARTER: {
    code: 'STARTER',
    name: 'استارتر',
    description: 'یک بسته عمودی + گزارش‌های پایه برای کسب‌وکار در حال رشد',
    priceMonthlyIrr: 2_900_000,
    priceYearlyIrr: 29_000_000,
    sortOrder: 1,
    upgradeTo: 'BUSINESS',
    features: {
      reports: true,
      reportsAdvanced: false,
      aiAssistant: false,
      automation: true,
      files: true,
      conversation: false,
    },
    quotas: {
      members: 5,
      customers: 200,
      leads: 100,
      invoicesPerMonth: 50,
      automationRules: 3,
      fileAttachments: 100,
    },
    packs: { mode: 'single' },
  },
  BUSINESS: {
    code: 'BUSINESS',
    name: 'حرفه‌ای',
    description: 'همه بسته‌های عمودی، دستیار هوشمند و اتوماسیون پیشرفته',
    priceMonthlyIrr: 7_900_000,
    priceYearlyIrr: 79_000_000,
    sortOrder: 2,
    highlighted: true,
    upgradeTo: 'ENTERPRISE',
    features: {
      reports: true,
      reportsAdvanced: true,
      aiAssistant: true,
      automation: true,
      files: true,
      conversation: true,
    },
    quotas: {
      members: 15,
      customers: 2_000,
      leads: UNLIMITED,
      invoicesPerMonth: 500,
      automationRules: 15,
      fileAttachments: 1_000,
    },
    packs: { mode: 'all' },
  },
  ENTERPRISE: {
    code: 'ENTERPRISE',
    name: 'سازمانی',
    description: 'محدودیت‌های بالا و پشتیبانی اختصاصی — مناسب سازمان‌های بزرگ',
    priceMonthlyIrr: 19_900_000,
    priceYearlyIrr: 199_000_000,
    sortOrder: 3,
    features: {
      reports: true,
      reportsAdvanced: true,
      aiAssistant: true,
      automation: true,
      files: true,
      conversation: true,
    },
    quotas: {
      members: UNLIMITED,
      customers: UNLIMITED,
      leads: UNLIMITED,
      invoicesPerMonth: UNLIMITED,
      automationRules: UNLIMITED,
      fileAttachments: UNLIMITED,
    },
    packs: { mode: 'all' },
  },
};

export const PLAN_CODES = Object.keys(PLAN_CATALOG) as PlanCode[];

export function getPlanDefinition(code: string): PlanDefinition {
  return PLAN_CATALOG[code as PlanCode] ?? PLAN_CATALOG.FREE;
}

export function listPublicPlans(): PlanDefinition[] {
  return PLAN_CODES.map((c) => PLAN_CATALOG[c]).sort((a, b) => a.sortOrder - b.sortOrder);
}

export function isUnlimitedQuota(value: number): boolean {
  return value >= UNLIMITED;
}

export function canAccessFeature(plan: PlanDefinition, feature: PlanFeature): boolean {
  const map: Record<PlanFeature, keyof PlanDefinition['features']> = {
    reports: 'reports',
    reportsAdvanced: 'reportsAdvanced',
    aiAssistant: 'aiAssistant',
    automation: 'automation',
    files: 'files',
    conversation: 'conversation',
  };
  return plan.features[map[feature]] === true;
}

export function getQuotaLimit(plan: PlanDefinition, quota: PlanQuota): number {
  return plan.quotas[quota];
}

export function canUseIndustryPack(
  plan: PlanDefinition,
  industryPack: IndustryPackId | string,
): boolean {
  if (industryPack === 'GENERAL') return true;
  if (plan.packs.mode === 'all') return true;
  if (plan.packs.mode === 'none') return false;
  // single: org may use its configured primary vertical pack
  return plan.packs.mode === 'single';
}

export function formatPlanPrice(amount: number): string {
  if (amount === 0) return 'رایگان';
  return new Intl.NumberFormat('fa-IR').format(amount);
}
