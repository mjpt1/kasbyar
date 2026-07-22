import { randomBytes } from 'crypto';

import { ACTIVE_RECORD_FILTER, PROVIDER_IDS } from '@kesbyar/shared';
import { Decimal } from '@prisma/client/runtime/library';

import { prisma } from '@/lib/prisma';
import { syncInvoicePaymentStatus } from '@/server/invoices/invoice.service';

import {
  getInvoicePaymentAvailability,
  getInvoicePaymentGateway,
  getInvoicePaymentGatewayByProvider,
} from './gateways';

function appBaseUrl(): string {
  return (
    process.env.NEXT_PUBLIC_APP_URL?.replace(/\/$/, '') ||
    process.env.APP_URL?.replace(/\/$/, '') ||
    'http://localhost:3000'
  );
}

function newPublicToken(): string {
  return randomBytes(24).toString('hex');
}

export async function createOrGetPaymentLink(
  organizationId: string,
  invoiceId: string,
) {
  const invoice = await prisma.invoice.findFirst({
    where: { id: invoiceId, organizationId, ...ACTIVE_RECORD_FILTER },
    include: { customer: true },
  });
  if (!invoice) throw new Error('فاکتور یافت نشد');
  if (invoice.kind === 'PROFORMA') {
    throw new Error('برای پیش‌فاکتور لینک پرداخت آنلاین صادر نمی‌شود؛ ابتدا فاکتور قطعی کنید');
  }
  if (['PAID', 'CANCELLED'].includes(invoice.status)) {
    throw new Error('این فاکتور قابل پرداخت آنلاین نیست');
  }

  const remaining = Number(invoice.total) - Number(invoice.paidAmount);
  if (remaining <= 0) throw new Error('مانده‌ای برای پرداخت وجود ندارد');

  const gateway = await getInvoicePaymentAvailability(organizationId);

  const existing = await prisma.invoicePaymentLink.findFirst({
    where: { invoiceId, organizationId, isActive: true },
    orderBy: { createdAt: 'desc' },
  });
  if (existing && Number(existing.amount) === remaining) {
    return {
      link: existing,
      publicUrl: `${appBaseUrl()}/pay/${existing.token}`,
      remaining,
      gateway,
    };
  }

  if (existing) {
    await prisma.invoicePaymentLink.update({
      where: { id: existing.id },
      data: { isActive: false },
    });
  }

  const link = await prisma.invoicePaymentLink.create({
    data: {
      organizationId,
      invoiceId,
      token: newPublicToken(),
      amount: new Decimal(remaining),
      isActive: true,
      expiresAt: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000),
    },
  });

  return {
    link,
    publicUrl: `${appBaseUrl()}/pay/${link.token}`,
    remaining,
    gateway,
  };
}

export async function getPaymentLinkByToken(token: string) {
  const link = await prisma.invoicePaymentLink.findUnique({
    where: { token },
    include: {
      invoice: {
        include: {
          customer: true,
          organization: true,
          items: { orderBy: { sortOrder: 'asc' } },
        },
      },
    },
  });
  if (!link || !link.isActive) return null;
  if (link.expiresAt && link.expiresAt < new Date()) return null;
  return link;
}

export async function startOnlinePaymentForLink(token: string) {
  const link = await getPaymentLinkByToken(token);
  if (!link) throw new Error('لینک پرداخت معتبر نیست یا منقضی شده است');

  const invoice = link.invoice;
  const remaining = Number(invoice.total) - Number(invoice.paidAmount);
  if (remaining <= 0) throw new Error('این فاکتور قبلاً پرداخت شده است');

  const gateway = await getInvoicePaymentGateway(link.organizationId);
  const availability = await getInvoicePaymentAvailability(link.organizationId);
  if (!gateway) {
    throw new Error(
      availability.setupHintFa ||
        'درگاه پرداخت آنلاین پیکربندی نشده است. از تنظیمات سازمان کلید درگاه را وارد کنید.',
    );
  }

  // Reuse pending payment with same authority path if any
  let payment = link.paymentId
    ? await prisma.payment.findUnique({ where: { id: link.paymentId } })
    : null;

  if (!payment || payment.status !== 'PENDING') {
    payment = await prisma.payment.create({
      data: {
        organizationId: link.organizationId,
        customerId: invoice.customerId,
        invoiceId: invoice.id,
        amount: new Decimal(remaining),
        method: 'ONLINE',
        status: 'PENDING',
        gatewayProvider: gateway.id,
        notes: 'پرداخت آنلاین در انتظار تأیید درگاه',
      },
    });
    await prisma.invoicePaymentLink.update({
      where: { id: link.id },
      data: { paymentId: payment.id, amount: new Decimal(remaining) },
    });
  }

  const callbackUrl = `${appBaseUrl()}/api/payments/callback/${gateway.id}?paymentId=${payment.id}&token=${token}`;

  const session = await gateway.createPayment({
    organizationId: link.organizationId,
    invoiceId: invoice.id,
    paymentId: payment.id,
    amountIrr: remaining,
    description: `پرداخت فاکتور ${invoice.number} — ${invoice.organization.name}`,
    callbackUrl,
    mobile: invoice.customer.phone ?? undefined,
    email: invoice.customer.email ?? undefined,
  });

  await prisma.payment.update({
    where: { id: payment.id },
    data: {
      gatewayProvider: session.provider,
      gatewayAuthority: session.providerRef,
      reference: session.providerRef,
    },
  });

  return { paymentUrl: session.paymentUrl, paymentId: payment.id, provider: session.provider };
}

/**
 * Idempotent verify: if already COMPLETED for this authority, return success.
 */
export async function verifyOnlinePayment(params: {
  provider: string;
  paymentId: string;
  raw: Record<string, string | undefined>;
}) {
  const payment = await prisma.payment.findUnique({
    where: { id: params.paymentId },
    include: { invoice: true },
  });
  if (!payment) throw new Error('پرداخت یافت نشد');

  if (payment.status === 'COMPLETED') {
    return {
      ok: true,
      alreadyProcessed: true,
      messageFa: 'این پرداخت قبلاً ثبت شده است',
      invoiceId: payment.invoiceId,
    };
  }

  let gateway = await getInvoicePaymentGateway(payment.organizationId);
  if (!gateway || gateway.id !== params.provider) {
    gateway = await getInvoicePaymentGatewayByProvider(payment.organizationId, params.provider);
  }
  if (!gateway) {
    // Last-resort env keys for the payment's provider (single-tenant)
    const { createZarinpalGateway } = await import('./gateways/zarinpal');
    const { createIdpayGateway } = await import('./gateways/idpay');
    const cfgMerchant =
      process.env.PAYMENT_ZARINPAL_MERCHANT_ID ?? process.env.BILLING_ZARINPAL_MERCHANT_ID;
    const cfgIdpay = process.env.PAYMENT_IDPAY_API_KEY ?? process.env.BILLING_IDPAY_API_KEY;

    if (params.provider === PROVIDER_IDS.BILLING_ZARINPAL && cfgMerchant) {
      gateway = createZarinpalGateway(cfgMerchant);
    } else if (params.provider === PROVIDER_IDS.BILLING_IDPAY && cfgIdpay) {
      gateway = createIdpayGateway(cfgIdpay);
    }
  }
  if (!gateway) {
    throw new Error(
      'درگاه پرداخت پیکربندی نشده است. کلید درگاه را در تنظیمات سازمان وارد کنید.',
    );
  }

  const result = await gateway.verifyPayment({
    providerRef: payment.gatewayAuthority || params.raw.Authority || params.raw.id || '',
    amountIrr: Number(payment.amount),
    raw: params.raw,
  });

  return finalizeVerify(payment, result);
}

async function finalizeVerify(
  payment: {
    id: string;
    invoiceId: string | null;
    gatewayAuthority: string | null;
    status: string;
  },
  result: { status: 'paid' | 'failed' | 'pending'; providerRef: string; reference?: string; messageFa?: string },
) {
  if (result.status === 'paid') {
    // Idempotent: another request may have completed
    const current = await prisma.payment.findUnique({ where: { id: payment.id } });
    if (current?.status === 'COMPLETED') {
      return {
        ok: true,
        alreadyProcessed: true,
        messageFa: 'این پرداخت قبلاً ثبت شده است',
        invoiceId: payment.invoiceId,
      };
    }

    await prisma.payment.update({
      where: { id: payment.id },
      data: {
        status: 'COMPLETED',
        reference: result.reference || result.providerRef,
        gatewayAuthority: result.providerRef || payment.gatewayAuthority,
        paidAt: new Date(),
        notes: result.messageFa || 'پرداخت آنلاین تأیید شد',
      },
    });

    if (payment.invoiceId) {
      await syncInvoicePaymentStatus(payment.invoiceId);
      await prisma.invoicePaymentLink.updateMany({
        where: { paymentId: payment.id },
        data: { isActive: false },
      });
    }

    return {
      ok: true,
      alreadyProcessed: false,
      messageFa: result.messageFa || 'پرداخت با موفقیت انجام شد',
      invoiceId: payment.invoiceId,
    };
  }

  await prisma.payment.update({
    where: { id: payment.id },
    data: {
      status: 'FAILED',
      notes: result.messageFa || 'پرداخت ناموفق',
    },
  });

  return {
    ok: false,
    alreadyProcessed: false,
    messageFa: result.messageFa || 'پرداخت ناموفق بود',
    invoiceId: payment.invoiceId,
  };
}
