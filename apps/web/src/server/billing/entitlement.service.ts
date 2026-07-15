import type { PlanCode, PlanFeature, PlanQuota, SubscriptionSummary } from '@kesbyar/shared';
import {
  canAccessFeature,
  canUseIndustryPack,
  getPlanDefinition,
  getQuotaLimit,
  isUnlimitedQuota,
  PLAN_FEATURE_LABELS,
} from '@kesbyar/shared';
import type { Subscription, SubscriptionStatus } from '@prisma/client';

import { PlanUpgradeRequiredError } from '@/lib/errors';
import { prisma } from '@/lib/prisma';

import { getOrganizationUsage } from './usage.service';

const INACTIVE_STATUSES: SubscriptionStatus[] = ['CANCELED', 'EXPIRED'];

export interface EntitlementContext {
  organizationId: string;
  industryPack: string;
  planCode: PlanCode;
  plan: ReturnType<typeof getPlanDefinition>;
  subscription: Subscription | null;
  isActive: boolean;
  isTrialing: boolean;
}

export async function getEntitlementContext(
  organizationId: string,
): Promise<EntitlementContext> {
  const org = await prisma.organization.findUnique({
    where: { id: organizationId },
    include: { subscription: true },
  });

  if (!org) {
    throw new Error('Organization not found');
  }

  let subscription = org.subscription;
  if (!subscription) {
    subscription = await ensureDefaultSubscription(organizationId);
  }

  const effective = resolveEffectivePlan(subscription);
  const plan = getPlanDefinition(effective.planCode);

  return {
    organizationId,
    industryPack: org.industryPack,
    planCode: effective.planCode,
    plan,
    subscription,
    isActive: effective.isActive,
    isTrialing: effective.isTrialing,
  };
}

function resolveEffectivePlan(subscription: Subscription): {
  planCode: PlanCode;
  isActive: boolean;
  isTrialing: boolean;
} {
  const now = new Date();

  if (INACTIVE_STATUSES.includes(subscription.status)) {
    return { planCode: 'FREE', isActive: false, isTrialing: false };
  }

  if (subscription.status === 'TRIALING') {
    if (subscription.trialEndsAt && subscription.trialEndsAt < now) {
      return { planCode: 'FREE', isActive: false, isTrialing: false };
    }
    return {
      planCode: subscription.planCode as PlanCode,
      isActive: true,
      isTrialing: true,
    };
  }

  if (subscription.status === 'PAST_DUE') {
    // Grace: keep plan features but flag inactive billing
    return {
      planCode: subscription.planCode as PlanCode,
      isActive: true,
      isTrialing: false,
    };
  }

  return {
    planCode: subscription.planCode as PlanCode,
    isActive: subscription.status === 'ACTIVE',
    isTrialing: false,
  };
}

async function ensureDefaultSubscription(organizationId: string) {
  const trialEnd = new Date();
  trialEnd.setDate(trialEnd.getDate() + 14);

  return prisma.subscription.create({
    data: {
      organizationId,
      planCode: 'STARTER',
      status: 'TRIALING',
      trialEndsAt: trialEnd,
      currentPeriodStart: new Date(),
      currentPeriodEnd: trialEnd,
      provider: 'manual',
    },
  });
}

export async function checkFeature(
  organizationId: string,
  feature: PlanFeature,
): Promise<{ allowed: boolean; message?: string; suggestedPlan?: PlanCode }> {
  const ctx = await getEntitlementContext(organizationId);

  if (!ctx.isActive && !ctx.isTrialing) {
    return {
      allowed: false,
      message: 'اشتراک شما فعال نیست. لطفاً طرح خود را تمدید کنید.',
      suggestedPlan: 'STARTER',
    };
  }

  if (!canAccessFeature(ctx.plan, feature)) {
    const label = PLAN_FEATURE_LABELS[feature] ?? feature;
    return {
      allowed: false,
      message: `قابلیت «${label}» در طرح ${ctx.plan.name} موجود نیست.`,
      suggestedPlan: ctx.plan.upgradeTo,
    };
  }

  return { allowed: true };
}

export async function checkQuota(
  organizationId: string,
  quota: PlanQuota,
  increment = 1,
): Promise<{
  allowed: boolean;
  message?: string;
  limit?: number;
  current?: number;
  suggestedPlan?: PlanCode;
}> {
  const ctx = await getEntitlementContext(organizationId);
  const usage = await getOrganizationUsage(organizationId);
  const limit = getQuotaLimit(ctx.plan, quota);
  const current = usage[quota === 'invoicesPerMonth' ? 'invoicesThisMonth' : quota];

  if (isUnlimitedQuota(limit)) {
    return { allowed: true, limit, current };
  }

  if (current + increment > limit) {
    return {
      allowed: false,
      message: `سقف ${quota} در طرح ${ctx.plan.name} تکمیل شده است (${current}/${limit}).`,
      limit,
      current,
      suggestedPlan: ctx.plan.upgradeTo,
    };
  }

  return { allowed: true, limit, current };
}

export async function checkPackEntitlement(organizationId: string): Promise<{
  allowed: boolean;
  message?: string;
  suggestedPlan?: PlanCode;
}> {
  const ctx = await getEntitlementContext(organizationId);

  if (!canUseIndustryPack(ctx.plan, ctx.industryPack)) {
    return {
      allowed: false,
      message: `بسته عمودی در طرح ${ctx.plan.name} فعال نیست. برای استفاده از ماژول تخصصی، طرح خود را ارتقا دهید.`,
      suggestedPlan: ctx.plan.upgradeTo ?? 'STARTER',
    };
  }

  return { allowed: true };
}

export async function assertFeature(organizationId: string, feature: PlanFeature): Promise<void> {
  const result = await checkFeature(organizationId, feature);
  if (!result.allowed) {
    throw new PlanUpgradeRequiredError(
      result.message ?? 'این قابلیت در طرح فعلی شما نیست',
      'feature',
      feature,
      result.suggestedPlan,
    );
  }
}

export async function assertQuota(
  organizationId: string,
  quota: PlanQuota,
  increment = 1,
): Promise<void> {
  const result = await checkQuota(organizationId, quota, increment);
  if (!result.allowed) {
    throw new PlanUpgradeRequiredError(
      result.message ?? 'سقف استفاده تکمیل شده است',
      'quota',
      quota,
      result.suggestedPlan,
    );
  }
}

export async function assertPackEntitlement(organizationId: string): Promise<void> {
  const result = await checkPackEntitlement(organizationId);
  if (!result.allowed) {
    throw new PlanUpgradeRequiredError(
      result.message ?? 'بسته عمودی در طرح فعلی فعال نیست',
      'pack',
      undefined,
      result.suggestedPlan,
    );
  }
}

export async function getSubscriptionSummary(
  organizationId: string,
): Promise<SubscriptionSummary> {
  const ctx = await getEntitlementContext(organizationId);
  const usage = await getOrganizationUsage(organizationId);
  const sub = ctx.subscription!;

  return {
    planCode: ctx.planCode,
    planName: ctx.plan.name,
    status: sub.status,
    billingPeriod: sub.billingPeriod,
    isTrialing: ctx.isTrialing,
    trialEndsAt: sub.trialEndsAt?.toISOString() ?? null,
    currentPeriodEnd: sub.currentPeriodEnd?.toISOString() ?? null,
    capabilities: {
      features: ctx.plan.features,
      quotas: ctx.plan.quotas,
      packs: ctx.plan.packs,
    },
    usage,
  };
}
