import type { InvoiceStatus, Prisma } from '@prisma/client';
import { Decimal } from '@prisma/client/runtime/library';

import { ACTIVE_RECORD_FILTER, AUDIT_ACTIONS, AUDIT_ENTITY_TYPES } from '@kesbyar/shared';

import {
  computeInvoiceTotals,
  computeLineItemTotal,
  resolveInvoicePaymentStatus,
} from '@/lib/business/invoice-math';
import { prisma } from '@/lib/prisma';
import { logActivity, logAudit } from '@/server/audit/audit.service';
import {
  requireCustomerInOrg,
  validateInvoiceLineCatalogRefs,
} from '@/server/tenant/tenant-scope';

function recalcInvoiceTotals(items: {
  quantity: Decimal;
  unitPrice: Decimal;
  discount: Decimal;
  taxRate: Decimal;
}[]) {
  const numeric = items.map((item) => ({
    quantity: Number(item.quantity),
    unitPrice: Number(item.unitPrice),
    discount: Number(item.discount),
    taxRate: Number(item.taxRate),
  }));
  const totals = computeInvoiceTotals(numeric);
  return {
    subtotal: new Decimal(totals.subtotal),
    taxAmount: new Decimal(totals.taxAmount),
    total: new Decimal(totals.total),
  };
}

async function nextInvoiceNumber(
  organizationId: string,
  kind: 'PROFORMA' | 'SALE' = 'SALE',
): Promise<string> {
  const year = new Date().getFullYear();
  const prefix = kind === 'PROFORMA' ? 'PRF' : 'INV';
  const count = await prisma.invoice.count({
    where: {
      organizationId,
      number: { startsWith: `${prefix}-${year}-` },
    },
  });
  return `${prefix}-${year}-${String(count + 1).padStart(4, '0')}`;
}

export function buildPartySnapshots(org: {
  name: string;
  taxId: string | null;
  economicCode: string | null;
  companyNationalId: string | null;
  sheba: string | null;
  postalCode: string | null;
  address: string | null;
  phone: string | null;
  province: string | null;
  city: string | null;
}, customer: {
  name: string;
  company: string | null;
  nationalId: string | null;
  economicCode: string | null;
  sheba: string | null;
  postalCode: string | null;
  address: string | null;
  phone: string | null;
  province: string | null;
  city: string | null;
}) {
  return {
    sellerSnapshot: {
      name: org.name,
      taxId: org.taxId,
      economicCode: org.economicCode,
      companyNationalId: org.companyNationalId,
      sheba: org.sheba,
      postalCode: org.postalCode,
      address: org.address,
      phone: org.phone,
      province: org.province,
      city: org.city,
    },
    buyerSnapshot: {
      name: customer.name,
      company: customer.company,
      nationalId: customer.nationalId,
      economicCode: customer.economicCode,
      sheba: customer.sheba,
      postalCode: customer.postalCode,
      address: customer.address,
      phone: customer.phone,
      province: customer.province,
      city: customer.city,
    },
  };
}

export async function listInvoices(
  organizationId: string,
  params: { search?: string; status?: string; page?: number; pageSize?: number },
) {
  const page = params.page ?? 1;
  const pageSize = params.pageSize ?? 20;
  const where: Prisma.InvoiceWhereInput = {
    organizationId,
    ...ACTIVE_RECORD_FILTER,
    ...(params.status
      ? { status: params.status as InvoiceStatus }
      : {}),
    ...(params.search
      ? {
          OR: [
            { number: { contains: params.search, mode: 'insensitive' } },
            { customer: { name: { contains: params.search, mode: 'insensitive' } } },
          ],
        }
      : {}),
  };

  const [items, total] = await Promise.all([
    prisma.invoice.findMany({
      where,
      orderBy: { createdAt: 'desc' },
      skip: (page - 1) * pageSize,
      take: pageSize,
      include: { customer: true },
    }),
    prisma.invoice.count({ where }),
  ]);

  return { items, total, page, pageSize, totalPages: Math.ceil(total / pageSize) };
}

export async function getInvoice(organizationId: string, id: string) {
  return prisma.invoice.findFirst({
    where: { id, organizationId, ...ACTIVE_RECORD_FILTER },
    include: {
      customer: true,
      items: { orderBy: { sortOrder: 'asc' } },
      payments: { orderBy: { paidAt: 'desc' } },
      activities: { orderBy: { createdAt: 'desc' }, take: 10 },
    },
  });
}

export async function createInvoice(
  organizationId: string,
  userId: string,
  data: {
    customerId: string;
    dueDate?: Date;
    notes?: string;
    kind?: 'PROFORMA' | 'SALE';
    items: {
      description: string;
      quantity: number;
      unitPrice: number;
      discount?: number;
      taxRate?: number;
      productId?: string;
      serviceId?: string;
    }[];
  },
) {
  await requireCustomerInOrg(organizationId, data.customerId);
  await validateInvoiceLineCatalogRefs(organizationId, data.items);

  const org = await prisma.organization.findUniqueOrThrow({
    where: { id: organizationId },
  });
  const customer = await prisma.customer.findFirstOrThrow({
    where: { id: data.customerId, organizationId },
  });

  const kind = data.kind ?? 'SALE';
  const defaultVat = Number(org.defaultVatRate ?? 9);
  const number = await nextInvoiceNumber(organizationId, kind);
  const snapshots = buildPartySnapshots(org, customer);

  const lineItems = data.items.map((item, index) => {
    const taxRateValue = item.taxRate ?? defaultVat;
    const quantity = new Decimal(item.quantity);
    const unitPrice = new Decimal(item.unitPrice);
    const discount = new Decimal(item.discount ?? 0);
    const taxRate = new Decimal(taxRateValue);
    const lineTotal = new Decimal(
      computeLineItemTotal({
        quantity: item.quantity,
        unitPrice: item.unitPrice,
        discount: item.discount,
        taxRate: taxRateValue,
      }),
    );

    return {
      description: item.description,
      quantity,
      unitPrice,
      discount,
      taxRate,
      lineTotal,
      sortOrder: index,
      productId: item.productId,
      serviceId: item.serviceId,
    };
  });

  const { subtotal, taxAmount, total } = recalcInvoiceTotals(lineItems);

  const invoice = await prisma.invoice.create({
    data: {
      organizationId,
      customerId: data.customerId,
      number,
      kind,
      dueDate: data.dueDate,
      notes: data.notes,
      subtotal,
      taxAmount,
      total,
      sellerSnapshot: snapshots.sellerSnapshot,
      buyerSnapshot: snapshots.buyerSnapshot,
      items: { create: lineItems },
    },
    include: { customer: true, items: true },
  });

  await logActivity({
    organizationId,
    userId,
    type: 'INVOICE',
    title: 'فاکتور جدید صادر شد',
    description: invoice.number,
    customerId: data.customerId,
    invoiceId: invoice.id,
  });

  return invoice;
}

export async function updateInvoiceStatus(
  organizationId: string,
  id: string,
  status: InvoiceStatus,
  userId?: string,
) {
  const existing = await prisma.invoice.findFirst({
    where: { id, organizationId, ...ACTIVE_RECORD_FILTER },
    select: { id: true, status: true, number: true },
  });
  if (!existing) return { count: 0 };

  const result = await prisma.invoice.updateMany({
    where: { id, organizationId },
    data: { status },
  });

  if (userId && existing.status !== status) {
    await logAudit({
      organizationId,
      userId,
      action: AUDIT_ACTIONS.INVOICE_STATUS,
      entityType: AUDIT_ENTITY_TYPES.INVOICE,
      entityId: id,
      metadata: { from: existing.status, to: status, number: existing.number },
    });
  }

  return result;
}

export async function archiveInvoice(
  organizationId: string,
  id: string,
  userId?: string,
) {
  const existing = await prisma.invoice.findFirst({
    where: { id, organizationId, ...ACTIVE_RECORD_FILTER },
    select: { id: true, number: true, status: true },
  });
  if (!existing) return { count: 0 };
  if (existing.status !== 'DRAFT' && existing.status !== 'CANCELLED') {
    throw new Error('فقط فاکتور پیش‌نویس یا لغوشده قابل بایگانی است');
  }

  await prisma.invoice.update({
    where: { id },
    data: { deletedAt: new Date() },
  });

  if (userId) {
    await logAudit({
      organizationId,
      userId,
      action: AUDIT_ACTIONS.INVOICE_ARCHIVE,
      entityType: AUDIT_ENTITY_TYPES.INVOICE,
      entityId: id,
      metadata: { number: existing.number },
    });
  }

  return { count: 1 };
}

export async function getOverdueInvoices(organizationId: string) {
  const now = new Date();
  return prisma.invoice.findMany({
    where: {
      organizationId,
      ...ACTIVE_RECORD_FILTER,
      status: { in: ['SENT', 'PARTIAL', 'OVERDUE'] },
      dueDate: { lt: now },
    },
    include: { customer: true },
    orderBy: { dueDate: 'asc' },
    take: 20,
  });
}

export async function syncInvoicePaymentStatus(invoiceId: string) {
  const invoice = await prisma.invoice.findUnique({
    where: { id: invoiceId },
    include: { payments: { where: { status: 'COMPLETED' } } },
  });
  if (!invoice) return;

  const paid = invoice.payments.reduce(
    (sum, p) => sum.add(p.amount),
    new Decimal(0),
  );

  const resolved = resolveInvoicePaymentStatus({
    total: Number(invoice.total),
    paidAmount: Number(paid),
    dueDate: invoice.dueDate,
    currentStatus: invoice.status,
  });

  await prisma.invoice.update({
    where: { id: invoiceId },
    data: {
      paidAmount: paid,
      status: resolved.status,
    },
  });
}
