import type { Prisma } from '@prisma/client';
import { Decimal } from '@prisma/client/runtime/library';

import { AUDIT_ACTIONS, AUDIT_ENTITY_TYPES } from '@kesbyar/shared';

import { prisma } from '@/lib/prisma';
import { logActivity, logAudit } from '@/server/audit/audit.service';
import { syncInvoicePaymentStatus } from '@/server/invoices/invoice.service';
import {
  assertInvoiceBelongsToCustomer,
  requireCustomerInOrg,
} from '@/server/tenant/tenant-scope';

export async function listPayments(
  organizationId: string,
  params: { page?: number; pageSize?: number },
) {
  const page = params.page ?? 1;
  const pageSize = params.pageSize ?? 20;

  const [items, total] = await Promise.all([
    prisma.payment.findMany({
      where: { organizationId },
      orderBy: { paidAt: 'desc' },
      skip: (page - 1) * pageSize,
      take: pageSize,
      include: { customer: true, invoice: true },
    }),
    prisma.payment.count({ where: { organizationId } }),
  ]);

  return { items, total, page, pageSize, totalPages: Math.ceil(total / pageSize) };
}

export async function createPayment(
  organizationId: string,
  userId: string,
  data: {
    customerId: string;
    invoiceId?: string;
    amount: number;
    method: Prisma.PaymentCreateInput['method'];
    reference?: string;
    notes?: string;
    paidAt?: Date;
  },
) {
  await requireCustomerInOrg(organizationId, data.customerId);

  if (data.invoiceId) {
    await assertInvoiceBelongsToCustomer(organizationId, data.invoiceId, data.customerId);
  }

  const payment = await prisma.payment.create({
    data: {
      organizationId,
      customerId: data.customerId,
      invoiceId: data.invoiceId,
      amount: new Decimal(data.amount),
      method: data.method,
      reference: data.reference,
      notes: data.notes,
      paidAt: data.paidAt ?? new Date(),
      status: 'COMPLETED',
    },
    include: { customer: true, invoice: true },
  });

  if (data.invoiceId) {
    await syncInvoicePaymentStatus(data.invoiceId);
  }

  await logActivity({
    organizationId,
    userId,
    type: 'PAYMENT',
    title: 'پرداخت ثبت شد',
    description: `${payment.amount.toString()} ریال`,
    customerId: data.customerId,
    invoiceId: data.invoiceId,
    paymentId: payment.id,
  });

  await logAudit({
    organizationId,
    userId,
    action: AUDIT_ACTIONS.PAYMENT_CREATE,
    entityType: AUDIT_ENTITY_TYPES.PAYMENT,
    entityId: payment.id,
    metadata: {
      amount: Number(payment.amount),
      customerId: data.customerId,
      invoiceId: data.invoiceId ?? null,
      method: data.method,
    },
  });

  return payment;
}
