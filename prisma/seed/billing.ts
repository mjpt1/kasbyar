import type { BillingPeriod, PrismaClient, SubscriptionStatus } from '@prisma/client';
import type { PlanCode } from '@kesbyar/shared';

export async function seedOrganizationSubscription(
  prisma: PrismaClient,
  organizationId: string,
  options: {
    planCode: PlanCode;
    status: SubscriptionStatus;
    billingPeriod?: BillingPeriod;
    trialDays?: number;
  },
) {
  const now = new Date();
  let trialEndsAt: Date | null = null;
  let currentPeriodEnd = new Date(now);
  currentPeriodEnd.setMonth(currentPeriodEnd.getMonth() + 1);

  if (options.status === 'TRIALING' && options.trialDays) {
    trialEndsAt = new Date(now);
    trialEndsAt.setDate(trialEndsAt.getDate() + options.trialDays);
    currentPeriodEnd = trialEndsAt;
  }

  const subscription = await prisma.subscription.upsert({
    where: { organizationId },
    create: {
      organizationId,
      planCode: options.planCode,
      status: options.status,
      billingPeriod: options.billingPeriod ?? 'MONTHLY',
      trialEndsAt,
      currentPeriodStart: now,
      currentPeriodEnd,
      provider: 'manual',
    },
    update: {
      planCode: options.planCode,
      status: options.status,
      billingPeriod: options.billingPeriod ?? 'MONTHLY',
      trialEndsAt,
      currentPeriodStart: now,
      currentPeriodEnd,
    },
  });

  await prisma.subscriptionEvent.create({
    data: {
      organizationId,
      subscriptionId: subscription.id,
      action: 'seed_subscription',
      toPlanCode: options.planCode,
      metadata: { status: options.status, demo: true },
    },
  });

  return subscription;
}
