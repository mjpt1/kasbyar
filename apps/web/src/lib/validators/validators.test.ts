import { describe, expect, it } from 'vitest';

import {
  customerSchema,
  followUpSchema,
  invoiceSchema,
  loginSchema,
  paymentSchema,
  reminderSchema,
  taskSchema,
} from './index';

describe('loginSchema', () => {
  it('rejects short password', () => {
    const result = loginSchema.safeParse({
      email: 'demo@kesbyar.ir',
      password: '123',
    });
    expect(result.success).toBe(false);
  });

  it('accepts valid credentials shape', () => {
    const result = loginSchema.safeParse({
      email: 'demo@kesbyar.ir',
      password: 'demo1234',
    });
    expect(result.success).toBe(true);
  });
});

describe('customerSchema', () => {
  it('normalizes Iranian mobile', () => {
    const result = customerSchema.safeParse({
      name: 'علی محمدی',
      phone: '+98 912 123 4567',
    });
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.phone).toBe('09121234567');
    }
  });

  it('rejects invalid mobile', () => {
    const result = customerSchema.safeParse({
      name: 'علی محمدی',
      phone: '12345',
    });
    expect(result.success).toBe(false);
  });
});

describe('invoiceSchema', () => {
  it('requires at least one line item', () => {
    const result = invoiceSchema.safeParse({
      customerId: 'cust_1',
      items: [],
    });
    expect(result.success).toBe(false);
  });

  it('rejects non-positive quantity', () => {
    const result = invoiceSchema.safeParse({
      customerId: 'cust_1',
      items: [{ description: 'خدمت', quantity: 0, unitPrice: 1000 }],
    });
    expect(result.success).toBe(false);
  });
});

describe('paymentSchema', () => {
  it('requires positive amount', () => {
    const result = paymentSchema.safeParse({
      customerId: 'c1',
      amount: 0,
      method: 'CASH',
    });
    expect(result.success).toBe(false);
  });
});

describe('followUpSchema', () => {
  it('requires note text', () => {
    const result = followUpSchema.safeParse({ note: 'x' });
    expect(result.success).toBe(false);
  });
});

describe('taskSchema', () => {
  it('requires title', () => {
    const result = taskSchema.safeParse({ title: 'ا' });
    expect(result.success).toBe(false);
  });
});

describe('reminderSchema', () => {
  it('requires remindAt', () => {
    const result = reminderSchema.safeParse({
      title: 'یادآوری',
      remindAt: '',
    });
    expect(result.success).toBe(false);
  });
});
