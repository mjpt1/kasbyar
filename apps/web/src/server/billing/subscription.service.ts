import type { PlanCode } from '@kesbyar/shared';
import { AUDIT_ACTIONS, AUDIT_ENTITY_TYPES, getPlanDefinition, METRIC_EVENTS } from '@kesbyar/shared';
import type { BillingPeriod, SubscriptionStatus } from '@prisma/client';

import { recordMetric } from '@/lib/logger';
import { prisma } from '@/lib/prisma';
import { logAudit } from '@/server/audit/audit.service';

import { getSubscriptionSummary } from './entitlement.service';

export async function getSubscription(organizationId: string) {
  return prisma.subscription.findUnique({ where: { organizationId } });
}

export async function changePlan(
  organizationId: string,
  planCode: PlanCode,
  actorUserId: string,
  options?: { billingPeriod?: BillingPeriod; startTrial?: boolean },
) {
  const plan = getPlanDefinition(planCode);
  if (!plan) {
    throw new Error('Invalid plan');
  }

  const existing = await prisma.subscription.findUnique({ where: { organizationId } });

  const now = new Date();
  const periodEnd = new Date(now);
  if (options?.billingPeriod === 'YEARLY') {
    periodEnd.setFullYear(periodEnd.getFullYear() + 1);
  } else {
    periodEnd.setMonth(periodEnd.getMonth() + 1);
  }

  let trialEndsAt: Date | null = null;
  let status: SubscriptionStatus = 'ACTIVE';

  if (options?.startTrial && planCode !== 'FREE') {
    trialEndsAt = new Date(now);
    trialEndsAt.setDate(trialEndsAt.getDate() + 14);
    status = 'TRIALING';
  }

  const data = {
    planCode,
    status,
    billingPeriod: options?.billingPeriod ?? ('MONTHLY' as BillingPeriod),
    trialEndsAt,
    currentPeriodStart: now,
    currentPeriodEnd: trialEndsAt ?? periodEnd,
    canceledAt: null,
    provider: 'manual' as const,
  };

  const subscription = existing
    ? await prisma.subscription.update({
        where: { organizationId },
        data,
      })
    : await prisma.subscription.create({
        data: { organizationId, ...data },
      });

  await prisma.subscriptionEvent.create({
    data: {
      organizationId,
      subscriptionId: subscription.id,
      action: 'plan_changed',
      fromPlanCode: existing?.planCode ?? null,
      toPlanCode: planCode,
      actorUserId,
      metadata: { billingPeriod: data.billingPeriod, manual: true },
    },
  });

  await logAudit({
    organizationId,
    userId: actorUserId,
    action: AUDIT_ACTIONS.SUBSCRIPTION_CHANGE,
    entityType: AUDIT_ENTITY_TYPES.SUBSCRIPTION,
    entityId: subscription.id,
    metadata: {
      fromPlan: existing?.planCode ?? null,
      toPlan: planCode,
      billingPeriod: data.billingPeriod,
    },
  });

  recordMetric(METRIC_EVENTS.PLAN_CHANGED, {
    organizationId,
    planCode,
    source: 'web',
  });

  return getSubscriptionSummary(organizationId);
}

export async function listSubscriptionEvents(organizationId: string, limit = 20) {
  return prisma.subscriptionEvent.findMany({
    where: { organizationId },
    orderBy: { createdAt: 'desc' },
    take: limit,
  });
}
