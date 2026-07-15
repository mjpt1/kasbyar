# Execution Guardrails — KesbYar

قوانین تکمیل فاز و کیفیت اجرا.

---

## Definition of Done

چهار سطح: **feature → module → phase → release**. جزئیات کامل:

→ **[docs/quality/definition-of-done.md](./quality/definition-of-done.md)**

| سطح | قالب / gate |
|-----|-------------|
| Feature PR | [feature-definition-of-done.md](./templates/feature-definition-of-done.md) + PR template |
| Module | [new-module-checklist](./engineering/templates/new-module-checklist.md) |
| Phase | [phase-review-gate.md](./templates/phase-review-gate.md) |
| Release | [release-readiness.md](./templates/release-readiness.md) |

**تأیید محلی:** `npm run verify` (سریع) · **قبل از release:** `npm run ci`  
**PR حساس:** `npm run test:security`

Review checklists: [docs/quality/review-checklists.md](./quality/review-checklists.md)  
Testing strategy: [docs/testing/testing-strategy.md](./testing/testing-strategy.md)  
Reliability / graceful degradation: [docs/reliability/README.md](./reliability/README.md)

### Product maturity (pilot growth)

| Topic | Doc |
|-------|-----|
| Data retention | [data/data-retention-policy.md](./data/data-retention-policy.md) |
| API versioning | [contracts/api-versioning-policy.md](./contracts/api-versioning-policy.md) |
| Feature flags | [flags/feature-flag-policy.md](./flags/feature-flag-policy.md) |
| Pilot onboarding | [pilot/README.md](./pilot/README.md) |
| Business KPIs | [metrics/business-metrics-foundation.md](./metrics/business-metrics-foundation.md)

### V1 baseline (historical)

| معیار | وضعیت V1 |
|--------|----------|
| build/typecheck سبز | ✅ `npm run typecheck` |
| تست‌های مرتبط سبز یا gap مستند | ✅ 82 tests؛ gaps در KNOWN_LIMITATIONS |
| env vars جدید در ENVIRONMENT.md | ✅ [ENVIRONMENT.md](./ENVIRONMENT.md) |
| docs فاز به‌روز | ✅ docs/ + decisions/ |
| manual verification listed | ✅ per phase در MASTER_EXECUTION |
| limitations مستند | ✅ [KNOWN_LIMITATIONS.md](./KNOWN_LIMITATIONS.md) |

---

## Repository Awareness (توسعه امن)

قبل از هر تغییر بزرگ:

- [repository-audit.md](./docs/repository-audit.md) — ممیزی مخزن
- [engineering/safe-extension-rules.md](./docs/engineering/safe-extension-rules.md) — extend vs rewrite
- [engineering/change-impact-checklist.md](./docs/engineering/change-impact-checklist.md) — قبل از merge

---

## Existing Repository Respect

- ساختار monorepo حفظ شد — rewrite نشد
- الگوی `server/*.service.ts` + API routes ادامه یافت
- `packages/shared` گسترش یافت بدون split اجباری
- تغییرات V1 polish حداقلی و هدفمند

---

## Decision Log

تصمیم‌های معماری و محصول: [decisions/README.md](./decisions/README.md) · فهرست: [decisions/index.md](./decisions/index.md) · قالب: [adr-template.md](./decisions/adr-template.md)

---

## Security Review Gate

قبل از تکمیل فازهای auth/upload/billing/AI/admin:

→ [SECURITY_REVIEW.md](./SECURITY_REVIEW.md) — smoke checklist  
→ [security/review-gate.md](./security/review-gate.md) — دروازه کامل  
→ [templates/sensitive-change-review.md](./templates/sensitive-change-review.md) — قالب PR

---

## Performance & UX Stability

→ [performance/README.md](./performance/README.md) — بودجه، RSC، UI states

| قانون | پیاده‌سازی V1 |
|--------|----------------|
| Server components برای لیست‌ها | ✅ pages اصلی RSC |
| Suspense + skeleton | ✅ loading.tsx، ListPageSkeleton |
| duplicate fetch | ✅ Promise.all + `parallelServerFetch` |
| layout shift داشبورد | ✅ skeleton با ابعاد ثابت |
| UI state components | ✅ `components/shared/*` |
| conventions | ✅ `lib/performance-conventions.ts` |

---

## Integration Boundary

| سرویس | آداپتر |
|--------|--------|
| AI | `lib/ai/client.ts` |
| Billing | `billing/providers/manual.ts` → `@kesbyar/shared/integrations` |
| Storage | `files/storage.adapter.ts` |
| Notifications | `notifications/notification.adapter.ts` |
| Analytics | `lib/analytics/analytics.adapter.ts` |
| SMS/Email | via `NotificationAdapter` (post-V1 vendors) |

→ [integrations/README.md](./integrations/README.md) · [ADR-008](./decisions/008-integration-adapters.md)

---

## Pre-Launch Checklist (خلاصه)

```bash
npm run ci          # lint + typecheck + test + build
npm run db:backup   # قبل از migration prod
```

- [V1_LAUNCH.md](./V1_LAUNCH.md)
- [QA_CHECKLIST.md](./QA_CHECKLIST.md)
- [SECURITY_REVIEW.md](./SECURITY_REVIEW.md) smoke items
