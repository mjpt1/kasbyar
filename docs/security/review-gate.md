# Security Review Gate — KesbYar

دروازه بازبینی **عملی** قبل از merge تغییرات حساس. این سند جایگزین گواهینامه رسمی نیست — چک‌لیست اجباری برای مهندس و reviewer است.

**قالب PR:** [templates/sensitive-change-review.md](../templates/sensitive-change-review.md)  
**Tenant detail:** [tenant-safety-checklist.md](./tenant-safety-checklist.md)

---

## 1. فعال‌سازی دروازه

اگر PR هر یک از این موارد را لمس می‌کند → دروازه **الزامی**:

| حوزه | مسیرهای نمونه |
|------|----------------|
| Authentication | `lib/auth/`, `api/auth/*`, `middleware.ts` |
| Authorization | `lib/permissions.ts`, `requireApiRole` |
| Workspace resolution | `workspace.service`, `api/workspace/*`, `kesbyar_org` cookie |
| Uploads / imports | `api/files/*`, `file.service`, import parsers |
| Invoices / payments | `invoice.service`, `payment.service`, `api/invoices/*`, `api/payments/*` |
| Assistant actions | `api/conversation`, `api/ai/*`, `intelligence.service`, `apps/ai-service` |
| Demo / admin tools | `api/demo/*`, `demo-reset.service`, settings admin |
| Backup / restore / migrate | `scripts/db-*`, `prisma/migrations` |
| Feature gating | `entitlement.service`, `plans.ts`, `api/billing/*` |

---

## 2. هشت سؤال اجباری (هر تغییر حساس)

Reviewer باید برای هر endpoint یا flow جدید/تغییریافته پاسخ دهد:

### 2.1 Who can trigger?

- [ ] آیا `requireApiSession()` (یا معادل server page guard) وجود دارد؟
- [ ] حداقل نقش (`requireApiRole`) درست است؟
- [ ] آیا feature/plan gate (`assertFeature`, `assertPackEntitlement`) لازم بود؟
- [ ] آیا demo-only endpoints با `canShowDemoControls` / `canResetDemoData` محافظت شده‌اند؟

### 2.2 What data can be read?

- [ ] همه queryها `organizationId` از session دارند؟
- [ ] لیست‌ها paginated و bounded هستند؟
- [ ] audit/export فقط برای نقش مجاز؟
- [ ] AI context فقط از همان org ساخته می‌شود؟

### 2.3 What data can be modified?

- [ ] FKهای ورودی با `tenant-scope` validate شده‌اند؟
- [ ] cross-tenant ID → 404 (نه 403 افشاگرانه)؟
- [ ] AI **نمی‌نویسد** مستقیم به DB؟
- [ ] تغییر plan فقط با `canManageBilling`؟

### 2.4 Tenant ownership enforcement

→ [tenant-safety-checklist.md](./tenant-safety-checklist.md) کامل

- [ ] create/update/delete همه scoped
- [ ] joins فیلتر org دارند
- [ ] فایل storage در مسیر org

### 2.5 What can be abused?

→ [threat-abuse-paths.md](./threat-abuse-paths.md)

- [ ] rate limit / size limit در نظر گرفته شده؟
- [ ] self-upgrade بدون پرداخت مسدود یا پذیرفته و مستند؟
- [ ] prompt injection → فقط context bounded؟
- [ ] destructive script در prod مسدود؟

### 2.6 How are events logged?

- [ ] mutations حساس → `logAudit` با action مناسب؟
- [ ] metadata بدون secret (`sanitizeAuditMetadata`)؟
- [ ] login/logout/plan change/demo reset audit می‌شوند؟

### 2.7 How do failures degrade safely?

- [ ] خطا به client: پیام فارسی عمومی؛ stack leak نیست (`handleApiError`)
- [ ] AI down → fallback local؛ app usable
- [ ] upload fail → no partial orphan در DB بدون فایل (یا documented)
- [ ] health endpoint secret افشا نمی‌کند

### 2.8 Secrets and config

- [ ] env جدید در `ENVIRONMENT.md` + `.env.example`؟
- [ ] `SESSION_SECRET` / `AI_SERVICE_TOKEN` در production الزامی؟
- [ ] `ALLOW_SEED=false` در prod checklist؟
- [ ] هیچ secret در diff نیست؟

---

## 3. ماتریس حوزه → کنترل‌های کلیدی

| حوزه | کنترل اجباری | تست دستی |
|------|--------------|----------|
| Auth | httpOnly session؛ bcrypt؛ org membership | login/logout؛ session expiry |
| Tenant | `organizationId` + tenant-scope | URL ID org دیگر → 404 |
| Upload | size limit؛ MIME allowlist؛ org path؛ entity ownership | فایل بزرگ؛ entity دیگر org |
| AI | token به FastAPI؛ entitlement؛ no DB write | AI بدون token؛ plan FREE |
| Billing | server `assertFeature`؛ OWNER/ADMIN for plan | staff change plan → 403 |
| Demo | DEMO_MODE + ALLOW_SEED + ADMIN for reset | prod reset blocked |
| Destructive ops | destructive-guard env flags | reseed without ALLOW_SEED |
| Audit | ADMIN+ for `/api/audit` | staff → 403 |

---

## 4. تصمیم reviewer

| نتیجه | شرط |
|--------|-----|
| **Approve** | همه سؤالات 2.1–2.8 برای scope PR پاسخ مثبت یا N/A مستند |
| **Request changes** | هر مورد critical بدون mitigation |
| **Approve with residual risk** | mitigation جزئی + ثبت در [assumptions-residual-risks.md](./assumptions-residual-risks.md) یا PR |

---

## 5. ادغام با CI

CI فعلی: lint، typecheck، test، build — **جایگزین** بازبینی انسانی نیست.

محلی:

```bash
npm run verify
npm test -- tenant-scope audit
```

---

## 6. مستندات مرتبط

- [DATA_SAFETY.md](../DATA_SAFETY.md)
- [ENVIRONMENT.md](../ENVIRONMENT.md)
- [decisions/014-audit-data-safety.md](../decisions/014-audit-data-safety.md)
- [quality/review-checklists.md](../quality/review-checklists.md)
