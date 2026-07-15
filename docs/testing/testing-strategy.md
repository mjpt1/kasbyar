# Testing Strategy — KesbYar

راهبرد عملی و risk-based برای monorepo. هدف: حداکثر اطمینان با حداقل اتلاف — نه پوشش ۱۰۰٪ برای نمایش.

---

## 1. لایه‌های تست

| لایه | تعریف | ابزار فعلی | کی اجرا شود |
|------|--------|------------|-------------|
| **Unit** | توابع خالص، policy، validator — بدون DB/HTTP | Vitest | هر PR؛ `npm test` |
| **Contract** | شکل API/types مشترک، ساختار پاسخ AI، plan catalog | Vitest + shared types | تغییر `packages/shared` یا AI contract |
| **Integration** | service + Prisma یا API route با DB واقعی/mock | *planned* | فاز بعد؛ تا آن‌وقت manual staging |
| **E2E** | مرورگر: login → flow کامل | Playwright *planned* | pre-pilot؛ فعلاً manual QA |
| **Manual QA** | RTL، UX states، cross-org دستی | چک‌لیست | قبل از پایلوت / فاز major |
| **Release verification** | smoke staging + prod پس از deploy | چک‌لیست | هر cut |
| **Security verification** | IDOR، demo reset، upload abuse | `npm run test:security` + manual | PR حساس + release |

---

## 2. فلسفه پوشش (Coverage Philosophy)

### حتماً automated (unit یا contract)

| حوزه | چرا | مثال فایل |
|------|-----|-----------|
| محاسبات مالی | regression گران | `invoice-math.test.ts` |
| entitlement / plan | bypass = revenue leak | `plans.test.ts`, `entitlement.policy.test.ts` |
| tenant FK validation | IDOR | `tenant-scope.test.ts` |
| validators Zod | bad data در DB | `validators.test.ts` |
| permissions matrix | RBAC | `permissions.test.ts` |
| destructive env guards | prod wipe | `destructive.test.ts` |
| upload security helpers | path/MIME | `uploads.test.ts` |
| audit sanitize | secret leak | `audit.service.test.ts` |
| jalali/format | product core | `jalali.test.ts`, `format.test.ts` |
| pack registry | nav drift | `registry.test.ts` |
| demo scenarios | seed mismatch | `scenarios.test.ts` |

### ترجیح integration به جای unit زیاد

- CRUD سرویس‌های Prisma-heavy (`customer.service`) — یک integration test per resource بهتر از ۱۰ mock unit
- API routes — یک happy-path + یک 404 cross-tenant در integration
- dashboard aggregations — integration با seed data

**V1 gap:** integration layer هنوز کامل نیست — در PR gap را مستند کنید.

### manual QA کافی است (فعلاً)

| حوزه | دلیل |
|------|------|
| RTL layout دقیق | visual؛ automated snapshot later |
| mobile drawer / navigation feel | UX |
| toast copy tone | linguistic |
| chart rendering | visual |
| investor demo walkthrough | narrative |
| full billing UX without gateway | manual provider |

### staging verification لازم

- migration روی DB شبیه prod
- seed + login همه personas
- AI service up/down
- file upload on target storage (local vs future S3)
- demo reset در staging با flags صحیح

### production smoke (پس از release)

- `/api/health` + `/api/health/ready`
- login یک کاربر
- یک read لیست (customers)
- **نه** destructive ops در prod

---

## 3. انتظارات به تفکیک حوزه

### Core business logic

- **Unit** برای `lib/business/*` (pure functions)
- سرویس‌ها logic را delegate کنند — تست روی pure layer
- status transitions (invoice) — unit برای rules + manual برای UI confirm

### Validation logic

- **Unit** در `validators.test.ts` یا کنار schema
- هر Zod schema جدید: حداقل valid + یک invalid case

### Tenant-scoped queries/services

- **Unit** `tenant-scope.test.ts` برای هر FK helper جدید
- **Manual** cross-org URL همیشه
- **Integration** (future): get-by-id wrong org → 404

### Auth and permission checks

- **Unit** `permissions.test.ts`
- **Manual** staff vs admin routes
- session: manual smoke؛ automated integration later

### Pricing/gating enforcement

- **Unit** `plans.test.ts`, `entitlement.policy.test.ts`
- **Manual** FREE locked `/conversation`
- هر route جدید gated: assert `assertFeature` در code review + manual one plan

### AI service contracts

- **Contract/unit** `intelligence.service.test.ts` (fallback path)
- **Manual** AI down → degraded banner
- FastAPI: CI `compileall` + import smoke — not full contract suite yet
- تغییر `packages/shared/src/types/ai.ts` → update tests + [AI_INTEGRATION.md](../AI_INTEGRATION.md)

### File upload/import

- **Unit** `uploads.test.ts` (size, MIME, path)
- **Manual** upload to entity، oversized file، wrong org entity
- bulk import: manual only until feature exists

### Destructive actions

- **Unit** `destructive.test.ts`, `demo.test.ts`
- **Manual** reseed blocked in prod config
- **Never** automated against prod DB

### Billing/payment lifecycle

- **Unit** plan catalog، policy
- **Manual** change-plan as ADMIN، payment → invoice status
- payment gateway: out of scope V1

### Vertical-pack logic

- **Unit** `registry.test.ts`
- **Manual** per-pack dashboard + `requirePackPage` redirect
- pack services: integration when added

### Dashboard/reporting

- **Unit** receivables/leads stale helpers
- **Manual** empty dashboard، chart with data
- reports API: manual + `assertFeature` check

### UI state rendering

- **Unit** `ui-states.test.ts` (contract of props)
- **Manual** loading/empty/error on real pages

### Demo-mode isolation

- **Unit** `demo.test.ts`, `scenarios.test.ts`
- **Manual** reset ADMIN-only؛ prod block
- security: [security/threat-abuse-paths.md](../security/threat-abuse-paths.md) §7

### Migration/backup helpers

- **Unit** env guard logic در `destructive.test.ts`
- **Manual** `db:backup` + restore در staging
- **نه** automated restore against shared DB in CI

---

## 4. سازمان‌دهی فایل تست

```
packages/shared/src/**/*.test.ts     # shared pure + contract
apps/web/src/lib/**/*.test.ts        # business, validators, permissions, uploads
apps/web/src/server/**/*.test.ts     # service unit (mock) — grow toward integration/
apps/web/src/components/**/*.test.ts # UI contracts (light)
```

**نام‌گذاری:** `*.test.ts` کنار ماژول یا در همان پوشه.

**قانون PR:** اگر فایل در [test-matrix.md](./test-matrix.md) ستون Unit = **Required** دارد و تغییر می‌دهید → تست اضافه یا gap مستند.

---

## 5. Risk tiers

| Tier | معنی | تست |
|------|------|-----|
| **P0** | tenant leak، auth bypass، prod wipe، payment wrong org | automated + manual + security |
| **P1** | billing bypass، AI entitlement، upload path | automated where exists + manual |
| **P2** | business math wrong، stale reports | unit |
| **P3** | copy، minor UX | manual optional |

---

## 6. CI و local gate

```
PR author:  npm run verify
CI:         lint → typecheck → npm test → build
Sensitive:  npm run test:security + security review template
Release:    npm run ci + manual release checklist + prod smoke
```

---

## 7. Gap handling (صریح)

اگر تست automated ندارید:

1. در PR table «Test gaps» پر کنید
2. manual steps numbered
3. ticket/link برای integration/e2e
4. اگر P0 — **block merge** تا mitigation

---

## 8. نقشه راه (post-V1)

1. `apps/web/src/server/**/*.integration.test.ts` با test DB
2. Playwright: login، dashboard، invoice create
3. AI contract tests against FastAPI mock server
4. coverage threshold در CI (هدف‌گذاری incremental)

---

## 9. مستندات مرتبط

- [test-matrix.md](./test-matrix.md)
- [manual-qa-checklist.md](./manual-qa-checklist.md)
- [release-verification-checklist.md](./release-verification-checklist.md)
- [TESTING.md](../TESTING.md)
