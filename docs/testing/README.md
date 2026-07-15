# Testing Documentation — KesbYar

راهبرد تست لایه‌ای و risk-based برای monorepo — تست دیگر afterthought نیست؛ در DoD و PR اجباری است.

---

## فهرست

| سند | کاربرد |
|-----|--------|
| [testing-strategy.md](./testing-strategy.md) | فلسفه، لایه‌ها، چه چیزی الزام است |
| [test-matrix.md](./test-matrix.md) | ماژول × لایه تست مورد انتظار |
| [manual-qa-checklist.md](./manual-qa-checklist.md) | QA دستی قبل از پایلوت/فاز |
| [release-verification-checklist.md](./release-verification-checklist.md) | smoke پس از deploy |
| [../templates/test-plan-template.md](../templates/test-plan-template.md) | قالب طرح تست feature/فاز |

**اجرای سریع:** [TESTING.md](../TESTING.md) — دستورات Vitest

---

## دستورات (root)

| دستور | لایه | زمان |
|--------|------|------|
| `npm test` | همه unit/contract فعلی | هر PR |
| `npm run test:watch` | همان — watch | توسعه |
| `npm run test:coverage` | گزارش پوشش (محدوده config) | دوره‌ای |
| `npm run test:security` | tenant، audit، upload، destructive | PR حساس |
| `npm run verify` | lint + typecheck + test | قبل از PR |
| `npm run ci` | verify + build | قبل از merge/release |

---

## ارتباط با کیفیت و امنیت

- DoD: [quality/definition-of-done.md](../quality/definition-of-done.md)
- Security smoke: [SECURITY_REVIEW.md](../SECURITY_REVIEW.md)
- Tenant checklist: [security/tenant-safety-checklist.md](../security/tenant-safety-checklist.md)
- CI: `.github/workflows/ci.yml`

---

## وضعیت فعلی (V1)

- **Vitest** — ۱۹ فایل تست، محیط Node
- **E2E** — Playwright planned؛ manual QA until then
- **Integration DB** — post-V1؛ فعلاً unit + contract + manual staging
