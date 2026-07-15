# محیط نمایش و دمو (Demo / GTM)

راهنمای اجرای دموهای فروش، سرمایه‌گذار و آزمایش داخلی برای **کسب‌یار**.

## فعال‌سازی

در `.env` (یا `deploy/env/local.env.example`):

```env
DEMO_MODE=true
NEXT_PUBLIC_DEMO_MODE=true
ALLOW_SEED=true
```

| متغیر | نقش |
|--------|-----|
| `DEMO_MODE` | سمت سرور — API دمو، بازنشانی، وضعیت سناریو |
| `NEXT_PUBLIC_DEMO_MODE` | سمت کلاینت — بنر، نوار ابزار، ورود سریع |
| `ALLOW_SEED` | مجوز `db:reseed` و بازنشانی دمو |

### ایمنی production

- در `APP_ENV=production`، `DEMO_MODE` **بدون** `ALLOW_SEED=true` فعال نمی‌شود.
- بازنشانی دمو نیاز به `DEMO_MODE` + `ALLOW_SEED` + نقش **ADMIN** دارد.
- کنترل‌های دمو در production عمداً محدود هستند.

## راه‌اندازی سریع

```bash
cp deploy/env/local.env.example .env
npm run db:reseed
npm run dev
```

ورود: `http://localhost:3000/login` — دکمه‌های **ورود سریع دمو** یا `demo@kesbyar.ir` / `demo1234`.

## سناریوها

| شناسه | سازمان (slug) | بسته | طرح نمونه |
|--------|----------------|------|-----------|
| `general` | `demo-general` | هسته مشترک | حرفه‌ای |
| `clinic` | `demo-clinic` | کلینیک | حرفه‌ای (آزمایشی) |
| `travel` | `demo-travel` | مسافرتی | رایگان (نمایش ارتقا) |
| `retail` | `demo-retail` | خرده‌فروشی | استارتر |

تعریف سناریوها: `packages/shared/src/demo/scenarios.ts`

## شخصیت‌های دمو

| ایمیل | نقش | دسترسی |
|--------|-----|--------|
| `demo@kesbyar.ir` | مالک | هر ۴ سازمان |
| `manager@kesbyar.ir` | مدیر | فقط `demo-general` |
| `staff@kesbyar.ir` | کارمند | فقط `demo-general` |

رمز همه: `demo1234`

## مسیرهای UI

| مسیر | کاربرد |
|------|--------|
| `/demo` | مرکز نمایش — انتخاب سناریو، راهنمای فروش، بازنشانی |
| `/demo/investor` | نمای سرمایه‌گذار — عرض پلتفرم و بسته‌های عمودی |
| `/workspace/select` | سوئیچ سریع بین سناریوها (در حالت دمو) |
| `/dashboard` | راهنمای گام‌به‌گام سناریوی فعال |

بنر زرد «محیط نمایش» در بالای اپ وقتی `NEXT_PUBLIC_DEMO_MODE=true` است.

## ترتیب پیشنهادی — فروش

1. **هسته مشترک** (`demo-general`) — داشبورد، مطالبات، لیدها، دستیار
2. **کلینیک** — نوبت‌ها و بیماران روی همان هسته مالی
3. **مسافرتی** — رزروها + نمایش قفل طرح رایگان و مسیر ارتقا (`/pricing`)
4. **خرده‌فروشی** — موجودی و کمبود کالا

جزئیات در `/demo` و `SALES_WALKTHROUGH_INTRO` در `packages/shared/src/demo/walkthroughs.ts`.

## ترتیب پیشنهادی — سرمایه‌گذار

1. عرض افقی هسته (`general`)
2. عمق عمودی خرده‌فروشی (`retail`) — استراتژی pack
3. کلینیک (`clinic`) — تخصص صنعتی
4. مسافرتی (`travel`) — monetization / freemium

صفحه: `/demo/investor`

## بازنشانی دمو

اگر داده‌ها در طول دمو خراب شد:

1. از UI: **بازنشانی دمو** در بنر یا `/demo` (نیاز به OWNER/ADMIN)
2. از CLI: `npm run db:reseed` (با `ALLOW_SEED=true`)

بازنشانی کل دیتابیس seed را از نو اجرا می‌کند — فقط در local/staging.

## API (فقط در حالت دمو)

| متد | مسیر | توضیح |
|-----|------|--------|
| GET | `/api/demo/scenarios` | لیست سناریوها و شخصیت‌ها |
| GET | `/api/demo/status` | وضعیت workspace فعال |
| POST | `/api/demo/switch` | تعویض سازمان بر اساس `scenarioId` |
| POST | `/api/demo/reset` | reseed کامل (محافظت‌شده) |

## معماری

```
packages/shared/src/demo/     رجیستری سناریو، شخصیت، walkthrough
apps/web/src/lib/demo.ts      گیتینگ محیط
apps/web/src/server/demo/     سرویس وضعیت و بازنشانی
apps/web/src/components/demo/ UI بنر، راهنما، ورود سریع
Organization.isDemo           برچسب workspace دمو در DB
```

دمو روی **محصول واقعی** سوار است — seed داده، نه پروتوتایپ استاتیک.

## staging / فروش

برای محیط فروش در staging می‌توانید `DEMO_MODE=true` و `ALLOW_SEED=true` تنظیم کنید. در production واقعی معمولاً هر دو فلگ خاموش می‌مانند.

**ADR:** [decisions/013-demo-mode-isolation.md](./decisions/013-demo-mode-isolation.md)
