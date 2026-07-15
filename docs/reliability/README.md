# Reliability — KesbYar

سیاست تخریب تدریجی (graceful degradation) و مدیریت خطا برای حفظ اعتماد کاربر هنگام قطعی یا ناپایداری وابستگی‌ها.

---

## فهرست

| سند | کاربرد |
|-----|--------|
| [graceful-degradation-policy.md](./graceful-degradation-policy.md) | اصول کلی — چه چیزی باید کار کند وقتی چیزی خراب است |
| [failure-mode-catalog.md](./failure-mode-catalog.md) | کاتالوگ failure mode به‌ازای هر وابستگی |
| [retry-timeout-guidelines.md](./retry-timeout-guidelines.md) | timeout، retry، backoff |
| [operator-response-guide.md](./operator-response-guide.md) | playbook عملیات و پشتیبانی |

**کد مشترک:** `packages/shared/src/reliability/`  
**Web helpers:** `apps/web/src/lib/resilience.ts` · `apps/web/src/lib/ai/client.ts`  
**Observability:** [docs/observability/](../observability/)  
**عملیات:** [OPERATIONS.md](../OPERATIONS.md)  
**Integrations:** [docs/integrations/](../integrations/)

---

## اصل طلایی

> **هسته کسب‌وکار (CRM، فاکتور، پرداخت ثبت‌شده، workspace) نباید به‌خاطر قطعی AI، SMS، یا analytics از کار بیفتد.**

وابستگی‌های اختیاری **degrade** می‌شوند؛ وابستگی‌های حیاتی **block** با پیام فارسی واضح.

---

## سطوح degradation

| سطح | معنی | مثال UI |
|-----|------|---------|
| `healthy` | همه مسیرها عادی | بدون badge |
| `degraded` | مسیر جایگزین یا تأخیر | «حالت آفلاین» در insight |
| `unavailable` | قابلیت غیرفعال؛ بقیه اپ OK | toast + fallback محلی |

تعریف در کد: `packages/shared/src/reliability/degradation.ts`

---

## سناریوهای بحرانی (خلاصه)

| سناریو | سیاست | سند |
|--------|--------|-----|
| دستیار AI قطع؛ اپ اصلی سالم | fallback محلی | [failure-mode-catalog § AI](./failure-mode-catalog.md#ai-service) |
| تأیید پرداخت با تأخیر | block تا reconcile؛ audit | [§ Billing](./failure-mode-catalog.md#billing--payment-callbacks) |
| import جزئی ناموفق | گزارش row-level؛ commit موفق | [§ Import](./failure-mode-catalog.md#storage--import) |
| بازنشانی دمو ناموفق | بدون audit موفق؛ خطای امن | [§ Demo](./failure-mode-catalog.md#demo-reset) |
| شکست backup | exit ≠ 0؛ بدون حذف داده | [§ Backup](./failure-mode-catalog.md#database-backup) |
| SMS یادآوری ناموفق | queue/retry؛ reminder باقی | [§ SMS](./failure-mode-catalog.md#smsemail-providers) |
| timeout درخواست AI | retry سپس fallback | [retry-timeout](./retry-timeout-guidelines.md) |
| خطای feature-gating | fail-closed (نه fail-open) | [§ Entitlements](./failure-mode-catalog.md#feature-gating--entitlements) |
| admin action در staging/prod | audit + guard | [operator guide](./operator-response-guide.md) |

---

## Health probes

| Probe | Endpoint | رفتار |
|-------|----------|--------|
| Liveness | `GET /api/health` | process زنده |
| Readiness | `GET /api/health/ready` | DB اجباری؛ AI اختیاری (degraded ≠ 503) |

---

## وضعیت پیاده‌سازی V1

| قابلیت | وضعیت |
|--------|--------|
| AI fallback محلی | ✅ |
| AI client retry/timeout | ✅ |
| Automation per-rule isolation | ✅ |
| Demo reset safe failure | ✅ |
| `runWithFallback` helper | ✅ |
| SMS/email provider | 📋 post-V1 (سیاست مستند) |
| Bulk CSV import | 📋 post-V1 (سیاست مستند) |
| Payment gateway webhook | 📋 manual billing V1 |

---

## شروع سریع (developer)

```ts
import { runWithFallback } from '@/lib/resilience';
import { DEPENDENCIES } from '@kesbyar/shared';

const { value, degraded } = await runWithFallback({
  dependency: DEPENDENCIES.AI_SERVICE,
  primary: () => fetchFromAi(),
  fallback: () => buildLocalAnswer(),
});
```

قبل از PR با مسیر degradation جدید: [graceful-degradation-policy.md § Checklist](./graceful-degradation-policy.md#checklist-pr)
