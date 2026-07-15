# Change Impact Checklist

قبل از merge هر تغییر معنی‌دار، این چک‌لیست را پر کنید (در PR description یا یادداشت داخلی).

**Review تخصصی:** پس از impact، checklist نوع تغییر را از [quality/review-checklists.md](../quality/review-checklists.md) اجرا کنید.

---

## A. شناسایی تغییر

| سؤال | پاسخ |
|------|------|
| نوع تغییر | feature / bugfix / refactor / docs / ops |
| فایل‌های اصلی | |
| آیا رفتار کاربر عوض می‌شود؟ | بله / خیر |

---

## B. ماژول‌های متأثر

علامت بزنید هر کدام که relevant است:

- [ ] `apps/web` pages / components
- [ ] `apps/web` API routes
- [ ] `server/*.service.ts`
- [ ] `packages/shared`
- [ ] `prisma/schema.prisma`
- [ ] `prisma/seed`
- [ ] `apps/ai-service`
- [ ] `scripts/` ops
- [ ] `docker/` / `deploy/`
- [ ] CI `.github/workflows`

---

## C. Tenant / Workspace

- [ ] همه queryها `organizationId` دارند
- [ ] FK جدید از `tenant-scope` عبور کرده
- [ ] تست cross-tenant انجام شده (دستی یا خودکار)
- [ ] soft-delete / `ACTIVE_RECORD_FILTER` رعایت شده

**اگر auth/tenant:** → [SECURITY_REVIEW.md](../SECURITY_REVIEW.md) smoke

---

## D. Auth / Session

- [ ] `requireSession` / `requireApiSession` استفاده شده
- [ ] نقش (RBAC) بررسی شده
- [ ] کوکی / SESSION_SECRET مستند نشده در کد

---

## E. Billing / Feature Gating

- [ ] قابلیت جدید نیاز به plan دارد → `plans.ts` + `assertFeature`
- [ ] quota جدید → `usage.service` + `getQuotaLimit`
- [ ] UI قفل → `UpgradePrompt`
- [ ] pack جدید → `registry.ts` + `assertPackEntitlement`

---

## F. AI / Intelligence

- [ ] types در `packages/shared/src/types/ai.ts` به‌روز شده
- [ ] client در `lib/ai/` — نه fetch پراکنده
- [ ] fallback local حفظ شده
- [ ] AI هنوز write مستقیم به DB ندارد
- [ ] `AI_SERVICE_*` env مستند شده

---

## G. Demo / Seed

- [ ] seed scenarioها هم‌خوان هستند
- [ ] `DEMO_MODE` / `ALLOW_SEED` رفتار production خراب نمی‌کند
- [ ] `demo@kesbyar.ir` هنوز login می‌کند (اگر seed عوض شد)

---

## H. UI / UX

- [ ] فارسی و RTL
- [ ] empty / loading / error state
- [ ] بدون layout shift آشکار در dashboard/table

---

## I. Tests / Build

- [ ] `npm run typecheck`
- [ ] `npm test` (یا gap مستند در PR)
- [ ] `npm run build` اگر web عوض شد

---

## J. Docs / Env

- [ ] env جدید → `.env.example` + [ENVIRONMENT.md](../ENVIRONMENT.md)
- [ ] تصمیم معماری → `docs/decisions/`
- [ ] رفتار ops → DATA_SAFETY / DEPLOYMENT در صورت نیاز
- [ ] KNOWN_LIMITATIONS اگر محدودیت جدید

---

## K. ریسک باقی‌مانده

| ریسک | mitigation |
|------|------------|
| | |

---

## سطح اجبار

| سطح تغییر | حداقل بخش‌های الزامی |
|-----------|---------------------|
| فقط copy/UI جزئی | H |
| API/service جدید | B, C, I, J |
| schema/auth/billing | همه بخش‌های مرتبط + SECURITY_REVIEW |
| destructive ops | B, G, J + DATA_SAFETY |

---

## قالب PR (کپی)

```markdown
## Change Impact
- Type: 
- Modules: 
- Tenant-safe: yes/no
- Billing: n/a / updated
- AI contract: n/a / updated
- Tests: 
- Docs/env: 
```
