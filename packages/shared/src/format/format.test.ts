import { describe, expect, it } from 'vitest';

import {
  formatCurrency,
  formatCurrencyWithOptionalToman,
  formatNumber,
  formatPhone,
  rialToToman,
  slugify,
  toLatinDigits,
} from './index';
import { toPersianDigits } from '../jalali';

describe('formatCurrency', () => {
  it('formats IRR with Persian digits by default', () => {
    const result = formatCurrency(1_500_000);
    expect(result).toContain('ریال');
    expect(result).toMatch(/[۰-۹]/);
  });

  it('can output Latin digits', () => {
    const result = formatCurrency(1000, 'IRR', false);
    expect(result).toMatch(/\d/);
    expect(result).not.toMatch(/[۰-۹]/);
  });

  it('optionally shows toman alongside rial', () => {
    expect(rialToToman(10_000)).toBe(1_000);
    const withToman = formatCurrencyWithOptionalToman(10_000, {
      showToman: true,
      persianDigits: false,
    });
    expect(withToman).toContain('ریال');
    expect(withToman).toContain('تومان');
  });
});

describe('formatNumber', () => {
  it('formats integers', () => {
    const result = formatNumber(12345, false);
    expect(result.replace(/\D/g, '')).toBe('12345');
  });
});

describe('toLatinDigits', () => {
  it('converts Persian digits to Latin', () => {
    expect(toLatinDigits(toPersianDigits('1403'))).toBe('1403');
  });
});

describe('formatPhone', () => {
  it('formats Iranian mobile numbers', () => {
    const formatted = formatPhone('09121234567');
    expect(formatted).toContain('۰۹۱۲');
  });
});

describe('slugify', () => {
  it('slugifies Persian text', () => {
    expect(slugify('شرکت  تدبیر')).toBe('شرکت-تدبیر');
  });

  it('lowercases Latin segments', () => {
    expect(slugify('Demo Shop')).toBe('demo-shop');
  });
});
