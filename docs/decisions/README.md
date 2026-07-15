# Architecture Decision Records (ADR)

ثبت تصمیم‌های مهندسی و محصولی مهم KesbYar — سبک، قابل مرور، و قابل استناد در PR و فازها.

**فهرست کامل:** [index.md](./index.md)  
**قالب:** [adr-template.md](./adr-template.md)

---

## ساختار پوشه

```
docs/decisions/
├── README.md           ← این سند (راهنما)
├── index.md            ← فهرست همه ADRها با دامنه و وضعیت
├── adr-template.md     ← قالب کپی برای ADR جدید
└── NNN-short-slug.md   ← هر تصمیم (مثلاً 011-persian-rtl-first.md)
```

---

## نام‌گذاری فایل

| قانون | مثال |
|--------|------|
| شماره سه‌رقمی متوالی | `011`, `012`, … |
| slug کوتاه kebab-case | `persian-rtl-first` |
| نام فایل | `011-persian-rtl-first.md` |
| عنوان سند | `# ADR-011: Persian-First Product Stance` |

**نکته:** فرمت `ADR-0001-...` فقط نام نمایشی است؛ نام فایل canonical در این مخزن `NNN-slug.md` است (بدون padding) تا لینک‌های موجود نشکند.

**شماره بعدی:** `017` — همیشه از آخرین ADR در [index.md](./index.md) یکی بیشتر.

---

## وضعیت (Status)

| Status | معنی | اقدام |
|--------|------|--------|
| **Proposed** | پیشنهاد — در حال بحث | merge نکنید تا Accepted شود |
| **Accepted** | تصمیم جاری تیم | کد و docs باید هم‌راستا باشند |
| **Deprecated** | دیگر توصیه نمی‌شود | در index علامت بزنید؛ جایگزین ممکن است نباشد |
| **Superseded** | جایگزین شده | فیلد `Superseded by: ADR-NNN` + لینک به ADR جدید |

تغییر تصمیم Accepted → **ADR جدید** بنویسید؛ ADR قدیمی را `Superseded` کنید (تاریخچه حفظ شود).

---

## چه زمانی ADR لازم است؟

### حتماً ADR بنویسید

- تغییر **auth/session**، مدل کوکی، یا RBAC
- تغییر **tenant isolation** (scope، middleware، cross-org)
- تغییر **schema** cross-cutting یا سیاست migration
- قرارداد **AI**، endpoint، یا مرز write از AI
- مدل **pricing/gating** یا plan catalog
- **monorepo boundary** (app/package جدید، split)
- **vertical pack** registry یا entitlement pack
- **demo mode** که رفتار auth/tenant/production را لمس کند
- **deploy/runtime** (env حقیقت، health، seed در prod)
- **backup/audit/destructive ops** — سیاست جدید یا حذف guard
- تصمیم **محصولی** که معماری را قفل می‌کند (مثلاً فارسی‌اول، تک-pack per org)

### معمولاً ADR لازم نیست

- باگ‌فیکس بدون تغییر قرارداد
- UI polish در چارچوب ADR موجود
- تست یا doc typo
- refactor داخلی بدون تغییر رفتار observable

### مرز خاکستری

اگر در PR این سؤال‌ها بله است → ADR:

- آیا contributor بعدی بدون ADR مسیر اشتباه می‌رود؟
- آیا rollback یا migration plan لازم است؟
- آیا امنیت یا tenant leak ریسک دارد؟

---

## فرآیند

1. شماره بعدی از [index.md](./index.md)
2. کپی [adr-template.md](./adr-template.md) → `NNN-slug.md`
3. Status: `Proposed` → review → `Accepted`
4. PR: لینک ADR در description
5. به‌روزرسانی [index.md](./index.md)
6. اگر تصمیم جایگزین شد: ADR قدیمی `Superseded` + ADR جدید

---

## فهرست خلاصه

| ADR | عنوان | Status |
|-----|--------|--------|
| [001](./001-monorepo-structure.md) | Monorepo structure | Accepted |
| [002](./002-session-auth.md) | Session auth | Accepted |
| [003](./003-tenant-isolation.md) | Tenant isolation | Accepted |
| [004](./004-database-prisma.md) | PostgreSQL + Prisma | Accepted |
| [005](./005-ai-service-contract.md) | AI service contract | Accepted |
| [006](./006-billing-feature-gating.md) | Billing + gating | Accepted |
| [007](./007-deployment-runtime.md) | Deployment runtime | Accepted |
| [008](./008-integration-adapters.md) | Integration adapters | Accepted |
| [009](./009-repository-awareness.md) | Repository awareness | Accepted |
| [010](./010-quality-enforcement.md) | Quality enforcement | Accepted |
| [011](./011-persian-rtl-first.md) | Persian-first / RTL-first | Accepted |
| [012](./012-vertical-pack-extension.md) | Vertical pack model | Accepted |
| [013](./013-demo-mode-isolation.md) | Demo mode isolation | Accepted |
| [014](./014-audit-data-safety.md) | Audit + data safety | Accepted |
| [015](./015-application-ai-split.md) | Next.js + FastAPI split | Accepted |
| [016](./016-prisma-migration-policy.md) | Prisma migration policy | Accepted |

جزئیات دامنه و کد: [index.md](./index.md)

---

## ارتباط با کیفیت

- Phase DoD: ADR برای تصمیم major — [quality/definition-of-done.md](../quality/definition-of-done.md)
- Change impact: [engineering/change-impact-checklist.md](../engineering/change-impact-checklist.md)
- Safe extension: [engineering/safe-extension-rules.md](../engineering/safe-extension-rules.md)
