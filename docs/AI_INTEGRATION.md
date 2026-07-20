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

## لایهٔ AI Business OS (فاز ۱+)

```
مرورگر
  → /api/conversation | /api/briefing | /api/memory | /api/health
       → agent-orchestrator / briefing / memory services
            → Prisma (structured data + MemoryChunk vectors)
            → lib/ai/client.ts → FastAPI (LLM, embeddings, document parse)
            ↳ fallback: local-fallback.ts
```

### متغیرهای LLM (ai-service)

| متغیر | توضیح |
|-------|--------|
| `LLM_PROVIDER` | `openai_compatible` (پیش‌فرض) |
| `LLM_API_URL` | آدرس API سازگار با OpenAI |
| `LLM_API_KEY` | کلید API |
| `LLM_MODEL` | مدل chat (مثلاً `gpt-4o-mini`) |
| `EMBEDDING_MODEL` | مدل embedding (مثلاً `text-embedding-3-small`) |

### نقاط پایانی جدید (وب BFF)

| مسیر | کاربرد |
|------|--------|
| `POST /api/memory/ingest` | ingest سند به Business Memory |
| `POST /api/memory/search` | جستجوی معنایی + ساختاریافته |
| `GET /api/memory/timeline` | خط زمانی entity |
| `GET /api/briefing/daily` | خلاصهٔ روزانه AI CEO |
| `GET /api/health/scores` | امتیاز سلامت شرکت |
| `GET /api/command` | اتاق فرمان (briefing + health) |

### نقاط پایانی جدید (FastAPI)

| مسیر | کاربرد |
|------|--------|
| `POST /api/v1/llm/chat` | تکمیل گفتگو با guardrails |
| `POST /api/v1/llm/embed` | تولید embedding |
| `POST /api/v1/documents/parse` | استخراج متن PDF/DOCX/TXT |

### قراردادهای مشترک جدید

- `packages/shared/src/types/memory.ts`
- `packages/shared/src/types/agents.ts`
- `packages/shared/src/types/briefing.ts`

مرجع: [docs/roadmap/ai-business-os.md](./roadmap/ai-business-os.md)
