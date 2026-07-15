# Integration Boundary Rules — KesbYar

**وضعیت:** فعال V1  
**مرتبط:** [ADR-008](../decisions/008-integration-adapters.md) · [tenant-safety](../security/tenant-safety-checklist.md)

---

## 1. چه چیزی «مرز خارجی» (external boundary) است؟

هر ارتباطی که:

- از perimeter اپ خارج می‌شود (HTTP به third party)
- credentials اختصاص vendor دارد
- payload یا response شکل vendor-specific دارد
- SLA/uptime خارج از کنترل KesbYar است

### در scope

| Boundary | مثال vendor |
|----------|-------------|
| Payment gateway | Zarinpal، IDPay، Stripe |
| SMS | Kavenegar، Melipayamak |
| Email | Resend، SMTP |
| Object storage | S3، MinIO، R2 |
| Analytics | PostHog، GA4 |
| AI inference | FastAPI داخلی (فعلاً)؛ آینده: OpenAI proxy |
| ERP/accounting | Sepidar، Rahkaran (آینده) |
| Push / in-app (آینده) | FCM، Web Push |

### خارج از scope (domain داخلی)

- Prisma / PostgreSQL (Tier 0 — reliability نه integration adapter)
- Session auth، RBAC، entitlement logic
- Jalali formatting، invoice math، lead scoring محلی
- UI components، RTL layout

---

## 2. قوانین مرز (hard rules)

### 2.1 Business logic نباید بداند

| ❌ ممنوع در `*.service.ts` domain | ✅ مجاز |
|-----------------------------------|---------|
| URL/API path vendor | `getBillingProvider().createCheckoutSession(...)` |
| Header auth vendor (`X-API-Key` Kavenegar) | adapter internal |
| Field names webhook (`Authority`, `RefID`) | `PaymentWebhookEvent` normalized |
| HTTP status خام vendor در UI | `IntegrationFailure` + Persian message |
| `process.env.ZARINPAL_*` در service | `getBillingProvider()` factory |
| Retry/backoff vendor در automation | adapter یا `lib/resilience.ts` |

### 2.2 Adapter نباید بداند

| ❌ ممنوع در adapter | ✅ مجاز |
|---------------------|---------|
| Prisma business rules | read/write bytes، HTTP call |
| `organizationId` tenancy bypass | pass-through opaque ids |
| UI copy | return normalized result/failure |
| Entitlement / plan gating | caller's responsibility |

### 2.3 API route / UI

- Route فقط session + validation + service call
- Webhook routes: **تنها** محل parse خام — فوراً normalize به domain event
- UI هرگز vendor logo/flow را hardcode نکند بدون feature flag

---

## 3. محل زندگی کد

| لایه | مسیر | مسئولیت |
|------|------|---------|
| **Contracts** | `packages/shared/src/integrations/` | interfaces، failure types، provider ids |
| **AI contracts** | `packages/shared/src/types/ai.ts` | snapshot درخواست/پاسخ AI |
| **Factories** | `apps/web/src/server/**/**.adapter.ts` | `getXxxAdapter()` |
| **Vendor impl** | `apps/web/src/server/**/providers/*.ts` | یک فایل per vendor |
| **Domain** | `apps/web/src/server/*/*.service.ts` | orchestration tenant-safe |
| **Thin client** | `apps/web/src/lib/ai/` | HTTP + retry (AI special case) |

```
packages/shared/src/integrations/     ← types only, no fetch
apps/web/src/server/files/            ← file.service + storage.adapter
apps/web/src/server/billing/providers/
apps/web/src/server/notifications/
apps/web/src/lib/analytics/
apps/web/src/lib/ai/                  ← documented in AI_INTEGRATION.md
```

---

## 4. جریان داده (normalized)

```
Vendor JSON  →  adapter.parse*()  →  domain DTO  →  service  →  Prisma / UI
Domain cmd   →  service           →  adapter.send() →  vendor API
```

مثال پرداخت:

```
Zarinpal POST /verify  →  zarinpal.adapter.parseWebhook()
                       →  PaymentWebhookEvent { status: 'paid', providerRef }
                       →  subscription.service.confirmPayment()
```

---

## 5. Tenant safety در boundary

هر command خارجی **باید** `organizationId` داشته باشد (یا از session derive شود قبل از adapter):

- `SendNotificationCommand.organizationId`
- `CheckoutSessionRequest.organizationId`
- `FileStorageWriteRequest.organizationId`

Webhook: map `providerRef` → org via DB **قبل** از mutation.

→ [tenant-safety-checklist](../security/tenant-safety-checklist.md)

---

## 6. Failure surface به محصول

| Severity | Product behavior |
|----------|------------------|
| Optional (analytics) | silent drop |
| Enhancement (AI) | fallback — [reliability](../reliability/graceful-degradation-policy.md) |
| Async (SMS) | queued + retry |
| Critical path (payment confirm) | block + honest status |
| Upload | block + Persian validation message |

جزئیات: [failure-normalization-guidelines.md](./failure-normalization-guidelines.md)

---

## 7. تست

| لایه | روش |
|------|-----|
| Contract | typecheck + unit on normalize functions |
| Adapter | mock HTTP (vendor responses) |
| Service | inject mock adapter / factory override |
| E2E | staging sandbox credentials only |

---

## 8. افزودن provider جدید — checklist

1. Add `PROVIDER_IDS.*` در `integrations/categories.ts`
2. Define/extend contract در `integrations/*.ts`
3. Implement `apps/web/.../providers/<vendor>.ts`
4. Wire factory در `getXxxAdapter()`
5. Env vars در `ENVIRONMENT.md` + `.env.example`
6. Failure mapping در adapter با `normalizeIntegrationError`
7. Log events: `integration.provider.failed`
8. Entry در [failure-mode-catalog](../reliability/failure-mode-catalog.md)
9. ADR اگر تصمیم معماری یا vendor lock-in

---

## 9. وضعیت فعلی repo (V1 audit)

| Area | Boundary respected? | Gap |
|------|---------------------|-----|
| Files | ✅ `file.service` → adapter | S3 impl post-V1 |
| Billing | ✅ manual provider | Zarinpal stub |
| AI | ✅ client isolated | domain types in shared/ai |
| Notifications | ✅ noop adapter scaffold | real SMS post-V1 |
| Analytics | ✅ log sink | PostHog post-V1 |
| Automation SEND_REMINDER | ⚠️ creates DB reminder only | wire `sendNotification` when SMS ready |

---

## 10. Anti-patterns (رد در review)

```ts
// ❌ در lead.service.ts
await fetch('https://api.kavenegar.com/v1/...', { headers: { apikey: process.env.KAVENEGAR_API_KEY } });

// ✅
import { sendNotification } from '@/server/notifications/notification.adapter';
await sendNotification({ organizationId, channel: 'sms', recipient, body });
```

```ts
// ❌ expose vendor ref to UI as success
return { zarinpalAuthority: raw.Authority };

// ✅
return { checkoutUrl: result.checkoutUrl, status: 'pending' };
```
