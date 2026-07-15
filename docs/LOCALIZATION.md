# Localization — کسب‌یار

## فارسی‌اول

تمام UI، پیام‌های خطا، empty state و navigation به فارسی نوشته شده‌اند.

## RTL

- `html[dir=rtl]` در root layout
- جداول، فرم‌ها و sidebar RTL-native
- نمودار Recharts با `dir=ltr` برای محور عددی (استاندارد)

## Jalali

پکیج `@kesbyar/shared`:

- `formatJalali(date)` — نمایش شمسی
- `formatJalaliDateTime(date)` — تاریخ + ساعت
- `parseJalaliDateString(value)` — پارس ورودی
- `toJalali` / `toGregorian` — تبدیل لایه

**قانون:** تاریخ در DB به Gregorian؛ نمایش در UI به شمسی.

## فرمت

- `formatCurrency(amount)` — ریال با ارقام فارسی
- `formatNumber(value)` — اعداد فارسی
- `formatPhone(phone)` — موبایل ایران

## اصطلاحات ثابت

برچسب وضعیت‌ها در `packages/shared/src/constants/index.ts`

## یکپارچه‌سازی‌های آینده

- درگاه پرداخت ایرانی (زرین‌پال و ...)
- SMS ایرانی
- مودیان مالیاتی
- پیام‌رسان‌های محلی

Hook: `Organization.extension` JSON و `IntegrationConfig` در schema
