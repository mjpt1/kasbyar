# یکپارچه‌سازی هوشمند KesbYar

راهنمای ارتباط بین برنامهٔ وب (Next.js) و سرویس هوشمند (FastAPI).

## معماری

```
مرورگر
  → /api/conversation | /api/ai/*
       → intelligence.service (Prisma → snapshot عملیاتی)
            → lib/ai/client.ts
                 → FastAPI :8000/api/v1/*
            ↳ در صورت خطا: پاسخ محلی (graceful degradation)
```

برنامهٔ وب **بدون سرویس AI هم کامل کار می‌کند**؛ فقط بخش خلاصه/دستیار به حالت پشتیبان می‌رود.

## اجرای محلی

```bash
# ترمینال ۱ — پایگاه داده
npm run docker:up

# ترمینال ۲ — وب
cp .env.example .env
npm run db:reseed
npm run dev

# ترمینال ۳ — سرویس هوشمند
cd apps/ai-service
pip install -r requirements.txt
uvicorn app.main:app --reload --port 8000
```

یا: `npm run dev:ai` از ریشهٔ monorepo.

## متغیرهای محیط

| متغیر | محل | توضیح |
|-------|-----|--------|
| `AI_SERVICE_URL` | وب | آدرس FastAPI (پیش‌فرض: `http://localhost:8000`) |
| `AI_SERVICE_TOKEN` | وب + AI | توکن داخلی مشترک |
| `AI_SERVICE_TIMEOUT_MS` | وب | مهلت درخواست (پیش‌فرض: 8000) |
| `AI_SERVICE_RETRIES` | وب | تلاش مجدد روی خطای 5xx (پیش‌فرض: 1) |

در Docker: `AI_SERVICE_URL=http://ai-service:8000` برای کانتینر وب.

## احراز هویت داخلی

درخواست‌های وب به FastAPI شامل هستند:

- `X-Internal-Token: <AI_SERVICE_TOKEN>`
- `Authorization: Bearer <AI_SERVICE_TOKEN>`

## نقاط پایانی FastAPI

| مسیر | کاربرد |
|------|--------|
| `GET /health` | سلامت سرویس |
| `POST /api/v1/summary/operational` | خلاصه عملیات از snapshot |
| `POST /api/v1/assistant/ask` | دستیار با زمینهٔ عملیاتی |
| `POST /api/v1/insights` | سازگاری قدیمی |
| `POST /api/v1/analytics/helper` | کمک‌تحلیل (مطالبات، قیف، وظایف) |
| `POST /api/v1/documents/parse` | قرارداد تحلیل سند (placeholder) |

## نقاط پایانی وب (BFF)

| مسیر | کاربرد |
|------|--------|
| `GET /api/ai/health` | وضعیت سرویس برای UI |
| `GET /api/ai/summary` | خلاصه عملیات (با fallback) |
| `POST /api/conversation` | دستیار عملیاتی |

## قراردادهای مشترک

تعاریف TypeScript در `packages/shared/src/types/ai.ts` — import:

```ts
import type { OperationalContextSnapshot } from '@kesbyar/shared/ai';
```

## کلاینت سمت سرور

```ts
import { askAssistant, fetchOperationalSummary, getAiHealth } from '@/lib/ai';
```

همهٔ فراخوانی‌ها از `lib/ai/client.ts` — بدون `fetch` پراکنده در ماژول‌ها.

## رفتار fallback

1. وب snapshot عملیاتی را از Prisma می‌سازد (`operational-context.ts`)
2. درخواست به FastAPI ارسال می‌شود
3. در صورت timeout/خطا/آفلاین بودن:
   - خلاصه: `buildLocalOperationalSummary`
   - دستیار: `buildLocalAssistantAnswer`
4. UI برچسب «حالت آفلاین» یا پیام پشتیبان نشان می‌دهد

## توسعهٔ آینده

- اتصال LLM در `OrchestrationService`
- تحلیل سند واقعی در `DocumentService`
- روند فروش چندروزه در `AnalyticsService`
- ذخیرهٔ تاریخچه گفتگو (مدل Prisma)
