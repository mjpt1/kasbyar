import type { InvoiceStatus } from '@prisma/client';

export interface LineItemInput {
  quantity: number;
  unitPrice: number;
  discount?: number;
  taxRate?: number;
}

export function computeLineItemBase(item: LineItemInput): number {
  return item.quantity * item.unitPrice - (item.discount ?? 0);
}

export function computeLineItemTax(item: LineItemInput): number {
  const base = computeLineItemBase(item);
  return base * ((item.taxRate ?? 0) / 100);
}

export function computeLineItemTotal(item: LineItemInput): number {
  return computeLineItemBase(item) + computeLineItemTax(item);
}

export function computeInvoiceTotals(items: LineItemInput[]) {
  let subtotal = 0;
  let taxAmount = 0;

  for (const item of items) {
    subtotal += computeLineItemBase(item);
    taxAmount += computeLineItemTax(item);
  }

  return { subtotal, taxAmount, total: subtotal + taxAmount };
}

/**
 * تعیین وضعیت فاکتور پس از همگام‌سازی پرداخت‌ها — منطق syncInvoicePaymentStatus
 */
export function resolveInvoicePaymentStatus(params: {
  total: number;
  paidAmount: number;
  dueDate: Date | null | undefined;
  currentStatus: InvoiceStatus;
  now?: Date;
}): { paidAmount: number; status: InvoiceStatus } {
  const { total, paidAmount, dueDate, currentStatus, now = new Date() } = params;

  if (paidAmount >= total) {
    return { paidAmount, status: 'PAID' };
  }

  if (paidAmount > 0) {
    return { paidAmount, status: 'PARTIAL' };
  }

  if (
    dueDate &&
    dueDate < now &&
    (currentStatus === 'SENT' || currentStatus === 'PARTIAL')
  ) {
    return { paidAmount, status: 'OVERDUE' };
  }

  return { paidAmount, status: currentStatus };
}
