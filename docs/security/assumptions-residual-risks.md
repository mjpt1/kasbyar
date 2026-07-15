# Security Assumptions and Residual Risks — KesbYar

فرض‌های امنیتی صریح و ریسک‌های پذیرفته‌شده در V1. **این سند گواهینامه نیست.**

---

## 1. فرض‌های طراحی (ما فرض می‌کنیم)

| # | فرض | اگر نقض شود |
|---|-----|-------------|
| A1 | Deploy production با `APP_ENV=production` و HTTPS | session/cookie ضعیف |
| A2 | `SESSION_SECRET` تصادفی ≥۱۶ کاراکتر، منحصر به deploy | session forgery |
| A3 | `DATABASE_URL` فقط از شبکه اپ قابل دسترس | DB exfiltration |
| A4 | `ALLOW_SEED=false` در production واقعی | accidental wipe |
| A5 | اپراتور قبل از migrate backup می‌گیرد | unrecoverable schema error |
| A6 | Reviewer انسانی PRهای حساس را با [review-gate](./review-gate.md) چک می‌کند | logic bugs ship |
| A7 | کاربران org مخرب داخلی توسط RBAC محدود می‌شوند — نه zero-trust داخلی کامل | insider abuse |
| A8 | Postgres و host توسط cloud/provider امن نگه داشته می‌شود | infra breach out of app scope |
| A9 | وابستگی‌های npm از registry رسمی با lockfile | supply chain (baseline) |
| A10 | AI پاسخ‌ها توسط انسان برای تصمیم مالی تأیید می‌شوند | bad AI advice |

---

## 2. کنترل‌های پیاده‌سازی‌شده (V1 baseline)

| کنترل | وضعیت |
|--------|--------|
| Session httpOnly + server validation | ✅ |
| Tenant `organizationId` in services | ✅ |
| tenant-scope FK validation | ✅ |
| RBAC on API (`requireApiRole`) | ✅ |
| Plan gating server-side (`assertFeature`) | ✅ |
| Upload size + MIME allowlist + org path | ✅ (hardened) |
| Audit sanitize metadata | ✅ |
| Destructive script env guards | ✅ |
| Demo reset guards | ✅ |
| AI no direct DB write | ✅ |
| Env Zod validation (`lib/env.ts`) | ✅ |
| Production startup env checks | ✅ (hardened) |

---

## 3. ریسک‌های باقی‌مانده (پذیرفته / post-V1)

| ریسک | شدت | توضیح | کاهش آینده |
|------|-----|--------|-------------|
| R1 | Brute-force login | Med | بدون rate limit در app | ingress / middleware |
| R2 | XSS → session theft | Med | CSP کامل نشده | strict CSP + audit UI |
| R3 | Malware in uploads | Med | MIME only؛ no AV | ClamAV / cloud scan |
| R4 | Prompt injection | Med | bounded context | output filtering |
| R5 | Self-serve plan without payment | Low | manual billing | payment gateway + webhook |
| R6 | No global Prisma tenant middleware | Med | discipline + review | optional middleware |
| R7 | Local file storage on Vercel | High for serverless | ephemeral disk | S3 adapter |
| R8 | No automated tenant isolation tests in CI | Med | manual + unit tests | integration test suite |
| R9 | Error monitoring optional | Low | SENTRY_DSN optional | enable Sentry |
| R10 | Certification claims | — | **هیچ SOC2/ISO ادعا نمی‌شود** | — |

---

## 4. تفاوت محیط‌ها

| Item | Development | Staging | Production |
|------|-------------|---------|------------|
| SESSION_SECRET | dev default allowed | required | **required** |
| ALLOW_SEED | true typical | often true | **false** |
| DEMO_MODE | often true | optional | rare |
| AI_SERVICE | optional | recommended | recommended |
| HTTPS | optional | yes | **yes** |
| Secure cookie | no | yes | **yes** |

---

## 5. داده حساس — چه جایی نمی‌رود

| داده | لاگ client | audit metadata | AI context |
|------|------------|----------------|------------|
| password / hash | ❌ | redacted | ❌ |
| SESSION_SECRET | ❌ | ❌ | ❌ |
| full card PAN | N/A V1 | ❌ | ❌ |
| API tokens | ❌ in prod logs | redacted | ❌ |

---

## 6. وقتی residual risk را در PR ثبت کنیم

اگر reviewer با **Approve with risk** merge می‌کند:

1. ریسک را در PR body بنویسید (مثلاً R4)
2. اگر user-facing است → `KNOWN_LIMITATIONS.md`
3. اگر تصمیم معماری است → ADR

---

## 7. بازبینی دوره‌ای

| بازه | اقدام |
|------|--------|
| هر PR حساس | [review-gate](./review-gate.md) |
| هر release | [SECURITY_REVIEW.md](../SECURITY_REVIEW.md) smoke |
| هر فاز major | به‌روز این سند + threat doc |

---

## 8. مستندات مرتبط

- [threat-abuse-paths.md](./threat-abuse-paths.md)
- [tenant-safety-checklist.md](./tenant-safety-checklist.md)
- [DATA_SAFETY.md](../DATA_SAFETY.md)
- [KNOWN_LIMITATIONS.md](../KNOWN_LIMITATIONS.md)
- [ADR-014](../decisions/014-audit-data-safety.md)
