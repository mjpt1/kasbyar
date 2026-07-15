# Repository Audit — KesbYar (کسب‌یار)

**تاریخ ممیزی:** 2026-07  
**وضعیت مخزن:** پیاده‌سازی کامل V1 — **نه greenfield**  
**پوشه محلی:** `BizPilot` — نام محصول/پکیج: `kesbyar` / `@kesbyar/*`

---

## 1. خلاصه اجرایی

مخزن یک monorepo بالغ با مرزهای روشن است. توسعه آینده باید **گسترش** کند، نه بازنویسی. مناطق پرریسک: auth، tenant-scope، schema، entitlement، seed.

---

## 2. ساختار سطح بالا

| مسیر | نقش | مالکیت داده/منطق |
|------|-----|------------------|
| `apps/web` | Next.js 15 — UI + API routes + server services | دامنه اصلی |
| `apps/ai-service` | FastAPI — خلاصه/دستیار/تحلیل | هوش عملیاتی (read-heavy) |
| `packages/shared` | جلالی، billing، packs، demo، ops، audit constants | منطق مشترک بدون I/O |
| `packages/ui` | DataTable | کامپوننت مشترک |
| `packages/config` | tsconfig، eslint، prettier | ابزار |
| `prisma/` | schema + seed | منبع حقیقت دیتابیس |
| `scripts/` | backup، restore، migrate guards | عملیات |
| `docker/`، `deploy/` | استقرار | زیرساخت |
| `docs/` | معماری، ADR، ops | دانش تیم |

**عمداً وجود ندارد:** `packages/core`، `packages/types` جدا — منطق در `shared` متمرکز است.

---

## 3. مرز اپلیکیشن‌ها

### Web (`apps/web`)

```
src/app/           → صفحات و API (App Router)
src/components/    → UI (layout، ui، shared، features، billing، demo)
src/server/        → سرویس‌های دامنه (*.service.ts)
src/lib/           → auth، validators، business pure logic، ai client
src/config/        → navigation
```

- **32 صفحه** در `(app)/` + auth + workspace
- **43 API route** تحت `app/api/`
- الگوی API: `requireApiSession()` → `organizationId` → service → `jsonResponse`

### AI Service (`apps/ai-service`)

- قرارداد HTTP + `AI_SERVICE_TOKEN`
- بدون دسترسی مستقیم به business write
- types مشترک: `packages/shared/src/types/ai.ts`

---

## 4. الگوهای حیاتی (حفظ شوند)

| حوزه | الگو | مسیر مرجع |
|------|------|-----------|
| Session | کوکی HttpOnly + org cookie | `lib/auth/session.ts` |
| Tenant | `organizationId` اولین آرگومان service | `server/*/*.service.ts` |
| FK safety | `tenant-scope.ts` | `server/tenant/tenant-scope.ts` |
| Billing | `assertFeature` / `assertQuota` در API | `server/billing/entitlement.service.ts` |
| Packs | `require-pack-page` / `require-api-pack` | `server/packs/` |
| Pure logic | بدون Prisma | `lib/business/` |
| State UI | EmptyState، skeleton، LoadingState | `components/shared/` |
| Destructive ops | env guards | `packages/shared/src/ops/destructive.ts` |

---

## 5. موجودیت‌های Prisma

**34 model** در `prisma/schema.prisma` — گروه‌ها: auth/tenant، CRM، commerce، ops، clinic، travel، retail، billing.

**Migration:** پوشه `prisma/migrations/` فعلاً بدون SQL commit — dev از `db:push` استفاده می‌کند. قبل از production-scale باید baseline migration تکمیل شود.

**Seed:** `prisma/seed/scenarios/` — 4 سازمان دمو به‌هم‌پیوند شده. **بازنویسی خطرناک.**

---

## 6. تست‌ها

- **Vitest** در root — 18 فایل، 82 تست
- قوی: `lib/business`، validators، permissions، tenant-scope، shared packages
- ضعیف: اکثر `*.service.ts` بدون تست؛ بدون e2e؛ بدون تست Python برای ai-service

→ جزئیات: [TESTING.md](./TESTING.md)

---

## 7. استقرار و env

- Local: Docker Postgres + `npm run dev`
- CI: `.github/workflows/ci.yml`
- Vercel: `apps/web/vercel.json` — monorepo build
- Env مرجع: [ENVIRONMENT.md](./ENVIRONMENT.md)

---

## 8. کیفیت مستندات

| قوت | ضعف |
|-----|-----|
| 16 ADR در `docs/decisions/` | [index.md](./decisions/index.md) |
| GUARDRAILS، SECURITY_REVIEW | نام پوشه `BizPilot` vs `kesbyar` |
| DEPLOY، DATA_SAFETY، DEMO | |

---

## 9. نقشه قوت / ناسازگاری / خطر

### قوی — حفظ کنید

- لایه‌بندی UI → API/service → Prisma/AI
- `organizationId`-first در همه سرویس‌ها
- Plan catalog و pack registry در `@kesbyar/shared`
- Adapter pattern برای billing، storage، AI client
- مستندات ops و destructive guards
- فارسی/RTL + Jalali در shared

### ناسازگار — بعداً استاندارد کنید

- migration history خالی
- پوشش تست service layer
- `lib/ai-client.ts` deprecated هنوز موجود
- آپلود local filesystem (Vercel نیاز adapter cloud)
- docker-compose: web کامنت شده

### خطرناک برای rewrite — ممنوع بدون ADR + migration plan

| ماژول | دلیل |
|--------|------|
| `prisma/schema.prisma` | 34 model، FK cross-pack |
| `lib/auth/*` + `middleware.ts` | امنیت session |
| `tenant-scope.ts` | IDOR prevention |
| `entitlement.service.ts` + `billing/plans.ts` | gating سراسری |
| `prisma/seed/scenarios/*` | دمو و QA وابسته |
| `require-pack-page.ts` / `require-api-pack.ts` | مرز vertical |

---

## 10. استانداردسازی قبل از scale

1. Prisma migration baseline در git
2. تست integration برای ۳–۵ flow بحرانی (login، invoice، payment)
3. یکپارچه‌سازی ARCHITECTURE.md با وضعیت واقعی packs
4. Notification adapter (SMS/email) قبل از اتوماسیون پیام
5. Storage adapter cloud برای production Vercel

---

## 11. مستندات مرتبط

| سند | محتوا |
|-----|--------|
| [architecture/current-state-map.md](./architecture/current-state-map.md) | نقشه جریان و ماژول |
| [engineering/conventions.md](./engineering/conventions.md) | قراردادهای نام‌گذاری |
| [engineering/safe-extension-rules.md](./engineering/safe-extension-rules.md) | قوانین توسعه امن |
| [engineering/change-impact-checklist.md](./engineering/change-impact-checklist.md) | چک‌لیست تأثیر تغییر |
| [engineering/phase-entry-checklist.md](./engineering/phase-entry-checklist.md) | ورود به فاز جدید |
| [decisions/](./decisions/) | ADRها + [index](./decisions/index.md) |

---

## 12. تأیید دستی پس از ممیزی

- [ ] `npm run ci` سبز
- [ ] مسیر auth → dashboard → customer → invoice قابل اجرا
- [ ] `.cursor/` در `.gitignore` و push نمی‌شود
- [ ] `.env` commit نشده
