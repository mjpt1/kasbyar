# Graceful Degradation Policy — KesbYar

**وضعیت:** فعال V1  
**مالک:** Engineering + Operations  
**مرتبط:** [ADR-005](../decisions/005-ai-contract.md) · [ADR-015](../decisions/015-app-ai-split.md) · [observability-contract](../observability/observability-contract.md)

---

## 1. هدف

وقتی یک وابستگی خارجی یا داخلی fail می‌شود، KesbYar باید:

1. **اعتماد حفظ کند** — پیام فارسی صادقانه، بدون silent failure روی داده مالی
2. **هسته را زنده نگه دارد** — CRM، فاکتور، workspace، auth
3. **قابل تشخیص باشد** — log، metric، audit برای ops
4. **قابل بازیابی باشد** — retry/queue جایی که منطقی است

---

## 2. طبقه‌بندی وابستگی‌ها

| کلاس | وابستگی | اگر fail شود |
|------|---------|--------------|
| **Tier 0 — حیاتی** | PostgreSQL، session auth | کل اپ unavailable (503 readiness) |
| **Tier 1 — کسب‌وکار** | file upload، billing record، payment confirm | action block؛ بقیه ماژول‌ها OK |
| **Tier 2 — تقویتی** | AI service، analytics | fallback یا ignore |
| **Tier 3 — async** | SMS، email، background jobs | queue/defer؛ retry بعدی |

تعریف policy در کد: `DEFAULT_FAILURE_POLICIES` در `packages/shared/src/reliability/degradation.ts`

---

## 3. رفتار کاربر (User-visible)

### 3.1 اصول UI

| اصل | پیاده‌سازی |
|-----|-----------|
| پیام فارسی، بدون stack trace | `AppError` + `handleApiError` |
| degradation قابل مشاهده | badge «حالت آفلاین» در `OperationalInsightCard` |
| عملیات مالی شفاف | «پرداخت در حال بررسی» نه «موفق» تا confirm |
| retry قابل فهم | toast با دکمه تلاش مجدد برای network |
| entitlement واضح | `PlanUpgradeRequiredError` → 402 + پیام ارتقا |

### 3.2 ماتریس سریع

| حالت | کاربر چه می‌بیند | چه کاری می‌تواند بکند |
|------|------------------|------------------------|
| AI down | خلاصه/پاسخ محلی + توضیح محدودیت | همه ماژول‌های غیر-AI |
| DB down | صفحه خطای سرور / 503 | هیچ (readiness fail) |
| Upload reject | پیام دلیل (MIME/size) | آپلود فایل دیگر |
| Plan limit | کارت ارتقا | features مجاز پلن |
| Demo reset fail | «بازنشانی ناموفق — داده قبلی سالم» | ادامه کار با داده فعلی |

---

## 4. رفتار اپراتور (Operator-visible)

| سیگنال | کانال | اقدام اول |
|--------|-------|-----------|
| `health.check.failed` | app log | readiness probe |
| `dependency.degraded` | app log warn | بررسی وابستگی در catalog |
| `ai.request.timeout` | app log | AI_SERVICE_URL، latency |
| `automation.rule.failed` | app log | rule خاص؛ orgId |
| `demo.reset.failed` | app log + security | seed error؛ env flags |
| `exception.captured` | Sentry (اگر فعال) | stack + requestId |

جزئیات: [operator-response-guide.md](./operator-response-guide.md)

---

## 5. Block vs Queue vs Fallback

```
                    ┌─────────────┐
                    │  Request    │
                    └──────┬──────┘
                           │
              ┌────────────▼────────────┐
              │ Tier 0 dependency OK? │
              └────────────┬──────────┘
                     no   │   yes
                    ┌─────▼─────┐
                    │   BLOCK   │ 503 / خطای سرور
                    └───────────┘
                           yes
              ┌────────────▼────────────┐
              │ Action needs Tier 1?    │
              └────────────┬────────────┘
                     fail │ success
              ┌────────────▼────────────┐
              │ BLOCK + پیام فارسی      │
              └─────────────────────────┘
                           │
              ┌────────────▼────────────┐
              │ Tier 2/3 optional?      │
              └────────────┬────────────┘
              ┌────────────┼────────────┐
         fallback      queue         ignore
      (AI local)    (SMS retry)   (metrics drop)
```

| تصمیم | کی |
|-------|-----|
| **Block** | auth، tenant scope، payment confirm، upload validation، entitlement (fail-closed) |
| **Queue / defer** | SMS/email ارسال، reminder dispatch، async export |
| **Fallback** | AI summary/assistant، optional enrichment |
| **Ignore** | analytics telemetry، non-critical metrics |

---

## 6. لاگ و audit

| رویداد | App log | Audit |
|--------|---------|-------|
| پرداخت ایجاد/تأیید | `billing.plan_change` | `payment.*` |
| AI fallback | `intelligence.*.fallback` | — |
| آپلود رد | `file.upload.rejected` | — |
| دمو reset موفق | `demo.reset.attempt` | `demo.reset` |
| دمو reset ناموفق | `demo.reset.failed` | — (عمداً بدون audit موفق) |
| automation شکست | `automation.rule.failed` | — |

**قانون:** هر action که state مالی یا tenant را تغییر می‌دهد → audit اجباری. degradation بدون تغییر state → log کافی.

---

## 7. سناریوهای بحرانی (سیاست)

### 7.1 دستیار unavailable؛ اپ اصلی usable

- `getOperationalInsight` / `askBusinessAssistant` → local fallback
- UI: degraded badge + metric `assistant.fallback`
- readiness: `ai_service: degraded` هنوز **200** اگر DB ok
- **هرگز** block کردن invoice/lead به‌خاطر AI

### 7.2 تأیید پرداخت با تأخیر

- V1: billing دستی — webhook gateway آینده
- تا confirm نشود: invoice status «در انتظار»؛ audit pending
- callback duplicate: idempotent handler (آینده)
- کاربر: «در حال بررسی» — نه «پرداخت شد»

### 7.3 Import جزئی fail

- post-V1: transaction per batch؛ row errors جمع‌آوری
- کاربر: گزارش «N از M ردیف» + دانلود خطاها
- **هرگز** silent partial commit بدون گزارش

### 7.4 Demo reset fail-safe

- `canResetDemoData()` guard قبل از seed
- try/catch: بدون audit موفق؛ `demo.reset.failed` log
- پیام: داده قبلی دست‌نخورده

### 7.5 Backup script failure

- `scripts/db-backup.ts` → exit ≠ 0
- بدون mutate production DB
- ops: alert روی exit code؛ بررسی pg_dump/DISK

### 7.6 SMS reminder failure

- V1: reminder DB record؛ dispatch post-V1
- سیاست: mark `isSent=false`؛ retry job؛ کاربر core app OK

### 7.7 AI action timeout

- client: `AI_SERVICE_TIMEOUT_MS` (default 8s) + retries
- log: `ai.request.timeout` سپس fallback
- UI: toast شبکه در conversation panel

### 7.8 Feature-gating issue

- `assertFeature` → `PlanUpgradeRequiredError` (fail-closed)
- اگر DB entitlement query fail → **block** (نه unlock رایگان)
- ops: subscription row + plan cache

### 7.9 Admin action failure (staging/prod)

- destructive ops: `scripts/ops/destructive-guard.ts`
- audit همه admin mutations
- staging: همان guardrails prod (جز env flags)

---

## 8. الگوهای کد

| الگو | فایل |
|------|------|
| AI retry + timeout | `apps/web/src/lib/ai/client.ts` |
| AI local fallback | `server/intelligence/local-fallback.ts` |
| Generic fallback wrapper | `apps/web/src/lib/resilience.ts` |
| Per-task isolation | `runIsolatedTasks` · automation loop |
| Health without throw | `getAiHealth()` |
| API error mapping | `lib/api-auth.ts` → `handleApiError` |

---

## 9. Checklist PR

- [ ] آیا failure جدید user-visible پیام فارسی دارد؟
- [ ] آیا Tier 0/Tier 1 به‌اشتباه fallback می‌شود؟
- [ ] آیا audit برای state change ثبت می‌شود؟
- [ ] آیا `APP_LOG_EVENTS` مناسب اضافه/استفاده شده؟
- [ ] آیا readiness probe رفتار درست دارد؟
- [ ] آیا entitlement fail-closed است؟
- [ ] سناریو در [failure-mode-catalog](./failure-mode-catalog.md) به‌روز شده؟

---

## 10. خارج از scope V1 (مستند شده)

- Payment gateway webhook idempotency
- SMS/email provider integration
- Bulk CSV import pipeline
- Dead-letter queue infrastructure

سیاست‌های آینده در catalog با برچسب **post-V1** مشخص شده‌اند.
