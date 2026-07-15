import type { InvoiceStatus, Prisma, PrismaClient } from '@prisma/client';
import { Decimal } from '@prisma/client/runtime/library';

import { DEMO_ORG_SLUGS, DEMO_USER_EMAILS, LEGACY_ORG_SLUGS } from './constants';

export function daysAgo(n: number): Date {
  const d = new Date();
  d.setDate(d.getDate() - n);
  return d;
}

export function daysFromNow(n: number): Date {
  const d = new Date();
  d.setDate(d.getDate() + n);
  return d;
}

export function startOfToday(): Date {
  const d = new Date();
  d.setHours(0, 0, 0, 0);
  return d;
}

export function endOfToday(): Date {
  const d = new Date();
  d.setHours(23, 59, 59, 999);
  return d;
}

export function atHour(base: Date, hour: number): Date {
  const d = new Date(base);
  d.setHours(hour, 0, 0, 0);
  return d;
}

export function invoiceNumber(year: number, seq: number): string {
  return `INV-${year}-${String(seq).padStart(4, '0')}`;
}

export async function clearDemoData(prisma: PrismaClient): Promise<void> {
  await prisma.organization.deleteMany({
    where: { slug: { in: [...DEMO_ORG_SLUGS, ...LEGACY_ORG_SLUGS] } },
  });

  await prisma.user.deleteMany({
    where: { email: { in: [...DEMO_USER_EMAILS] } },
  });
}

interface InvoiceItemInput {
  description: string;
  quantity: number;
  unitPrice: number;
  discount?: number;
  taxRate?: number;
  productId?: string;
  serviceId?: string;
  sortOrder?: number;
}

export async function createInvoiceWithItems(
  prisma: PrismaClient,
  data: {
    organizationId: string;
    customerId: string;
    number: string;
    status: InvoiceStatus;
    issueDate: Date;
    dueDate?: Date;
    paidAmount?: number;
    notes?: string;
    items: InvoiceItemInput[];
  },
) {
  let subtotal = new Decimal(0);
  let taxAmount = new Decimal(0);

  const lineItems = data.items.map((item, index) => {
    const quantity = new Decimal(item.quantity);
    const unitPrice = new Decimal(item.unitPrice);
    const discount = new Decimal(item.discount ?? 0);
    const taxRate = new Decimal(item.taxRate ?? 0);
    const base = quantity.mul(unitPrice).minus(discount);
    const tax = base.mul(taxRate).div(100);
    const lineTotal = base.add(tax);
    subtotal = subtotal.add(base);
    taxAmount = taxAmount.add(tax);

    return {
      description: item.description,
      quantity,
      unitPrice,
      discount,
      taxRate,
      lineTotal,
      sortOrder: item.sortOrder ?? index,
      productId: item.productId,
      serviceId: item.serviceId,
    };
  });

  const total = subtotal.add(taxAmount);
  const paidAmount = new Decimal(data.paidAmount ?? 0);

  return prisma.invoice.create({
    data: {
      organizationId: data.organizationId,
      customerId: data.customerId,
      number: data.number,
      status: data.status,
      issueDate: data.issueDate,
      dueDate: data.dueDate,
      subtotal,
      taxAmount,
      total,
      paidAmount,
      notes: data.notes,
      items: { create: lineItems },
    },
    include: { items: true, customer: true },
  });
}

export async function createPayment(
  prisma: PrismaClient,
  data: {
    organizationId: string;
    customerId: string;
    invoiceId?: string;
    amount: number;
    method: Prisma.PaymentCreateInput['method'];
    paidAt: Date;
    reference?: string;
    notes?: string;
  },
) {
  return prisma.payment.create({
    data: {
      organizationId: data.organizationId,
      customerId: data.customerId,
      invoiceId: data.invoiceId,
      amount: data.amount,
      method: data.method,
      status: 'COMPLETED',
      paidAt: data.paidAt,
      reference: data.reference,
      notes: data.notes,
    },
  });
}
