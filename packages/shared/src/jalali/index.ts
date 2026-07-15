import jalaali from 'jalaali-js';

import {
  JALALI_MONTH_NAMES,
  JALALI_WEEKDAY_NAMES,
  PERSIAN_DIGITS,
} from '../constants';

export interface JalaliDateParts {
  year: number;
  month: number;
  day: number;
}

export function toPersianDigits(value: string | number): string {
  return String(value).replace(/\d/g, (d) => PERSIAN_DIGITS[Number(d)] ?? d);
}

export function toGregorian(parts: JalaliDateParts): Date {
  const { gy, gm, gd } = jalaali.toGregorian(parts.year, parts.month, parts.day);
  return new Date(gy, gm - 1, gd);
}

export function toJalali(date: Date | string): JalaliDateParts {
  const d = typeof date === 'string' ? new Date(date) : date;
  const { jy, jm, jd } = jalaali.toJalaali(
    d.getFullYear(),
    d.getMonth() + 1,
    d.getDate(),
  );
  return { year: jy, month: jm, day: jd };
}

export function formatJalali(
  date: Date | string,
  options: {
    persianDigits?: boolean;
    long?: boolean;
    includeWeekday?: boolean;
  } = {},
): string {
  const { persianDigits = true, long = false, includeWeekday = false } = options;
  const d = typeof date === 'string' ? new Date(date) : date;
  const { year, month, day } = toJalali(d);

  const monthName = JALALI_MONTH_NAMES[month - 1];
  let formatted: string;

  if (long && monthName) {
    formatted = `${day} ${monthName} ${year}`;
  } else {
    const mm = String(month).padStart(2, '0');
    const dd = String(day).padStart(2, '0');
    formatted = `${year}/${mm}/${dd}`;
  }

  if (includeWeekday) {
    const jsDay = d.getDay();
    const weekdayIndex = (jsDay + 1) % 7;
    const weekday = JALALI_WEEKDAY_NAMES[weekdayIndex];
    formatted = `${weekday} ${formatted}`;
  }

  return persianDigits ? toPersianDigits(formatted) : formatted;
}

export function formatJalaliDateTime(
  date: Date | string,
  persianDigits = true,
): string {
  const d = typeof date === 'string' ? new Date(date) : date;
  const datePart = formatJalali(d, { persianDigits });
  const hours = String(d.getHours()).padStart(2, '0');
  const minutes = String(d.getMinutes()).padStart(2, '0');
  const time = `${hours}:${minutes}`;
  return persianDigits ? `${datePart} ${toPersianDigits(time)}` : `${datePart} ${time}`;
}

export function jalaliToday(): JalaliDateParts {
  return toJalali(new Date());
}

export function isValidJalaliDate(year: number, month: number, day: number): boolean {
  return jalaali.isValidJalaaliDate(year, month, day);
}

export function startOfJalaliDay(date: Date): Date {
  const result = new Date(date);
  result.setHours(0, 0, 0, 0);
  return result;
}

export function endOfJalaliDay(date: Date): Date {
  const result = new Date(date);
  result.setHours(23, 59, 59, 999);
  return result;
}

export function parseJalaliDateString(value: string): Date | null {
  const normalized = value.replace(/[۰-۹]/g, (c) =>
    String(PERSIAN_DIGITS.indexOf(c as (typeof PERSIAN_DIGITS)[number])),
  );
  const match = normalized.match(/^(\d{4})\/(\d{1,2})\/(\d{1,2})$/);
  if (!match) return null;
  const year = Number(match[1]);
  const month = Number(match[2]);
  const day = Number(match[3]);
  if (!isValidJalaliDate(year, month, day)) return null;
  return toGregorian({ year, month, day });
}
