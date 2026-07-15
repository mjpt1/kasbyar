# ADR-008: Integration Adapters

**Status:** Accepted

## Context

سرویس‌های خارجی (پرداخت، SMS، storage، AI) نباید مستقیم در business logic پخش شوند.

## Decision

| حوزه | Contract | Factory | پیاده‌سازی V1 |
|------|----------|---------|---------------|
| AI | `packages/shared/src/types/ai.ts` | `lib/ai/client.ts` | FastAPI HTTP |
| Billing | `integrations/billing.ts` | `getBillingProvider()` | `manual` |
| File storage | `integrations/storage.ts` | `getFileStorageAdapter()` | local FS |
| Notification | `integrations/notification.ts` | `getNotificationAdapter()` | noop (queued) |
| Analytics | `integrations/analytics.ts` | `getAnalyticsSink()` | log sink |
| SMS/Email | via NotificationAdapter | `sendNotification()` | post-V1 vendors |

**مستندات:** [docs/integrations/README.md](../integrations/README.md)

## Consequences

- جایگزینی provider بدون تغییر service layer
- تست‌ها می‌توانند adapter mock کنند
- `IntegrationFailure` برای خطای یکسان cross-vendor

## Residual risks

- Automation `SEND_REMINDER` هنوز فقط DB record — wire به `sendNotification` با SMS
- S3/Zarinpal/Kavenegar impl post-V1 — factory و env آماده است
