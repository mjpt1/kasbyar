# کسب‌یار (KesbYar)

<p align="center">
  <img src="apps/web/public/landing/logo.svg" alt="لوگوی کسب‌یار" width="72" height="72" />
</p>

<p align="center">
  <strong>سیستم‌عامل کسب‌وکار + هوش مصنوعی برای بازار ایران</strong><br />
  فارسی‌اول · راست‌به‌چپ · تقویم شمسی · چندمستأجری
</p>

<p align="center">
  <a href="https://kasbyar.vercel.app">نسخه آنلاین</a>
  ·
  <a href="https://github.com/mjpt1/kasbyar">مخزن GitHub</a>
  ·
  <a href="https://github.com/mjpt1/kasbyar/wiki">ویکی</a>
  ·
  <strong>v0.2.0</strong>
</p>

---

![پیش‌نمایش لندینگ کسب‌یار](apps/web/public/landing/poster-hero.jpg)

**کسب‌یار** پیشخوان یکپارچه برای تیم‌های کوچک و متوسط است: از اولین تماس مشتری تا فاکتور و وصول — بدون پراکندگی بین اکسل، واتساپ و چند نرم‌افزار جدا.

| | |
|:---|:---|
| ![مشتری و لید](apps/web/public/landing/poster-details.jpg) | ![فاکتور و مالی](apps/web/public/landing/poster-sales.jpg) |
| **مشتری و لید** — حافظه بلندمدت تیم؛ پیگیری تا تبدیل به فروش | **فاکتور و پرداخت** — از صدور تا تسویه با یک نگاه |
| ![نقش‌ها](apps/web/public/landing/poster-team.jpg) | ![بسته‌های صنفی](apps/web/public/landing/poster-packs.jpg) |
| **نقش‌ها** — مالک، مدیر و کارمند؛ هر کس فضای خودش را دارد | **صنف‌ها** — کلینیک، خرده‌فروشی، آژانس روی یک هسته |

---

## قابلیت‌ها

| قابلیت | وضعیت |
|--------|--------|
| لندینگ پوستری + پارالاکس | ✅ |
| CRM (مشتری، لید، وظیفه) | ✅ |
| فاکتور و دریافت پرداخت | ✅ |
| داشبورد و گزارش | ✅ |
| نقش و دسترسی (مالک / مدیر / کارمند) | ✅ |
| پنل سوپرادمین پلتفرم | ✅ |
| بسته‌های عمودی (کلینیک، خرده‌فروشی، سفر) | ✅ |
| دستیار عملیاتی + تأیید اقدام | ✅ |
| طرح اشتراک و محدودیت | ✅ |
| حالت نمایش (دمو) | ✅ |
| اتاق فرمان (بریفینگ / سلامت) | ✅ |
| حافظه شرکت (جستجو معنایی) | ✅ |
| پیش‌بینی درآمد و نقدینگی | ✅ |
| استراتژی و شبیه‌سازی | ✅ |
| جلسات، رشد، دوقلوی دیجیتال | ✅ |
| پلتفرم ایجنت و اتوماسیون | ✅ |
| راهنمای داخل اپ (/help) | ✅ |
| آنبوردینگ حوزه و تخصص | ✅ |
| تخصص عمومی (فریلنسر، شرکت برنامه‌نویسی، …) | ✅ |
| اعلان داخل اپ + Web Push | ✅ |
| درگاه پرداخت آنلاین | 📋 فاز بعد |

---

## ساختار مخزن

```
apps/web             اپ اصلی — Next.js 15 + AI Business OS
apps/ai-service      سرویس AI/LLM — FastAPI (استقرار جدا)
packages/shared      جلالی، فرمت، billing، تایپ‌های AI
packages/agent-sdk   قرارداد ایجنت و ابزارها
packages/ui          اجزای UI مشترک
prisma/              طرح‌واره، migration و seed
docs/                معماری، استقرار، ویکی پشتیبان (docs/wiki)
```

---

## شروع سریع (محلی)

```bash
git clone https://github.com/mjpt1/kasbyar.git
cd kasbyar
cp .env.example .env
npm run setup
npm run dev
```

| سرویس | آدرس |
|--------|------|
| وب و لندینگ | [http://localhost:3000](http://localhost:3000) |
| ورود | [http://localhost:3000/login](http://localhost:3000/login) |
| دستیار (اختیاری) | `npm run dev:ai` → پورت `8000` |


---

## AI Business OS (هوشمند)

کسب‌یار علاوه بر CRM و عملیات، یک **سیستم‌عامل هوشمند** داخل همان اپ دارد. بخش‌ها در سایدبار زیر عنوان **هوشمند** دیده می‌شوند:

| بخش | مسیر | کاربرد |
|------|------|--------|
| اتاق فرمان | /command | بریفینگ روزانه، اولویت‌ها، نمره سلامت |
| دستیار | /conversation | چت عملیاتی با تأیید قبل از اقدام |
| حافظه شرکت | /memory | ingest، جستجوی معنایی، خط زمانی |
| پیش‌بینی | /forecast | درآمد و نقدینگی |
| استراتژی | /strategy | اهداف و اولویت‌های استراتژیک |
| شبیه‌سازی | /simulation | سناریوهای what-if |
| جلسات | /meetings | خلاصه، تصمیمات، اقدامات |
| رشد و بازار | /growth | فرصت‌های رشد |
| دوقلوی دیجیتال | /twin | پروفایل هوشمند مشتری |
| پلتفرم | /platform | Agent SDK و افزونه‌ها |
| اتوماسیون | /automation | قوانین و جریان خودکار |
| راهنما | /help | راهنمای داخل محصول |
| آنبوردینگ | /onboarding | انتخاب حوزه و تخصص (مالک/مدیر) |
| داشبورد تخصص | /v/{specialty} | مثلاً `/v/freelancer`، `/v/software-house` |

نسخه فعلی: **0.2.0** (`package.json` ریشه و `apps/web`).

مستندات کاربری: [ویکی GitHub](https://github.com/mjpt1/kasbyar/wiki) · نسخه پشتیبان در مخزن: [docs/wiki/](./docs/wiki/) · منبع صفحات ویکی: [wiki/](./wiki/)

معماری عمیق‌تر: [docs/architecture/](./docs/architecture/) · یکپارچه‌سازی AI: [docs/AI_INTEGRATION.md](./docs/AI_INTEGRATION.md)

### پیکربندی LLM و دیتابیس

در .env (از روی .env.example):

`env
DATABASE_URL="postgresql://kesbyar:kesbyar@localhost:5432/kesbyar?schema=public"
AI_SERVICE_URL="http://localhost:8000"
AI_SERVICE_TOKEN="internal-dev-token-change-in-production"
LLM_API_URL="https://api.openai.com/v1"
LLM_API_KEY=""
LLM_MODEL="gpt-4o-mini"
`
`
پیشنهاد محلی:
`
``ash
npm run docker:up   # Postgres (+ سرویس‌های compose)
npm run setup
npm run dev:ai      # اختیاری — پورت 8000
npm run dev
`
`
`
### حساب‌های نمونه
`
| ایمیل | رمز | نقش |
|-------|-----|-----|
| `demo@kesbyar.ir` | `demo1234` | مالک / دمو |
| `manager@kesbyar.ir` | `demo1234` | مدیر |
| `staff@kesbyar.ir` | `demo1234` | کارمند |
| `super@kesbyar.ir` | `demo1234` | سوپرادمین |

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
| `npm run db:push` | همگام‌سازی schema |
| `npm run db:seed` | داده نمونه |
| `npm run docker:up` | PostgreSQL محلی + سرویس دستیار |
`
---
`
## استقرار روی Vercel
`
نسخهٔ فعلی: **[kasbyar.vercel.app](https://kasbyar.vercel.app)**
`
1. Import مخزن `mjpt1/kasbyar` از GitHub
2. تنظیمات پروژه:

| فیلد | مقدار |
|------|--------|
| **Root Directory** | `apps/web` |
| **Include files outside root** | ✅ فعال |

3. متغیرهای محیط:

| متغیر | مقدار نمونه |
|--------|-------------|
| `DATABASE_URL` | اتصال Neon / Postgres |
| `SESSION_SECRET` | رشته تصادفی ≥ ۳۲ کاراکتر |
| `NEXT_PUBLIC_APP_URL` | `https://kasbyar.vercel.app` |
| `APP_ENV` | `production` |
| `ALLOW_SEED` | `false` |
`
راهنمای کامل: [docs/DEPLOY_VERCEL.md](./docs/DEPLOY_VERCEL.md)
`
> سرویس FastAPI روی Vercel اجرا نمی‌شود؛ اپ بدون آن هم کار می‌کند. برای دستیار کامل، سرویس را جدا deploy کنید.

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

- [ویکی محصول (GitHub Wiki)](https://github.com/mjpt1/kasbyar/wiki) — راهنمای بخش‌های AI
- [docs/wiki/](./docs/wiki/) — همان محتوا داخل مخزن
- [ARCHITECTURE.md](./docs/ARCHITECTURE.md) — معماری
- [AI_INTEGRATION.md](./docs/AI_INTEGRATION.md) — یکپارچه‌سازی AI/LLM
- [docs/architecture/](./docs/architecture/) — AI CEO، حافظه، ایجنت، workflow
- [ENVIRONMENT.md](./docs/ENVIRONMENT.md) — متغیرهای محیط
- [LOCAL_DEV.md](./docs/LOCAL_DEV.md) — عیب‌یابی محلی
- [OPERATIONS.md](./docs/OPERATIONS.md) — عملیات
- [KNOWN_LIMITATIONS.md](./docs/KNOWN_LIMITATIONS.md) — محدودیت‌های V1
- [V1_LAUNCH.md](./docs/V1_LAUNCH.md) — چک‌لیست لانچ

---

<p align="center">
  <img src="apps/web/public/landing/poster-start.jpg" alt="شروع با کسب‌یار" width="100%" />
</p>

<p align="center"><em>کسب‌یار — سیستم‌عامل کسب‌وکار و هوش مصنوعی شما</em></p>

---

## مجوز

خصوصی — استفاده طبق توافق صاحب مخزن.
