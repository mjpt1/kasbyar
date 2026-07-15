# داده‌های نمونه KesbYar (Seed)

راهنمای seed برای توسعه محلی، QA و دموهای داخلی.

## پیش‌نیاز

1. PostgreSQL در حال اجرا (Docker یا محلی)
2. فایل `.env` با `DATABASE_URL` معتبر

```bash
cp .env.example .env
npm run docker:up    # اختیاری — PostgreSQL با Docker
npm run db:push      # اعمال schema
```

## اجرای seed

```bash
npm run db:seed
```

یا reset کامل (اگر migration دارید):

```bash
npm run db:reset     # migrate reset + seed خودکار
```

برای push + seed مجدد بدون migration:

```bash
npm run db:reseed
```

## حساب‌های دمو

| ایمیل | نقش | دسترسی |
|-------|-----|--------|
| `demo@kesbyar.ir` | مالک | همه سازمان‌های دمو |
| `manager@kesbyar.ir` | مدیر | `demo-general` |
| `staff@kesbyar.ir` | کارمند | `demo-general` |

**رمز عبور همه:** `demo1234`

## سازمان‌های seed شده

| Slug | نام | نوع |
|------|-----|-----|
| `demo-general` | شرکت خدمات تدبیر کسب‌وکار | GENERAL — داده کامل |
| `demo-retail` | فروشگاه پوشاک آرتین | RETAIL |
| `demo-clinic` | کلینیک دندانپزشکی سپهر | CLINIC |
| `demo-travel` | آژانس مسافرتی آسمان آبی | TRAVEL_AGENCY |

سازمان `demo-shop` (seed قدیمی) هنگام reseed پاک می‌شود.

## پوشش داده

### demo-general (اصلی)

- ۸ مشتری با برچسب و مخاطب
- ۶ لید در وضعیت‌های مختلف (جدید، پیگیری، پیشنهاد، موفق، ناموفق، واجد شرایط)
- ۴ پیگیری لید
- ۳ محصول + ۳ خدمت
- ۶ فاکتور: پیش‌نویس، ارسال‌شده، جزئی، پرداخت‌شده، معوق
- ۴ پرداخت (شامل پرداخت امروز)
- ۵ وظیفه (امروز، معوق، انجام‌شده)
- ۳ یادآور
- ۲ یادداشت
- ۳ قانون اتوماسیون
- ۲ فایل متادیتا
- ۸+ رویداد فعالیت

### عمودی‌ها

داده سبک‌تر برای اعتبارسنجی `IndustryPack` و تعویض سازمان.

## معماری

```
prisma/
├── seed.ts                 # نقطه ورود Prisma
└── seed/
    ├── index.ts            # orchestrator
    ├── constants.ts        # ایمیل‌ها، slugها، مراحل قیف
    ├── types.ts
    ├── utils.ts            # تاریخ، فاکتور، پرداخت، پاک‌سازی
    ├── users.ts
    └── scenarios/
        ├── general.ts      # سناریوی کامل
        └── verticals.ts    # retail / clinic / travel
```

## افزودن سناریوی جدید

1. slug را به `DEMO_ORG_SLUGS` در `constants.ts` اضافه کنید
2. ماژول جدید در `prisma/seed/scenarios/` بسازید
3. در `seed/index.ts` فراخوانی کنید
4. از `createInvoiceWithItems` و `createPayment` برای یکپارچگی مالی استفاده کنید

## نکات

- Seed فقط برای محیط توسعه است؛ رمزها ثابت و ضعیف هستند
- `clearDemoData()` قبل از seed، سازمان‌های دمو و کاربران دمو را حذف می‌کند
- فایل‌های پیوست فقط متادیتا دارند؛ مسیر `storagePath` placeholder است
- تاریخ‌ها نسبی به «امروز» محاسبه می‌شوند تا داشبورد همیشه معنادار باشد
