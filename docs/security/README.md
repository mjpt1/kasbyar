# Security Documentation — KesbYar

لایه بازبینی امنیتی عملی — **نه** ادعای گواهینامه (SOC2/ISO). هدف: کاهش ریسک واقعی در auth، tenant، upload، AI، billing، demo، و ops.

---

## فهرست

| سند | کاربرد |
|-----|--------|
| [review-gate.md](./review-gate.md) | دروازه بازبینی برای تغییرات حساس |
| [threat-abuse-paths.md](./threat-abuse-paths.md) | تهدیدها و مسیرهای سوءاستفاده (عملی) |
| [tenant-safety-checklist.md](./tenant-safety-checklist.md) | چک‌لیست جداسازی tenant |
| [assumptions-residual-risks.md](./assumptions-residual-risks.md) | فرض‌ها و ریسک‌های باقی‌مانده |
| [../templates/sensitive-change-review.md](../templates/sensitive-change-review.md) | قالب PR برای تغییر حساس |

**خلاصه V1 (legacy):** [SECURITY_REVIEW.md](../SECURITY_REVIEW.md) — smoke items

---

## چه زمانی این دروازه اجباری است؟

تغییر در هر یک از این حوزه‌ها → [review-gate.md](./review-gate.md) + قالب sensitive-change:

- authentication / session / cookies
- authorization / RBAC / workspace resolution
- imports / file uploads
- invoices / payments / billing plan changes
- assistant / AI context or endpoints
- demo reset / admin tools
- backup / restore / migrate deploy
- feature gating / entitlement enforcement

---

## کد و ADR مرتبط

| حوزه | کد | ADR |
|------|-----|-----|
| Session | `lib/auth/session.ts` | [002](../decisions/002-session-auth.md) |
| Tenant | `server/tenant/tenant-scope.ts` | [003](../decisions/003-tenant-isolation.md) |
| Upload | `server/files/`, `lib/uploads.ts` | [008](../decisions/008-integration-adapters.md) |
| AI | `lib/ai/`, `server/intelligence/` | [005](../decisions/005-ai-service-contract.md), [015](../decisions/015-application-ai-split.md) |
| Billing | `entitlement.service.ts` | [006](../decisions/006-billing-feature-gating.md) |
| Demo | `lib/demo.ts`, `api/demo/*` | [013](../decisions/013-demo-mode-isolation.md) |
| Destructive ops | `scripts/ops/destructive-guard.ts` | [014](../decisions/014-audit-data-safety.md) |
| Env | `lib/env.ts` | [007](../decisions/007-deployment-runtime.md) |

---

## Smoke test سریع (قبل از release)

→ [SECURITY_REVIEW.md](../SECURITY_REVIEW.md#manual-verification-security-smoke)

---

## ارتباط با کیفیت

- PR checklist امنیتی: [quality/review-checklists.md](../quality/review-checklists.md#8-security-sensitive-changes)
- Change impact: [engineering/change-impact-checklist.md](../engineering/change-impact-checklist.md)
