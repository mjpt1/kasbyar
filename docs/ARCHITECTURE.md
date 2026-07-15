# معماری کسب‌یار

## نمای کلی

کسب‌یار یک monorepo سه‌لایه است:

1. **Presentation** — Next.js App Router، رابط فارسی RTL
2. **Application** — سرویس‌های دامنه در `apps/web/src/server`
3. **Infrastructure** — Prisma/PostgreSQL، FastAPI، Docker

## لایه‌های محصول

### هسته مشترک (Core)

احراز هویت، سازمان، workspace، CRM، فاکتور، پرداخت، وظایف، گزارش، اتوماسیون، فایل، audit.

### بسته‌های صنعتی (Industry Packs)

فیلد `industryPack` روی Organization — **پیاده‌سازی شده:**

| Pack | مسیر | قابلیت‌ها |
|------|------|-----------|
| CLINIC | `clinic/*` | بیماران، نوبت‌ها |
| TRAVEL_AGENCY | `travel/*` | رزروها |
| RETAIL | `retail/*` | محصولات، موجودی |

مرجع: [VERTICAL_PACKS.md](./VERTICAL_PACKS.md)، [architecture/current-state-map.md](./architecture/current-state-map.md)

## جریان داده

```
UI (Server/Client Components)
  → API Routes / Server Services
    → Prisma → PostgreSQL
    → AI Client → FastAPI (insights, documents)
```

## امنیت

- Session مبتنی بر کوکی HttpOnly
- نقش‌های RBAC: OWNER > ADMIN > MANAGER > STAFF > VIEWER
- Audit log برای رویدادهای مهم
- احراز هویت داخلی سرویس AI با token

## بومی‌سازی

- ذخیره تاریخ: Gregorian در DB
- نمایش: Jalali در UI (`@kesbyar/shared`)
- ارز پیش‌فرض: IRR
- منطقه زمانی: Asia/Tehran

## توسعه بعدی

- اینباکس یکپارچه پیام‌رسان
- OCR فاکتور و استخراج سفارش
- اتصال مودیان
- vertical modules per industry pack
