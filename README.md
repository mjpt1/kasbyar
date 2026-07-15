# کسب‌یار (KesbYar)

سیستم‌عامل کسب‌وکار برای بازار ایران — فارسی‌اول، راست‌به‌چپ، تقویم شمسی، چند‌مستاجری (workspace).

**مخزن:** [github.com/mjpt1/kasbyar](https://github.com/mjpt1/kasbyar)

---

## معرفی

کسب‌یار به تیم‌های کوچک و متوسط کمک می‌کند مشتری، لید، فاکتور، پرداخت و گزارش‌های روزانه را در یک محیط یکپارچه مدیریت کنند. بسته‌های عمودی (کلینیک، خرده‌فروشی، آژانس مسافرتی) روی هستهٔ مشترک CRM و صورتحساب سوار می‌شوند.

| قابلیت | وضعیت |
|--------|--------|
| CRM (مشتری، لید، وظیفه) | ✅ |
| فاکتور و دریافت | ✅ |
| داشبورد و گزارش | ✅ |
| دستیار عملیاتی | ✅ (با سرویس جدا — حالت آفلاین در قطعی) |
| طرح اشتراک و محدودیت | ✅ |
| حالت نمایش (دمو) | ✅ |
| درگاه پرداخت آنلاین | 📋 فاز بعد |

---

## ساختار مخزن

```
apps/web          اپ اصلی — Next.js 15
apps/ai-service   سرویس دستیار — FastAPI (استقرار جدا)
packages/shared   جلالی، فرمت، billing، observability
packages/ui       اجزای UI مشترک
prisma/           طرحواره و seed
docs/             معماری، عملیات، پایلوت
```

---

## شروع سریع (توسعه محلی)

```bash
git clone https://github.com/mjpt1/kasbyar.git
cd kasbyar
cp .env.example .env
npm run setup
npm run dev
```

- اپ: [http://localhost:3000](http://localhost:3000)
- سرویس دستیار (اختیاری): `npm run dev:ai` → پورت ۸۰۰۰

### حساب‌های نمونه

| ایمیل | رمز |
|-------|-----|
| `demo@kesbyar.ir` | `demo1234` |
| `manager@kesbyar.ir` | `demo1234` |
| `staff@kesbyar.ir` | `demo1234` |

جزئیات seed: [docs/SEED.md](./docs/SEED.md)

### حالت نمایش

```bash
# در .env:
DEMO_MODE=true
NEXT_PUBLIC_DEMO_MODE=true
npm run db:reseed
```

مرکز نمایش: `/demo` — [docs/DEMO.md](./docs/DEMO.md)

---

## دستورات پرکاربرد

| دستور | کار |
|-------|-----|
| `npm run dev` | اجرای وب |
| `npm run build` | build تولید |
| `npm run verify` | lint + typecheck + test |
| `npm run ci` | verify + build (مثل CI) |
| `npm run db:migrate` | migration توسعه |
| `npm run db:seed` | داده نمونه |
| `npm run db:backup` | پشتیبان SQL |
| `npm run docker:up` | PostgreSQL محلی + سرویس دستیار |

---

## استقرار

### Vercel (اپ وب)

1. Import از GitHub → مخزن `mjpt1/kasbyar`
2. **Root Directory:** `apps/web`
3. **Include files outside root:** فعال
4. متغیرهای الزامی: `DATABASE_URL`, `SESSION_SECRET`, `NEXT_PUBLIC_APP_URL`, `APP_ENV=production`, `ALLOW_SEED=false`

راهنمای کامل: [docs/DEPLOY_VERCEL.md](./docs/DEPLOY_VERCEL.md)

> سرویس FastAPI روی Vercel اجرا نمی‌شود؛ اپ بدون آن هم کار می‌کند (خلاصه محلی). برای دستیار کامل، سرویس را جدا deploy کنید.

### Docker / VPS

[docs/DEPLOYMENT.md](./docs/DEPLOYMENT.md)

---

## کیفیت و عملیات

| موضوع | سند |
|--------|-----|
| Definition of Done | [docs/quality/](./docs/quality/) |
| امنیت و tenant | [docs/security/](./docs/security/) |
| تخریب تدریجی | [docs/reliability/](./docs/reliability/) |
| یکپارچه‌سازی خارجی | [docs/integrations/](./docs/integrations/) |
| پایلوت مشتری | [docs/pilot/](./docs/pilot/) |
| KPI و متریک | [docs/metrics/](./docs/metrics/) |
| نگهداری داده | [docs/data/data-retention-policy.md](./docs/data/data-retention-policy.md) |
| تصمیم‌های معماری (ADR) | [docs/decisions/](./docs/decisions/) |

---

## مستندات اصلی

- [ARCHITECTURE.md](./docs/ARCHITECTURE.md) — معماری
- [ENVIRONMENT.md](./docs/ENVIRONMENT.md) — متغیرهای محیط
- [LOCAL_DEV.md](./docs/LOCAL_DEV.md) — عیب‌یابی محلی
- [OPERATIONS.md](./docs/OPERATIONS.md) — عملیات
- [KNOWN_LIMITATIONS.md](./docs/KNOWN_LIMITATIONS.md) — محدودیت‌های V1
- [V1_LAUNCH.md](./docs/V1_LAUNCH.md) — چک‌لیست لانچ

---

## مجوز

خصوصی — استفاده طبق توافق صاحب مخزن.
