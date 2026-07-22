import { z } from 'zod';

/** تبدیل ارقام فارسی/عربی به لاتین */
export function toLatinDigits(value: string): string {
  return value
    .replace(/[۰-۹]/g, (c) => String('۰۱۲۳۴۵۶۷۸۹'.indexOf(c)))
    .replace(/[٠-٩]/g, (c) => String('٠١٢٣٤٥٦٧٨٩'.indexOf(c)));
}

/** شماره موبایل ایران: 09xxxxxxxxx */
export const iranianMobileSchema = z
  .string()
  .regex(/^09\d{9}$/, 'شماره موبایل باید ۱۱ رقم و با ۰۹ شروع شود')
  .optional()
  .or(z.literal(''));

export function normalizeIranianMobile(value: string): string {
  const digits = toLatinDigits(value).replace(/\D/g, '');
  if (digits.startsWith('98') && digits.length === 12) {
    return `0${digits.slice(2)}`;
  }
  if (digits.startsWith('9') && digits.length === 10) {
    return `0${digits}`;
  }
  return digits;
}

export function isValidIranianMobile(value: string): boolean {
  return /^09\d{9}$/.test(normalizeIranianMobile(value));
}

/** نرمال‌سازی کد ملی / شناسه — فقط ارقام لاتین */
export function normalizeNationalId(value: string): string {
  return toLatinDigits(value).replace(/\D/g, '');
}

/**
 * اعتبارسنجی کد ملی ۱۰ رقمی ایران (الگوریتم رقم کنترل).
 * اعداد تکراری مثل ۰۰۰۰۰۰۰۰۰۰ رد می‌شوند.
 */
export function isValidNationalId(value: string): boolean {
  const id = normalizeNationalId(value);
  if (!/^\d{10}$/.test(id)) return false;
  if (/^(\d)\1{9}$/.test(id)) return false;

  const check = Number(id[9]);
  const sum = id
    .slice(0, 9)
    .split('')
    .reduce((acc, digit, i) => acc + Number(digit) * (10 - i), 0);
  const remainder = sum % 11;
  return remainder < 2 ? check === remainder : check === 11 - remainder;
}

/** شناسه ملی حقوقی ۱۱ رقمی (رقم کنترل استاندارد سازمان ثبت) */
export function isValidLegalNationalId(value: string): boolean {
  const id = normalizeNationalId(value);
  if (!/^\d{11}$/.test(id)) return false;
  if (/^(\d)\1{10}$/.test(id)) return false;

  const coefficients = [29, 27, 23, 19, 17, 29, 27, 23, 19, 17];
  const check = Number(id[10]);
  const sum = id
    .slice(0, 10)
    .split('')
    .reduce((acc, digit, i) => acc + (Number(digit) + coefficients[i]!) * coefficients[i]!, 0);
  // الگوریتم رایج شناسه ملی حقوقی: (sum % 11) % 10
  return check === (sum % 11) % 10;
}

export function normalizeSheba(value: string): string {
  const cleaned = toLatinDigits(value).replace(/[\s-]/g, '').toUpperCase();
  if (/^\d{24}$/.test(cleaned)) return `IR${cleaned}`;
  return cleaned;
}

/** شبا ایران: IR + ۲۴ رقم با MOD-97 */
export function isValidSheba(value: string): boolean {
  const sheba = normalizeSheba(value);
  if (!/^IR\d{24}$/.test(sheba)) return false;

  const rearranged = `${sheba.slice(4)}${sheba.slice(0, 4)}`;
  const numeric = rearranged.replace(/[A-Z]/g, (ch) => String(ch.charCodeAt(0) - 55));

  let remainder = 0;
  for (const ch of numeric) {
    remainder = (remainder * 10 + Number(ch)) % 97;
  }
  return remainder === 1;
}

export function normalizePostalCode(value: string): string {
  return toLatinDigits(value).replace(/\D/g, '');
}

/** کد پستی ۱۰ رقمی ایران */
export function isValidPostalCode(value: string): boolean {
  const code = normalizePostalCode(value);
  return /^\d{10}$/.test(code) && !/^(\d)\1{9}$/.test(code);
}

/** کد اقتصادی — معمولاً ۱۲ رقم (نرم‌تر برای سازگاری) */
export function normalizeEconomicCode(value: string): string {
  return toLatinDigits(value).replace(/\D/g, '');
}

export function isValidEconomicCode(value: string): boolean {
  const code = normalizeEconomicCode(value);
  return /^\d{10,14}$/.test(code);
}

const emptyToUndef = (v: string | undefined) => (v === '' || v === undefined ? undefined : v);

export const optionalNationalIdSchema = z
  .string()
  .optional()
  .transform(emptyToUndef)
  .refine((v) => v === undefined || isValidNationalId(v), {
    message: 'کد ملی نامعتبر است',
  });

export const optionalLegalOrNationalIdSchema = z
  .string()
  .optional()
  .transform((v) => (v ? normalizeNationalId(v) : emptyToUndef(v)))
  .refine(
    (v) =>
      v === undefined ||
      v === '' ||
      isValidNationalId(v) ||
      isValidLegalNationalId(v),
    { message: 'کد/شناسه ملی نامعتبر است' },
  );

export const optionalShebaSchema = z
  .string()
  .optional()
  .transform((v) => (v ? normalizeSheba(v) : emptyToUndef(v)))
  .refine((v) => v === undefined || v === '' || isValidSheba(v), {
    message: 'شماره شبا نامعتبر است (IR + ۲۴ رقم)',
  });

export const optionalPostalCodeSchema = z
  .string()
  .optional()
  .transform((v) => (v ? normalizePostalCode(v) : emptyToUndef(v)))
  .refine((v) => v === undefined || v === '' || isValidPostalCode(v), {
    message: 'کد پستی باید ۱۰ رقم باشد',
  });

export const optionalEconomicCodeSchema = z
  .string()
  .optional()
  .transform((v) => (v ? normalizeEconomicCode(v) : emptyToUndef(v)))
  .refine((v) => v === undefined || v === '' || isValidEconomicCode(v), {
    message: 'کد اقتصادی نامعتبر است',
  });
