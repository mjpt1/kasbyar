import { z } from 'zod';

/** شماره موبایل ایران: 09xxxxxxxxx */
export const iranianMobileSchema = z
  .string()
  .regex(/^09\d{9}$/, 'شماره موبایل باید ۱۱ رقم و با ۰۹ شروع شود')
  .optional()
  .or(z.literal(''));

export function normalizeIranianMobile(value: string): string {
  const digits = value.replace(/\D/g, '');
  if (digits.startsWith('98') && digits.length === 12) {
    return `0${digits.slice(2)}`;
  }
  return digits;
}
