# Failure Normalization Guidelines — KesbYar

چگونه خطاهای vendor-specific به سطح محصول normalize می‌شوند — بدون leak کردن جزئیات فنی به کاربر.

**کد:** `packages/shared/src/integrations/errors.ts`  
**مرتبط:** [reliability/failure-normalization](../reliability/graceful-degradation-policy.md) · [error-taxonomy](../observability/error-taxonomy.md)

---

## 1. هدف

```
Vendor error (opaque)  →  IntegrationFailure  →  domain decision  →  user / log / audit
```

کاربر: پیام فارسی پایدار  
Ops: `provider`, `code`, `vendorCode` در log  
API: `AppError.code` domain-level — نه `ZARINPAL_ERROR_42`

---

## 2. `IntegrationFailure` shape

```ts
interface IntegrationFailure {
  code: IntegrationFailureCode;
  message: string;           // Persian-safe
  provider?: string;
  category?: string;
  retryable: boolean;
  vendorCode?: string;       // logs only
}
```

### Codes

| Code | معنی | retryable |
|------|------|-----------|
| `provider_unavailable` | down / network | yes |
| `provider_timeout` | timeout | yes |
| `provider_rate_limited` | 429 | yes |
| `provider_rejected` | business reject | no |
| `provider_auth` | bad credentials | no |
| `invalid_recipient` | bad phone/email | no |
| `invalid_payload` | validation | no |
| `not_configured` | missing env | no |
| `unknown` | unmapped | maybe |

Helper: `normalizeIntegrationError(error, { provider, category })`

---

## 3. Mapping vendor → code (examples)

### SMS (Kavenegar-style)

| Vendor signal | Normalized |
|---------------|------------|
| HTTP 5xx | `provider_unavailable` |
| status 418 / invalid receptor | `invalid_recipient` |
| invalid API key | `provider_auth` |
| 429 | `provider_rate_limited` |

```ts
// inside kavenegar adapter only
if (response.status === 418) {
  return { status: 'failed', failure: integrationFailure(
    INTEGRATION_FAILURE_CODES.INVALID_RECIPIENT,
    'شماره موبایل گیرنده نامعتبر است',
    { provider: 'kavenegar', vendorCode: String(response.status) },
  )};
}
```

### Payment (Zarinpal-style)

| Vendor | Normalized |
|--------|------------|
| verify failed | `provider_rejected` |
| duplicate authority | idempotent success at service layer |
| timeout | `provider_timeout` |

Domain service maps `paid` → subscription update + audit — نه raw JSON.

### Storage (S3)

| AWS code | Normalized |
|----------|------------|
| NoSuchBucket | `not_configured` |
| AccessDenied | `provider_auth` |
| SlowDown | `provider_rate_limited` |

### AI (existing)

Already normalized in `lib/ai/errors.ts`:

- `AiTimeoutError` → `AI_TIMEOUT`
- `AiUnavailableError` → `AI_UNAVAILABLE`

Intelligence service → local fallback (not `IntegrationFailure` — Tier 2 policy).

---

## 4. سطوح surfacing

```
┌─────────────────────────────────────────────────────────┐
│ Adapter: catch vendor error → IntegrationFailure        │
└───────────────────────────┬─────────────────────────────┘
                            │
┌───────────────────────────▼─────────────────────────────┐
│ Domain service: decide block | queue | fallback         │
└───────────────────────────┬─────────────────────────────┘
                            │
         ┌──────────────────┼──────────────────┐
         ▼                  ▼                  ▼
    User (Persian)     App log            Audit
    toast/error        integration.*      if money/state
```

| Category | On failure |
|----------|------------|
| Analytics | swallow |
| AI | fallback |
| Notification | `queued` or `failed` + log |
| Billing checkout | block + message |
| Storage upload | throw `AppError` / validation |
| Webhook parse | 400 to vendor + log (no user) |

---

## 5. Log events

| Event | When |
|-------|------|
| `integration.provider.failed` | adapter boundary catch |
| `integration.not_configured` | requested provider missing secrets |
| `notification.queued` | noop/defer path |
| `intelligence.*.fallback` | AI (separate taxonomy) |

**Never log:** API keys، full webhook body with PII، card numbers.

→ [logging-policy](../observability/logging-policy.md) · [sanitize.ts](../../packages/shared/src/observability/sanitize.ts)

---

## 6. API response rules

| Case | HTTP | Body |
|------|------|------|
| Plan gating | 402 | `PlanUpgradeRequiredError` |
| Upload validation | 400 | Persian message |
| Integration block (payment) | 502/503 | generic «خطا در پرداخت» + support hint |
| Optional feature fail | 200 | degraded payload |

**Do not expose:** `vendorCode`، stack، PSP response JSON.

`ERROR_CATEGORIES.EXTERNAL_INTEGRATION` in support triage.

---

## 7. `NotificationDispatchResult` pattern

```ts
type NotificationDispatchResult =
  | { status: 'sent' | 'queued'; providerRef?: string }
  | { status: 'failed'; failure: IntegrationFailure };
```

Automation:

- `sent` / `queued` → continue
- `failed` + `retryable` → log؛ next cron retry
- `failed` + !retryable → log + optional activity feed

---

## 8. Webhook normalization

Webhook route responsibilities **only**:

1. Verify signature (`verifyWebhook`)
2. `parseWebhook` → `PaymentWebhookEvent`
3. Delegate to `subscription.service`
4. Return 200/idempotent to stop PSP retries

```ts
// route.ts — allowed to see raw payload
const event = await provider.parseWebhook(body, headers);
if (!event) return new Response('ignored', { status: 200 });
await confirmPaymentFromProviderEvent(event);
```

---

## 9. Testing normalization

`packages/shared/src/integrations/errors.test.ts` — timeout detection.

Adapter tests: table-driven vendor response → expected `IntegrationFailure.code`.

---

## 10. Checklist new adapter

- [ ] All exit paths return domain type or `IntegrationFailure`
- [ ] `vendorCode` only in logs
- [ ] Persian `message` reviewed
- [ ] `retryable` set correctly
- [ ] Entry in [failure-mode-catalog](../reliability/failure-mode-catalog.md)
- [ ] No vendor types exported from adapter index
