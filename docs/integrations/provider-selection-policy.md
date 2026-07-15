# Provider Selection Policy — KesbYar

چگونه provider از configuration انتخاب می‌شود — بدون if/else پراکنده در business logic.

**کد:** `packages/shared/src/integrations/selection.ts`

---

## 1. اصول

| اصل | توضیح |
|-----|--------|
| **یک env per category** | `BILLING_PROVIDER` نه `USE_ZARINPAL=true` |
| **Default امن** | manual، local، noop، log |
| **Allowlist** | factory فقط idهای شناخته‌شده |
| **Secrets جدا** | `BILLING_ZARINPAL_MERCHANT_ID` — نه در id provider |
| **Explicit override** | پارامتر optional برای تست |

---

## 2. الگوی `resolveProviderId`

```ts
import { resolveProviderId, PROVIDER_IDS } from '@kesbyar/shared';

const id = resolveProviderId(
  explicitId,              // از DB یا test override
  process.env.BILLING_PROVIDER,
  PROVIDER_IDS.BILLING_MANUAL,
  [PROVIDER_IDS.BILLING_MANUAL, PROVIDER_IDS.BILLING_ZARINPAL, PROVIDER_IDS.BILLING_IDPAY],
);
```

رفتار:

1. `explicitId` اگر valid
2. else `envValue` اگر valid
3. else `defaultId`
4. unknown value → **fallback به default** (نه crash در startup V1)

post-V1 option: fail-fast در production اگر provider unknown — ADR جداگانه.

---

## 3. جدول env vars

| Category | Provider env | Default | Allowed ids |
|----------|--------------|---------|-------------|
| Billing | `BILLING_PROVIDER` | `manual` | `manual`, `zarinpal`, `idpay` |
| Storage | `STORAGE_PROVIDER` | `local` | `local`, `s3` |
| Notification | `NOTIFICATION_PROVIDER` | `noop` | `noop`, `kavenegar`, `resend` |
| SMS (alias) | `SMS_PROVIDER` | — | fallback اگر `NOTIFICATION_PROVIDER` unset |
| Analytics | `ANALYTICS_PROVIDER` | `log` | `log`, `posthog` |
| AI | `AI_SERVICE_URL` | localhost | presence-based (see AI docs) |

### Secret prefix convention

| Provider | Example secrets |
|----------|-----------------|
| Zarinpal | `BILLING_ZARINPAL_MERCHANT_ID`, `BILLING_ZARINPAL_CALLBACK_URL` |
| S3 | `STORAGE_S3_BUCKET`, `STORAGE_S3_REGION`, `STORAGE_S3_ACCESS_KEY_ID` |
| Kavenegar | `SMS_KAVENEGAR_API_KEY`, `SMS_KAVENEGAR_SENDER` |
| Resend | `EMAIL_RESEND_API_KEY` |
| PostHog | `ANALYTICS_POSTHOG_API_KEY`, `ANALYTICS_POSTHOG_HOST` |

**قانون:** secrets فقط در adapter خوانده شوند — `getServerEnv()` Zod optional fields.

---

## 4. Factory pattern (per category)

### Billing

```ts
// apps/web/src/server/billing/providers/manual.ts
export function getBillingProvider(explicitId?: string | null): BillingProvider
```

- Cached singleton
- Zarinpal/IDPay: switch case → impl (post-V1)

### Storage

```ts
// apps/web/src/server/files/storage.adapter.ts
export function getFileStorageAdapter(): FileStorageAdapter
```

- `STORAGE_PROVIDER=s3` → فعلاً fallback local تا S3 impl (log warning ops)

### Notification

```ts
// apps/web/src/server/notifications/notification.adapter.ts
export function getNotificationAdapter(): NotificationAdapter
export async function sendNotification(command): Promise<NotificationDispatchResult>
```

- `sendNotification` = facade با try/catch + normalized failure

### Analytics

```ts
// apps/web/src/lib/analytics/analytics.adapter.ts
export function getAnalyticsSink(): AnalyticsSink
export function trackProductEvent(event: AnalyticsEvent): void
```

---

## 5. Multi-tenant provider selection (آینده)

برخی SaaS per-tenant PSP دارند:

```
resolution order:
  1. Organization.integrationSettings.billingProvider (DB)
  2. env BILLING_PROVIDER
  3. default manual
```

V1: org-level override **نیست** — همه tenant یک provider از env.

هنگام اضافه کردن: encrypt secrets per org؛ never log.

---

## 6. محیط‌ها

| Env | Billing | Storage | Notification | Analytics |
|-----|---------|---------|--------------|-----------|
| local dev | manual | local | noop | log |
| staging | manual یا sandbox PSP | local/S3 | noop یا sandbox SMS | log |
| production | PSP live | S3 | Kavenegar/Resend | posthog |

`deploy/env/*.env.example` باید mirror کند.

---

## 7. Feature flags vs provider env

| Use env | Use feature flag |
|---------|------------------|
| which vendor implementation | enable/disable experimental UI flow |
| credentials presence | gradual rollout % |

Provider selection = **env + factory**، نه hardcode در component.

---

## 8. Startup validation (roadmap)

`validateIntegrationEnvAtStartup()` — optional در `instrumentation.ts`:

- اگر `BILLING_PROVIDER=zarinpal` و merchant id missing → warn/error
- V1: lazy validate on first use (adapter throws `NOT_CONFIGURED`)

---

## 9. Checklist env جدید

1. `PROVIDER_IDS` constant
2. `ALLOWED_*` array در factory
3. `.env.example` + `ENVIRONMENT.md`
4. `deploy/env/*`
5. Adapter reads secrets — not service
6. Document in this file §3

---

## 10. `PROVIDER_ENV_KEYS` reference

```ts
import { PROVIDER_ENV_KEYS } from '@kesbyar/shared';

PROVIDER_ENV_KEYS.billing.provider   // 'BILLING_PROVIDER'
PROVIDER_ENV_KEYS.billing.secretsPrefix // 'BILLING_'
```

برای code generators و ops docs.
