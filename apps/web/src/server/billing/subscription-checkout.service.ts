/**
 * Platform-level subscription checkout via Zarinpal/IDPay env credentials.
 * Distinct from per-org invoice IPG (org settings).
 */
import { randomBytes } from 'crypto';

import type { PlanCode } from '@kesbyar/shared';
import {
  getPlanDefinition,
  PROVIDER_IDS,
  resolveProviderId,
  type InvoicePaymentGateway,
} from '@kesbyar/shared';
import type { BillingPeriod } from '@prisma/client';

import { prisma } from '@/lib/prisma';
import { createIdpayGateway } from '@/server/payments/gateways/idpay';
import { createZarinpalGateway } from '@/server/payments/gateways/zarinpal';

import { changePlan } from './subscription.service';

const ALLOWED = [
  PROVIDER_IDS.BILLING_MANUAL,
  PROVIDER_IDS.BILLING_ZARINPAL,
  PROVIDER_IDS.BILLING_IDPAY,
] as const;

function appBaseUrl(): string {
  return (
    process.env.NEXT_PUBLIC_APP_URL?.replace(/\/$/, '') ||
    process.env.APP_URL?.replace(/\/$/, '') ||
    'http://localhost:3000'
  );
}

function sandboxFlag(): boolean {
  const v = process.env.PAYMENT_SANDBOX ?? 'true';
  return v !== 'false' && v !== '0';
}

function getPlatformBillingGateway(): {
  gateway: InvoicePaymentGateway;
  provider: string;
} | null {
  const preferred = resolveProviderId(
    null,
    process.env.BILLING_PROVIDER,
    PROVIDER_IDS.BILLING_MANUAL,
    ALLOWED,
  );
  const sandbox = sandboxFlag();
  const merchant =
    process.env.BILLING_ZARINPAL_MERCHANT_ID ??
    process.env.PAYMENT_ZARINPAL_MERCHANT_ID ??
    null;
  const idpay =
    process.env.BILLING_IDPAY_API_KEY ?? process.env.PAYMENT_IDPAY_API_KEY ?? null;

  if (preferred === PROVIDER_IDS.BILLING_ZARINPAL && merchant) {
    return { gateway: createZarinpalGateway(merchant, { sandbox }), provider: preferred };
  }
  if (preferred === PROVIDER_IDS.BILLING_IDPAY && idpay) {
    return { gateway: createIdpayGateway(idpay, { sandbox }), provider: preferred };
  }
  if (merchant) {
    return {
      gateway: createZarinpalGateway(merchant, { sandbox }),
      provider: PROVIDER_IDS.BILLING_ZARINPAL,
    };
  }
  if (idpay) {
    return {
      gateway: createIdpayGateway(idpay, { sandbox }),
      provider: PROVIDER_IDS.BILLING_IDPAY,
    };
  }
  return null;
}

export function getSubscriptionBillingAvailability() {
  const gw = getPlatformBillingGateway();
  const sandbox = sandboxFlag();
  return {
    configured: Boolean(gw),
    provider: gw?.provider ?? PROVIDER_IDS.BILLING_MANUAL,
    sandbox,
    setupHintFa: gw
      ? undefined
      : 'پرداخت آنلاین طرح‌ها پیکربندی نشده — BILLING_ZARINPAL_MERCHANT_ID یا BILLING_IDPAY_API_KEY را در Vercel تنظیم کنید.',
  };
}

export async function startSubscriptionCheckout(
  organizationId: string,
  actorUserId: string,
  planCode: PlanCode,
  billingPeriod: BillingPeriod = 'MONTHLY',
) {
  const plan = getPlanDefinition(planCode);
  if (plan.priceMonthlyIrr === 0) {
    throw new Error('طرح رایگان نیاز به پرداخت ندارد');
  }

  const amountIrr =
    billingPeriod === 'YEARLY' ? plan.priceYearlyIrr : plan.priceMonthlyIrr;
  if (amountIrr <= 0) {
    throw new Error('مبلغ طرح نامعتبر است');
  }

  const platform = getPlatformBillingGateway();
  if (!platform) {
    throw new Error(
      getSubscriptionBillingAvailability().setupHintFa ||
        'درگاه پرداخت اشتراک پیکربندی نشده است',
    );
  }

  const checkoutId = randomBytes(16).toString('hex');
  const callbackUrl = `${appBaseUrl()}/api/billing/callback/${platform.provider}?checkoutId=${checkoutId}`;

  const session = await platform.gateway.createPayment({
    organizationId,
    invoiceId: `subscription-${checkoutId}`,
    paymentId: checkoutId,
    amountIrr,
    description: `اشتراک ${plan.name} — کسب‌یار`,
    callbackUrl,
  });

  const subscription = await prisma.subscription.findUnique({ where: { organizationId } });

  await prisma.subscriptionEvent.create({
    data: {
      organizationId,
      subscriptionId: subscription?.id,
      action: 'checkout_started',
      toPlanCode: planCode,
      actorUserId,
      metadata: {
        checkoutId,
        providerRef: session.providerRef,
        provider: platform.provider,
        planCode,
        billingPeriod,
        amountIrr,
      },
    },
  });

  return {
    checkoutUrl: session.paymentUrl,
    checkoutId,
    provider: platform.provider,
    amountIrr,
  };
}

export async function verifySubscriptionCheckout(params: {
  checkoutId: string;
  provider: string;
  raw: Record<string, string | undefined>;
}) {
  const event = await prisma.subscriptionEvent.findFirst({
    where: {
      action: 'checkout_started',
      metadata: { path: ['checkoutId'], equals: params.checkoutId },
    },
    orderBy: { createdAt: 'desc' },
  });

  if (!event) {
    return { ok: false, messageFa: 'جلسه پرداخت یافت نشد یا منقضی شده است' };
  }

  const meta =
    event.metadata && typeof event.metadata === 'object' && !Array.isArray(event.metadata)
      ? (event.metadata as Record<string, unknown>)
      : {};

  const alreadyPaid = await prisma.subscriptionEvent.findFirst({
    where: {
      organizationId: event.organizationId,
      action: 'checkout_paid',
      metadata: { path: ['checkoutId'], equals: params.checkoutId },
    },
  });
  if (alreadyPaid) {
    return { ok: true, messageFa: 'این پرداخت قبلاً ثبت شده است', organizationId: event.organizationId };
  }

  const providerRef = String(meta.providerRef ?? '');
  const amountIrr = Number(meta.amountIrr ?? 0);
  const planCode = String(meta.toPlanCode ?? meta.planCode ?? 'STARTER') as PlanCode;
  const billingPeriod = (meta.billingPeriod as BillingPeriod) ?? 'MONTHLY';
  const actorUserId = event.actorUserId ?? undefined;

  let gateway = getPlatformBillingGateway()?.gateway ?? null;
  if (!gateway || gateway.id !== params.provider) {
    const merchant =
      process.env.BILLING_ZARINPAL_MERCHANT_ID ??
      process.env.PAYMENT_ZARINPAL_MERCHANT_ID;
    const idpay = process.env.BILLING_IDPAY_API_KEY ?? process.env.PAYMENT_IDPAY_API_KEY;
    const sandbox = sandboxFlag();
    if (params.provider === PROVIDER_IDS.BILLING_ZARINPAL && merchant) {
      gateway = createZarinpalGateway(merchant, { sandbox });
    } else if (params.provider === PROVIDER_IDS.BILLING_IDPAY && idpay) {
      gateway = createIdpayGateway(idpay, { sandbox });
    }
  }

  if (!gateway) {
    return { ok: false, messageFa: 'درگاه پرداخت پیکربندی نشده است' };
  }

  const result = await gateway.verifyPayment({
    providerRef,
    amountIrr,
    raw: params.raw,
  });

  if (result.status !== 'paid') {
    await prisma.subscriptionEvent.create({
      data: {
        organizationId: event.organizationId,
        subscriptionId: event.subscriptionId,
        action: 'checkout_failed',
        toPlanCode: planCode,
        actorUserId,
        metadata: { checkoutId: params.checkoutId, message: result.messageFa },
      },
    });
    return { ok: false, messageFa: result.messageFa || 'پرداخت ناموفق بود' };
  }

  if (actorUserId) {
    await changePlan(event.organizationId, planCode, actorUserId, { billingPeriod });
  } else {
    const owner = await prisma.membership.findFirst({
      where: { organizationId: event.organizationId, role: 'OWNER', isActive: true },
      select: { userId: true },
    });
    await changePlan(
      event.organizationId,
      planCode,
      owner?.userId ?? 'system',
      { billingPeriod },
    );
  }

  await prisma.subscription.update({
    where: { organizationId: event.organizationId },
    data: {
      provider: params.provider,
      providerRef: result.reference || result.providerRef,
    },
  });

  await prisma.subscriptionEvent.create({
    data: {
      organizationId: event.organizationId,
      subscriptionId: event.subscriptionId,
      action: 'checkout_paid',
      toPlanCode: planCode,
      actorUserId,
      metadata: {
        checkoutId: params.checkoutId,
        providerRef: result.providerRef,
        reference: result.reference,
        amountIrr,
      },
    },
  });

  return {
    ok: true,
    messageFa: result.messageFa || 'پرداخت موفق — طرح به‌روزرسانی شد',
    organizationId: event.organizationId,
  };
}
