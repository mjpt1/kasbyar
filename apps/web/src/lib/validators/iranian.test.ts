import { describe, expect, it } from 'vitest';

import {
  isValidEconomicCode,
  isValidNationalId,
  isValidPostalCode,
  isValidSheba,
  normalizeIranianMobile,
  normalizeSheba,
} from './iranian';
import { assessMoadianReadiness, buildMoadianPayload } from '@/server/moadian/moadian.service';

describe('iranian validators', () => {
  it('normalizes mobile from +98', () => {
    expect(normalizeIranianMobile('+98 912 123 4567')).toBe('09121234567');
  });

  it('validates national id checksum', () => {
    expect(isValidNationalId('0079028748')).toBe(true);
    expect(isValidNationalId('0000000000')).toBe(false);
    expect(isValidNationalId('123')).toBe(false);
  });

  it('validates sheba with MOD-97', () => {
    expect(isValidSheba('IR062960000000100324200001')).toBe(true);
    expect(isValidSheba('062960000000100324200001')).toBe(true);
    expect(normalizeSheba('062960000000100324200001')).toBe('IR062960000000100324200001');
    expect(isValidSheba('IR062960000000100324200009')).toBe(false);
  });

  it('validates postal and economic codes', () => {
    expect(isValidPostalCode('1234567890')).toBe(true);
    expect(isValidPostalCode('1111111111')).toBe(false);
    expect(isValidEconomicCode('123456789012')).toBe(true);
  });
});

describe('moadian readiness', () => {
  const org = {
    name: 'شرکت نمونه',
    taxId: '12345678901',
    economicCode: '123456789012',
    companyNationalId: '10100314565',
    sheba: 'IR062960000000100324200001',
    postalCode: '1234567890',
    address: 'تهران',
    taxMemoryId: 'A1B2C3D4E5',
  };

  const customer = {
    name: 'علی',
    nationalId: '0079028748',
    economicCode: null,
    sheba: null,
    postalCode: '1234567890',
    address: 'تهران',
    company: null,
  };

  it('marks incomplete when tax memory missing', () => {
    const result = assessMoadianReadiness({
      organization: { ...org, taxMemoryId: null },
      customer,
      invoice: {
        kind: 'SALE',
        status: 'SENT',
        total: 110000,
        taxAmount: 10000,
        items: [
          {
            description: 'خدمت',
            quantity: 1,
            unitPrice: 100000,
            taxRate: 10,
            lineTotal: 110000,
            discount: 0,
          },
        ],
      },
    });
    expect(result.ready).toBe(false);
    expect(result.items.find((i) => i.id === 'tax_memory')?.ok).toBe(false);
  });

  it('builds payload with line VAT math', () => {
    const payload = buildMoadianPayload({
      organization: org,
      customer,
      invoice: {
        id: 'inv1',
        number: 'INV-2026-0001',
        issueDate: new Date('2026-07-22T10:00:00Z'),
        items: [
          {
            description: 'کالا',
            quantity: 2,
            unitPrice: 100000,
            discount: 0,
            taxRate: 9,
            lineTotal: 218000,
          },
        ],
      },
    });
    expect(payload.body[0]?.prdis).toBe(200000);
    expect(payload.body[0]?.vam).toBe(18000);
    expect(payload.body[0]?.tsstam).toBe(218000);
    expect(payload.header.tins).toBeTruthy();
  });

  it('rejects proforma for moadian', () => {
    const result = assessMoadianReadiness({
      organization: org,
      customer,
      invoice: {
        kind: 'PROFORMA',
        status: 'DRAFT',
        total: 1000,
        taxAmount: 0,
        items: [
          {
            description: 'x',
            quantity: 1,
            unitPrice: 1000,
            taxRate: 0,
            lineTotal: 1000,
            discount: 0,
          },
        ],
      },
    });
    expect(result.items.find((i) => i.id === 'invoice_kind')?.ok).toBe(false);
  });
});
