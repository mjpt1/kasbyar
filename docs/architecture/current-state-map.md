# Current State Map — KesbYar Architecture

نقشه وضعیت فعلی برای تصمیم‌گیری توسعه — نه طرح آینده.

---

## 1. نمای سیستم

```
┌─────────────────────────────────────────────────────────────────┐
│                         Browser (RTL / fa)                       │
└───────────────────────────────┬─────────────────────────────────┘
                                │
┌───────────────────────────────▼─────────────────────────────────┐
│  apps/web — Next.js 15                                             │
│  ┌─────────────┐  ┌──────────────┐  ┌──────────────────────────┐ │
│  │ RSC Pages   │  │ Client islands│  │ API Routes (43)          │ │
│  │ (app)/      │  │ forms, demo   │  │ requireApiSession        │ │
│  └──────┬──────┘  └──────┬───────┘  └────────────┬─────────────┘ │
│         │                │                       │               │
│         └────────────────┼───────────────────────┘               │
│                          ▼                                         │
│              server/*.service.ts (domain layer)                      │
│              lib/business/* (pure)  lib/validators/*               │
└──────────────────────────┬───────────────────────┬─────────────────┘
                           │                       │
              ┌────────────▼────────────┐   ┌──────▼──────────────┐
              │  Prisma → PostgreSQL     │   │  lib/ai/client     │
              │  prisma/schema.prisma    │   │  (HTTP + token)    │
              └─────────────────────────┘   └──────────┬──────────┘
                                                       │
                                            ┌──────────▼──────────┐
                                            │ apps/ai-service      │
                                            │ FastAPI /api/v1      │
                                            └─────────────────────┘

┌─────────────────────────────────────────────────────────────────┐
│  packages/shared — plans, packs, jalali, format, demo, ops       │
│  packages/ui — DataTable                                         │
└─────────────────────────────────────────────────────────────────┘
```

---

## 2. لایه‌های محصول (mental model)

| لایه | پیاده‌سازی فعلی |
|------|------------------|
| Business Data Core | Prisma models + `server/*.service.ts` |
| Conversation Layer | `conversation/` page + `conversation-panel` + API |
| Agent Layer | `intelligence.service.ts` + FastAPI services |
| Automation Engine | `automation.service.ts` + rules در DB |
| Integration Layer | adapters: `lib/ai/`, `billing/providers/`, `storage.adapter.ts` |

---

## 3. هسته مشترک vs بسته عمودی

```
                    ┌──────────────────┐
                    │   Organization   │
                    │  industryPack    │
                    └────────┬─────────┘
                             │
         ┌───────────────────┼───────────────────┐
         ▼                   ▼                   ▼
   CORE (همیشه)        PACK: CLINIC      PACK: TRAVEL / RETAIL
   customers           clinic/*           travel/*, retail/*
   leads               patients           bookings, inventory
   invoices            appointments
   payments
   tasks
   dashboard
   conversation
   reports
   settings/billing
```

**ناوبری:** `config/navigation.ts` → `getPackNavItems(industryPack)` از `@kesbyar/shared`

**محافظ صفحه:** `requirePackPage()`  
**محافظ API:** `requireApiPack()`

---

## 4. جریان احراز هویت و tenant

```
POST /api/auth/login
  → auth.service.login
  → Set kesbyar_session cookie
  → workspace list

GET /workspace/select (optional)
  → Set kesbyar_org cookie

Every (app) page:
  → requireSession()
  → SessionContext { organizationId, role, industryPack, ... }

Every API:
  → requireApiSession()
  → pass organizationId to service

Every service query:
  → WHERE organizationId = ...
  → ACTIVE_RECORD_FILTER where applicable
  → tenant-scope FK checks on create/update
```

---

## 5. جریان billing / gating

```
Subscription (DB)
  → entitlement.service.getEntitlementContext
  → plans.ts (shared) canAccessFeature / getQuotaLimit
  → assertFeature('aiAssistant') in API
  → UpgradePrompt in UI
```

---

## 6. نقشه پوشه‌های web (مرجع سریع)

| مسیر | تعداد تقریبی | نقش |
|------|--------------|-----|
| `app/(app)/*` | 32 pages | صفحات محصول |
| `app/api/*` | 43 routes | REST داخلی |
| `components/features/*` | per domain | فرم/جدول دامنه |
| `components/shared/*` | — | state patterns |
| `server/customers/` | service | CRM |
| `server/invoices/` | service | فاکتور |
| `server/billing/` | 4 files | entitlement |
| `server/packs/` | clinic/travel/retail | vertical |
| `server/tenant/` | scope helpers | امنیت FK |

---

## 7. قرارداد AI (خلاصه)

| جهت | مسیر |
|-----|------|
| Types | `packages/shared/src/types/ai.ts` |
| Client | `apps/web/src/lib/ai/client.ts` |
| Context builder | `server/intelligence/operational-context.ts` |
| Orchestration | `server/intelligence/intelligence.service.ts` |
| Fallback | `server/intelligence/local-fallback.ts` |
| FastAPI | `apps/ai-service/app/api/` |

**قانون:** AI فقط read/summarize — بدون write مستقیم به DB.

→ ADR-005

---

## 8. وابستگی import (bounded)

```
apps/web  →  @kesbyar/shared, @kesbyar/ui, @prisma/client
packages/ui  →  (minimal — tanstack, utils)
packages/shared  →  (no app imports)
apps/ai-service  →  (standalone Python; types mirrored in shared)
```

**ممنوع:** `packages/shared` import از `apps/web`  
**ممنوع:** business logic سنگین داخل `components/features` بدون service

---

## 9. استقرار runtime

| محیط | Web | DB | AI |
|------|-----|-----|-----|
| Local | `npm run dev` | Docker Postgres | `npm run dev:ai` |
| Vercel | `apps/web` root | External Postgres | جدا (Railway/Render) |
| Staging | Docker compose staging | Container | Container |

---

## 10. به‌روزرسانی این نقشه

هنگام تغییرات ساختاری (route جدید pack، API جدید، model جدید):
1. این فایل را به‌روز کنید
2. ADR در صورت تصمیم معماری
3. [repository-audit.md](../repository-audit.md) بخش risk را بررسی کنید
