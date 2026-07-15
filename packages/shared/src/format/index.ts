import { DEFAULT_CURRENCY } from '../constants';
import { toPersianDigits } from '../jalali';

export function formatCurrency(
  amount: number | string | bigint,
  currency = DEFAULT_CURRENCY,
  persianDigits = true,
): string {
  const num = typeof amount === 'bigint' ? Number(amount) : Number(amount);
  const formatted = new Intl.NumberFormat('fa-IR', {
    style: 'decimal',
    maximumFractionDigits: 0,
  }).format(num);

  const label = currency === 'IRR' ? 'ریال' : currency;
  const result = `${formatted} ${label}`;
  return persianDigits ? result : result.replace(/[۰-۹]/g, (c) => {
    const idx = '۰۱۲۳۴۵۶۷۸۹'.indexOf(c);
    return idx >= 0 ? String(idx) : c;
  });
}

export function formatNumber(value: number, persianDigits = true): string {
  const formatted = new Intl.NumberFormat('fa-IR').format(value);
  return persianDigits ? formatted : toLatinDigits(formatted);
}

export function toLatinDigits(value: string): string {
  return value.replace(/[۰-۹]/g, (c) => {
    const idx = '۰۱۲۳۴۵۶۷۸۹'.indexOf(c);
    return idx >= 0 ? String(idx) : c;
  });
}

export function formatPhone(phone: string): string {
  const digits = phone.replace(/\D/g, '');
  if (digits.length === 11 && digits.startsWith('09')) {
    return toPersianDigits(
      `${digits.slice(0, 4)} ${digits.slice(4, 7)} ${digits.slice(7)}`,
    );
  }
  return toPersianDigits(phone);
}

export function slugify(text: string): string {
  return text
    .trim()
    .toLowerCase()
    .replace(/[^\w\u0600-\u06FF\s-]/g, '')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-');
}
