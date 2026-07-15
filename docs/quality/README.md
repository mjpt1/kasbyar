# Quality System — KesbYar

سیستم Definition of Done، review checklists، و enforcement برای کار مهندسی آینده.

---

## فهرست

| سند | سطح | کاربرد |
|-----|------|--------|
| [definition-of-done.md](./definition-of-done.md) | feature / module / phase / release | معیار «تمام شد» |
| [review-checklists.md](./review-checklists.md) | per change type | بازبینی PR |
| [../templates/feature-definition-of-done.md](../templates/feature-definition-of-done.md) | قالب PR/feature | کپی در PR |
| [../templates/phase-review-gate.md](../templates/phase-review-gate.md) | پایان فاز | evidence + gaps |
| [../templates/change-review-checklist.md](../templates/change-review-checklist.md) | خلاصه reviewer | سریع |

---

## اتوماسیون سبک

| ابزار | نقش |
|--------|-----|
| `npm run verify` | lint + typecheck + test (محلی) |
| `npm run ci` | verify + build (مثل CI) |
| `.github/workflows/ci.yml` | enforce روی push/PR |
| `.github/pull_request_template.md` | DoD در هر PR |
| `scripts/verify-quality.ps1` | wrapper محلی Windows |

---

## جریان کار

```
شروع کار → phase-entry-checklist (اگر فاز جدید)
         → توسعه
         → npm run verify
         → پر کردن PR template + review checklist مرتبط
         → merge
پایان فاز → phase-review-gate template
release   → release DoD + V1_LAUNCH / QA_CHECKLIST
```

---

## ارتباط با سایر docs

- [engineering/change-impact-checklist.md](../engineering/change-impact-checklist.md) — impact قبل از merge
- [engineering/safe-extension-rules.md](../engineering/safe-extension-rules.md) — extend vs rewrite
- [SECURITY_REVIEW.md](../SECURITY_REVIEW.md) — تغییرات حساس
- [ENVIRONMENT.md](../ENVIRONMENT.md) — env vars
- [KNOWN_LIMITATIONS.md](../KNOWN_LIMITATIONS.md) — محدودیت‌های جدید

---

## Testing

- [testing/README.md](../testing/README.md) — strategy، matrix، QA

---

## ADR

- Hub: [decisions/README.md](../decisions/README.md)
- Index: [decisions/index.md](../decisions/index.md)
- Template: [decisions/adr-template.md](../decisions/adr-template.md)
- Latest: [010-quality-enforcement.md](../decisions/010-quality-enforcement.md)
