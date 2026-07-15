# Integrations — KesbYar

معماری مرز یکپارچه‌سازی (integration boundary) برای سرویس‌های خارجی — بدون نشت فرضیات vendor به business logic.

---

## فهرست

| سند | کاربرد |
|-----|--------|
| [integration-boundary-rules.md](./integration-boundary-rules.md) | چه چیزی boundary است؛ چه چیزی ممنوع در domain |
| [provider-adapter-architecture.md](./provider-adapter-architecture.md) | ساختار adapter، مسیر فایل‌ها، قراردادها |
| [provider-selection-policy.md](./provider-selection-policy.md) | انتخاب provider از env و factory |
| [failure-normalization-guidelines.md](./failure-normalization-guidelines.md) | خطاهای vendor → محصول |

**قراردادهای مشترک:** `packages/shared/src/integrations/`  
**ADR:** [008 — Integration adapters](../decisions/008-integration-adapters.md)  
**Reliability:** [reliability/README.md](../reliability/README.md)  
**AI (جداگانه):** [AI_INTEGRATION.md](../AI_INTEGRATION.md)

---

## وضعیت V1

| Category | Contract | Adapter | Provider V1 |
|----------|----------|---------|-------------|
| AI | `@kesbyar/shared/ai` | `lib/ai/client.ts` | internal FastAPI |
| Billing | `integrations/billing.ts` | `billing/providers/manual.ts` | manual |
| Storage | `integrations/storage.ts` | `files/storage.adapter.ts` | local FS |
| Notification | `integrations/notification.ts` | `notifications/notification.adapter.ts` | noop (queued) |
| Analytics | `integrations/analytics.ts` | `lib/analytics/analytics.adapter.ts` | log sink |
| SMS / Email | via NotificationAdapter | same | post-V1 |
| ERP | — | — | post-V1 |

---

## لایه‌ها (خلاصه)

```
UI / API route
    → domain service (invoice, automation, file)
        → adapter factory (getXxxAdapter)
            → vendor implementation (Zarinpal, S3, Kavenegar…)
```

**Domain service هرگز:** `fetch('https://api.zarinpal.com/...')` یا parse webhook خام PSP را نمی‌بیند.

---

## env سریع

| متغیر | پیش‌فرض | حوزه |
|--------|---------|------|
| `BILLING_PROVIDER` | `manual` | billing |
| `STORAGE_PROVIDER` | `local` | files |
| `NOTIFICATION_PROVIDER` | `noop` | SMS/email |
| `SMS_PROVIDER` | — | fallback alias |
| `ANALYTICS_PROVIDER` | `log` | telemetry |
| `AI_SERVICE_URL` | — | AI (see AI_INTEGRATION) |

جزئیات: [provider-selection-policy.md](./provider-selection-policy.md) · [ENVIRONMENT.md](../ENVIRONMENT.md)
