# Definition of Done — KesbYar

معیار «تمام شد» در چهار سطح. یک work item **تمام نیست** مگر موارد **قابل‌اجرا** زیر برآورده شوند.

---

## 1. اصول مشترک (همه سطوح)

| # | معیار | اثبات |
|---|--------|--------|
| 1 | Build موفق (در صورت تغییر web) | `npm run build` یا CI سبز |
| 2 | Lint/typecheck | `npm run lint` + `npm run typecheck` |
| 3 | تست‌های مرتبط | `npm test` — matrix: [testing/test-matrix.md](../testing/test-matrix.md) |
| 4 | بدون import/type شکسته | typecheck |
| 5 | Docs به‌روز | فایل‌های `docs/` مرتبط |
| 6 | Env مستند | `.env.example` + `ENVIRONMENT.md` اگر env جدید |
| 7 | Tenant safety | checklist C در change-impact |
| 8 | فارسی/RTL | copy و layout بررسی شده |
| 9 | Known limitations | `KNOWN_LIMITATIONS.md` اگر محدودیت جدید |
| 10 | Manual verification | steps لیست شده در PR یا phase gate |

---

## 2. Feature-level DoD

**دامنه:** یک قابلیت قابل مشاهده یا API endpoint جدید در scope کوچک.

### الزامی

- [ ] کد در `server/` + `api/` + UI (در صورت نیاز) طبق [conventions](../engineering/conventions.md)
- [ ] `organizationId` در همه مسیرهای داده
- [ ] اعتبارسنجی ورودی (Zod در `lib/validators` یا معادل)
- [ ] خطاهای API فارسی و یکدست (`handleApiError`)
- [ ] UI: loading / empty / error در صورت صفحه یا لیست جدید
- [ ] `npm run verify` سبز
- [ ] PR template پر شده
- [ ] review checklist مرتبط از [review-checklists.md](./review-checklists.md)
- [ ] manual smoke: happy path + یک edge case

### اختیاری (بر اساس feature)

- [ ] `assertFeature` اگر plan-gated
- [ ] audit event برای action مهم
- [ ] تست unit برای logic غیر trivial
- [ ] ADR اگر قرارداد AI/auth/schema عوض شد — [adr-template.md](../decisions/adr-template.md)

### قالب PR

→ [templates/feature-definition-of-done.md](../templates/feature-definition-of-done.md)

---

## 3. Module-level DoD

**دامنه:** ماژول دامنه کامل (مثلاً leads، clinic pack) یا گسترش عمده یک حوزه.

### الزامی (علاوه بر feature DoD)

- [ ] [new-module-checklist](../engineering/templates/new-module-checklist.md) یا معادل pack
- [ ] navigation به‌روز (`config/navigation.ts` یا pack registry)
- [ ] seed دمو (اگر دمو به ماژول وابسته است)
- [ ] cross-page consistency (list + detail + create)
- [ ] entitlement/gating اگر commercial
- [ ] `repository-audit.md` risk section بررسی شده — rewrite ممنوع نقض نشده
- [ ] حداقل ۱ تست معنی‌دار (service، validator، یا business logic)

### Manual verification (module)

- [ ] CRUD کامل در یک workspace
- [ ] user دوم / org دوم — عدم دسترسی cross-tenant
- [ ] mobile RTL قابل استفاده (sidebar/جدول)

---

## 4. Phase-level DoD

**دامنه:** یک فاز از MASTER_EXECUTION (مثلاً billing، data safety).

### الزامی

- [ ] [phase-entry-checklist](../engineering/phase-entry-checklist.md) در شروع رعایت شده
- [ ] اهداف فاز در PR(ها) یا سند فاز مشخص
- [ ] `npm run ci` سبز روی branch فاز
- [ ] ADR برای تصمیم‌های major فاز
- [ ] `MASTER_EXECUTION.md` وضعیت فاز به‌روز
- [ ] [phase-review-gate template](../templates/phase-review-gate.md) پر و commit شده در `docs/` یا PR نهایی

### محتوای phase review gate

1. What was implemented  
2. Files/modules changed  
3. Acceptance criteria — satisfied list  
4. Known gaps (explicit)  
5. Assumptions  
6. Manual verification performed  
7. Safe to continue — yes/no  
8. Next phase dependencies  
9. Rollback/mitigation (اگر migration یا ops)

### Stop condition

اگر gap بحرانی باقی مانده → فاز **complete نیست**؛ باید در gate به‌عنوان blocker ثبت شود.

---

## 5. Release-level DoD

**دامنه:** پایلوت، staging cut، production V1.

### الزامی

- [ ] `npm run ci` سبز
- [ ] [V1_LAUNCH.md](../V1_LAUNCH.md) یا release checklist اختصاصی
- [ ] [QA_CHECKLIST.md](../QA_CHECKLIST.md) اجرا و نتیجه ثبت
- [ ] [SECURITY_REVIEW.md](../SECURITY_REVIEW.md) smoke items
- [ ] `ALLOW_SEED=false` در production env
- [ ] `SESSION_SECRET` و `DATABASE_URL` production تنظیم
- [ ] backup قبل از migration (`db:backup`)
- [ ] `KNOWN_LIMITATIONS.md` برای مشتری/تیم
- [ ] rollback plan: backup restore یا revert deploy documented

### Deploy-specific

- [ ] `NEXT_PUBLIC_APP_URL` صحیح
- [ ] health `/api/health` و `/api/health/ready`
- [ ] smoke login پس از deploy
- [ ] monitoring/logging baseline (حداقل LOG_LEVEL)

### قالب

→ [templates/release-readiness.md](../templates/release-readiness.md)  
→ GitHub issue: `.github/ISSUE_TEMPLATE/release-readiness.yml`

---

## 6. سطوح — کدام DoD اعمال شود؟

| نوع کار | حداقل سطح |
|---------|-----------|
| باگ یک خطی | feature (مختصر) |
| feature جدید | feature |
| ماژول / pack | module |
| فاز MASTER_EXECUTION | phase |
| لانچ / پایلوت | release |

---

## 7. استثناها

Gap در تست یا doc فقط با:

- دلیل صریح در PR
- ticket/link پیگیری
- ثبت در `KNOWN_LIMITATIONS.md` اگر user-facing

**بدون استثناء:** tenant safety، secrets در git، destructive ops بدون guard.

---

## 8. دستورات تأیید سریع

```bash
npm run verify      # lint + typecheck + test
npm run ci          # + build (مثل GitHub Actions)
```

Windows: `.\scripts\verify-quality.ps1`
