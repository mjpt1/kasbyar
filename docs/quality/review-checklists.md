# Review Checklists — KesbYar

چک‌لیست‌های بازبینی PR بر اساس نوع تغییر. Reviewer باید بخش‌های **مرتبط** را علامت بزند.

**قالب سریع PR:** [templates/change-review-checklist.md](../templates/change-review-checklist.md)

---

## نحوه استفاده

1. نویسنده PR نوع تغییر را مشخص می‌کند  
2. Reviewer checklist(های) زیر را اجرا می‌کند  
3. موارد fail → comment یا block merge  

---

## 1. Backend / Service Changes

**مسیرهای typical:** `server/**/*.service.ts`, `app/api/**/route.ts`, `lib/business/`, `lib/validators/`

### Correctness
- [ ] منطق business در service یا `lib/business` — نه در component
- [ ] همه queryها `organizationId` دارند
- [ ] FK جدید: `tenant-scope.ts` validate می‌کند
- [ ] soft-delete: `ACTIVE_RECORD_FILTER` رعایت شده
- [ ] خطاها throw/message فارسی مناسب

### API
- [ ] `requireApiSession()` / `requireApiRole()` استفاده شده
- [ ] status code منطقی (404 برای cross-tenant، نه 403 اطلاعات‌دهنده)
- [ ] `handleApiError` — leak stack به client نیست

### Tests
- [ ] تست جدید برای logic غیر trivial — یا دلیل skip در PR
- [ ] `npm run verify` سبز

### Docs
- [ ] `API.md` اگر endpoint عمومی جدید
- [ ] change-impact checklist بخش B/C

### Regressions
- [ ] pagination/search الگوی موجود حفظ شده
- [ ] audit log برای mutations مهم

---

## 2. Frontend / UI Changes

**مسیرها:** `app/(app)/**`, `components/**`

### Persian / RTL
- [ ] متن فارسی طبیعی — نه ترجمهٔ تحت‌اللفظی
- [ ] `dir="rtl"` layout نشکسته
- [ ] LTR برای phone/email/numbers where needed
- [ ] `JalaliDate` / `formatCurrency` استفاده شده

### States
- [ ] loading: skeleton (`loading.tsx`) یا `LoadingState` — [ui-state-consistency-rules.md](../performance/ui-state-consistency-rules.md)
- [ ] empty: `EmptyState` یا `InlineEmpty`
- [ ] error: toast یا `ErrorState`
- [ ] feature-locked: `UpgradePrompt`

### Performance
- [ ] list page RSC — client island only for forms/actions — [frontend-stability-rules.md](../performance/frontend-stability-rules.md)
- [ ] `Promise.all` / no duplicate server fetch
- [ ] new list route has `loading.tsx`

### UX
- [ ] primary action واضح
- [ ] destructive: confirm یا `DestructiveActionButton`
- [ ] mobile: sidebar/table usable
- [ ] بدون layout shift آشکار

### Architecture
- [ ] داده از server component / API — fetch پراکنده در client کمینه
- [ ] business logic در service — نه در JSX

### Tests
- [ ] visual/manual steps در PR
- [ ] `npm run build` اگر ساختار route عوض شد

---

## 3. Schema / Database Changes

**مسیرها:** `prisma/schema.prisma`, `prisma/migrations/`, `prisma/seed/`

### Schema
- [ ] `organizationId` روی entities tenant-scoped
- [ ] indexes برای FK پرکاربرد
- [ ] nullable vs required با backfill plan
- [ ] enum values هم‌خوان با TypeScript/Zod

### Migration
- [ ] strategy documented: push (dev) vs migrate (prod)
- [ ] `MIGRATIONS.md` رعایت شده
- [ ] destructive column drop — rollback plan
- [ ] seed به‌روز و قابل اجرا

### Safety
- [ ] `db:reseed` / reset guards intact
- [ ] production: `CONFIRM_MIGRATE_DEPLOY` documented

### Tests / verify
- [ ] `npm run db:generate` + typecheck
- [ ] seed smoke: `npm run db:seed` در dev

### ADR
- [ ] ADR جدید یا به‌روز اگر model cross-cutting

---

## 4. AI Integration Changes

**مسیرها:** `lib/ai/`, `server/intelligence/`, `apps/ai-service/`, `packages/shared/src/types/ai.ts`

### Contract
- [ ] types در shared به‌روز
- [ ] timeout/retry از config
- [ ] token auth سمت FastAPI
- [ ] versioning path (`/api/v1`) رعایت شده

### Safety
- [ ] AI **نمی‌نویسد** مستقیم به DB
- [ ] context bounded به `organizationId`
- [ ] fallback local هنوز کار می‌کند
- [ ] degraded state به user نشان داده می‌شود

### Gating
- [ ] `assertFeature('aiAssistant')` در API اگر لازم

### Env
- [ ] `AI_SERVICE_*` در ENVIRONMENT.md

### Tests
- [ ] `intelligence.service.test.ts` یا معادل به‌روز
- [ ] manual: AI down → fallback

### Docs
- [ ] `AI_INTEGRATION.md` به‌روز

---

## 5. Billing / Gating Changes

**مسیرها:** `packages/shared/src/billing/`, `server/billing/`, `components/billing/`

### Policy
- [ ] تغییر plan در `plans.ts` — single source
- [ ] server enforcement — نه فقط UI hide
- [ ] quota counting در `usage.service` درست
- [ ] pack entitlement: `assertPackEntitlement`

### UX
- [ ] `UpgradePrompt` با `suggestedPlan` درست
- [ ] پیام فارسی واضح

### Data
- [ ] seed billing scenarios هم‌خوان
- [ ] subscription status edge cases (PAST_DUE, CANCELED)

### Tests
- [ ] `plans.test.ts` / `entitlement.policy.test.ts` به‌روز

### Docs
- [ ] `BILLING.md` + ADR-006 reference

---

## 6. Demo Mode Changes

**مسیرها:** `lib/demo.ts`, `server/demo/`, `components/demo/`, `packages/shared/src/demo/`

### Isolation
- [ ] `DEMO_MODE` server vs `NEXT_PUBLIC_DEMO_MODE` client فهمیده شده
- [ ] production: demo reset مسدود بدون `ALLOW_SEED`
- [ ] demo bypass auth/tenant **ندارد**

### Data
- [ ] scenarios registry هم‌خوان با seed
- [ ] reset idempotent و documented

### UX
- [ ] بنر دمو واضح
- [ ] investor/walkthrough paths کار می‌کنند

### Tests
- [ ] `demo.test.ts` به‌روز

### Docs
- [ ] `DEMO.md` به‌روز

---

## 7. Operational / Deployment Changes

**مسیرها:** `docker/`, `deploy/`, `scripts/`, `.github/workflows/`, `apps/*/Dockerfile`

### Config
- [ ] env examples به‌روز (local/staging/production)
- [ ] secrets not in repo
- [ ] `ENVIRONMENT.md` به‌روز

### Safety
- [ ] destructive scripts guarded
- [ ] backup/restore docs اگر رفتار عوض شد

### CI/CD
- [ ] CI workflow سبز
- [ ] build context درست (monorepo root)

### Verify
- [ ] health scripts (`verify-health.sh`) اگر مسیر عوض شد
- [ ] `DEPLOYMENT.md` / `DEPLOY_VERCEL.md`

### Rollback
- [ ] rollback steps در PR یا ops doc

---

## 8. Security-Sensitive Changes

→ حتماً [security/review-gate.md](../security/review-gate.md) + [templates/sensitive-change-review.md](../templates/sensitive-change-review.md)

### Auth / Session
- [ ] session fixation mitigated
- [ ] cookie flags documented for prod
- [ ] RBAC روی route جدید

### Tenant / IDOR
- [ ] manual cross-org URL test
- [ ] tenant-scope برای FK

### Upload
- [ ] size limit
- [ ] entity ownership
- [ ] path traversal safe

### Secrets
- [ ] no keys in diff
- [ ] `.env` gitignored

### Destructive
- [ ] confirm UI یا env guard
- [ ] audit trail

### Residual risk
- [ ] در PR ثبت شده

---

## Reviewer Decision

| نتیجه | معیار |
|--------|--------|
| **Approve** | همه الزامی‌های نوع تغییر pass |
| **Request changes** | هر مورد critical fail |
| **Comment** | پیشنهاد غیر blocking |

---

## لینک اتوماسیون

- CI: `.github/workflows/ci.yml` — lint, test, build
- Local: `npm run verify`
