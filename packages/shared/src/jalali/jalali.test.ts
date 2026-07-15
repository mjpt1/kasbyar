import { describe, expect, it } from 'vitest';

import {
  formatJalali,
  formatJalaliDateTime,
  isValidJalaliDate,
  parseJalaliDateString,
  toGregorian,
  toJalali,
  toPersianDigits,
} from './index';

describe('toPersianDigits', () => {
  it('converts all digits', () => {
    expect(toPersianDigits('1403/07/15')).toBe('۱۴۰۳/۰۷/۱۵');
  });
});

describe('toJalali / toGregorian', () => {
  it('round-trips a known date', () => {
    const gregorian = new Date(2024, 2, 20); // 2024-03-20
    const jalali = toJalali(gregorian);
    expect(jalali.year).toBe(1403);
    expect(jalali.month).toBe(1);
    expect(jalali.day).toBe(1);

    const back = toGregorian(jalali);
    expect(back.getFullYear()).toBe(2024);
    expect(back.getMonth()).toBe(2);
    expect(back.getDate()).toBe(20);
  });
});

describe('formatJalali', () => {
  it('formats short date with Persian digits', () => {
    const result = formatJalali(new Date(2024, 2, 20));
    expect(result).toMatch(/۱۴۰۳\/۰۱\/۰۱/);
  });

  it('formats long date with month name', () => {
    const result = formatJalali(new Date(2024, 2, 20), { long: true });
    expect(result).toContain('فروردین');
  });
});

describe('formatJalaliDateTime', () => {
  it('includes time portion', () => {
    const d = new Date(2024, 2, 20, 14, 30);
    const result = formatJalaliDateTime(d);
    expect(result).toContain('۱۴:۳۰');
  });
});

describe('isValidJalaliDate', () => {
  it('rejects invalid month', () => {
    expect(isValidJalaliDate(1403, 13, 1)).toBe(false);
  });

  it('accepts valid date', () => {
    expect(isValidJalaliDate(1403, 1, 1)).toBe(true);
  });
});

describe('parseJalaliDateString', () => {
  it('parses Persian digit input', () => {
    const parsed = parseJalaliDateString('۱۴۰۳/۰۱/۰۱');
    expect(parsed).not.toBeNull();
    expect(parsed!.getFullYear()).toBe(2024);
  });

  it('returns null for invalid format', () => {
    expect(parseJalaliDateString('not-a-date')).toBeNull();
  });
});
