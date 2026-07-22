import { formatCurrency, formatCurrencyWithOptionalToman } from '@kesbyar/shared';

import { isValidIranianMobile, normalizeIranianMobile } from '@/lib/validators/iranian';
import { prisma } from '@/lib/prisma';
import {
  isSmsProviderConfiguredForOrg,
  sendNotification,
} from '@/server/notifications/notification.adapter';
import { createOrGetPaymentLink } from '@/server/payments/invoice-payment.service';

function moneyLabel(amount: number, showToman: boolean): string {
  return formatCurrencyWithOptionalToman(amount, { showToman });
}

/** پیامک یادآوری سررسید فاکتور */
export async function sendInvoiceDueReminderSms(params: {
  organizationId: string;
  invoiceId: string;
}) {
  const invoice = await prisma.invoice.findFirst({
    where: { id: params.invoiceId, organizationId: params.organizationId },
    include: { customer: true, organization: true },
  });
  if (!invoice) throw new Error('فاکتور یافت نشد');
  const phone = invoice.customer.phone;
  if (!phone || !isValidIranianMobile(normalizeIranianMobile(phone))) {
    throw new Error('شماره موبایل مشتری برای پیامک معتبر نیست');
  }

  const remaining = Number(invoice.total) - Number(invoice.paidAmount);
  const showToman = invoice.organization.showTomanAlongside;
  const body = [
    `${invoice.organization.name}`,
    `یادآوری فاکتور ${invoice.number}`,
    `مانده: ${moneyLabel(remaining, showToman)}`,
    invoice.dueDate
      ? `سررسید: ${invoice.dueDate.toLocaleDateString('fa-IR')}`
      : null,
    'لطفاً در اسرع وقت تسویه کنید.',
  ]
    .filter(Boolean)
    .join('\n');

  return sendNotification({
    organizationId: params.organizationId,
    channel: 'sms',
    recipient: normalizeIranianMobile(phone),
    body,
    tags: { kind: 'invoice_due', invoiceId: invoice.id },
  });
}

/** ساخت لینک پرداخت و ارسال پیامک به مشتری */
export async function sendInvoicePaymentLinkSms(params: {
  organizationId: string;
  invoiceId: string;
}) {
  const invoice = await prisma.invoice.findFirst({
    where: { id: params.invoiceId, organizationId: params.organizationId },
    include: { customer: true, organization: true },
  });
  if (!invoice) throw new Error('فاکتور یافت نشد');
  const phone = invoice.customer.phone;
  if (!phone || !isValidIranianMobile(normalizeIranianMobile(phone))) {
    throw new Error('شماره موبایل مشتری برای پیامک معتبر نیست');
  }

  const { publicUrl, remaining } = await createOrGetPaymentLink(
    params.organizationId,
    params.invoiceId,
  );
  const showToman = invoice.organization.showTomanAlongside;
  const body = [
    `${invoice.organization.name}`,
    `لینک پرداخت فاکتور ${invoice.number}`,
    `مبلغ: ${moneyLabel(remaining, showToman)}`,
    publicUrl,
  ].join('\n');

  const result = await sendNotification({
    organizationId: params.organizationId,
    channel: 'sms',
    recipient: normalizeIranianMobile(phone),
    body,
    tags: { kind: 'payment_link', invoiceId: invoice.id },
  });

  const smsConfigured = await isSmsProviderConfiguredForOrg(params.organizationId);
  return { ...result, publicUrl, smsConfigured };
}

export { isSmsProviderConfiguredForOrg, formatCurrency };
