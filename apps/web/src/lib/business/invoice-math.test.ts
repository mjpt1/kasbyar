import { describe, expect, it } from 'vitest';

import {
  computeInvoiceTotals,
  computeLineItemTotal,
  resolveInvoicePaymentStatus,
} from './invoice-math';

describe('computeLineItemTotal', () => {
  it('calculates base without tax', () => {
    expect(
      computeLineItemTotal({ quantity: 2, unitPrice: 1_000_000 }),
    ).toBe(2_000_000);
  });

  it('applies discount and tax', () => {
    expect(
      computeLineItemTotal({
        quantity: 1,
        unitPrice: 10_000_000,
        discount: 500_000,
        taxRate: 10,
      }),
    ).toBe(10_450_000);
  });
});

describe('computeInvoiceTotals', () => {
  it('sums multiple line items', () => {
    const totals = computeInvoiceTotals([
      { quantity: 1, unitPrice: 8_000_000 },
      { quantity: 2, unitPrice: 3_500_000 },
    ]);
    expect(totals.subtotal).toBe(15_000_000);
    expect(totals.taxAmount).toBe(0);
    expect(totals.total).toBe(15_000_000);
  });
});

describe('resolveInvoicePaymentStatus', () => {
  const duePast = new Date('2020-01-01');

  it('marks fully paid invoices as PAID', () => {
    const result = resolveInvoicePaymentStatus({
      total: 10_000_000,
      paidAmount: 10_000_000,
      dueDate: duePast,
      currentStatus: 'SENT',
    });
    expect(result.status).toBe('PAID');
  });

  it('marks partial payment as PARTIAL even when overdue', () => {
    const result = resolveInvoicePaymentStatus({
      total: 10_000_000,
      paidAmount: 3_000_000,
      dueDate: duePast,
      currentStatus: 'SENT',
    });
    expect(result.status).toBe('PARTIAL');
  });

  it('marks unpaid overdue sent invoice as OVERDUE', () => {
    const result = resolveInvoicePaymentStatus({
      total: 10_000_000,
      paidAmount: 0,
      dueDate: duePast,
      currentStatus: 'SENT',
    });
    expect(result.status).toBe('OVERDUE');
  });

  it('preserves DRAFT when unpaid and not due logic applies', () => {
    const result = resolveInvoicePaymentStatus({
      total: 5_000_000,
      paidAmount: 0,
      dueDate: new Date('2099-01-01'),
      currentStatus: 'DRAFT',
    });
    expect(result.status).toBe('DRAFT');
  });
});
