# ADR-006: Billing + Feature Gating

**Status:** Accepted

## Context

مدل تجاری SaaS با طرح‌های FREE/STARTER/BUSINESS/ENTERPRISE و محدودیت usage.

## Decision

- Plan definitions: `packages/shared/src/billing/plans.ts`
- `OrganizationSubscription` در DB
- `entitlement.service.ts` + `entitlement.policy.ts` — server-side enforcement
- UI: `UpgradePrompt`، `/pricing`، `/settings/billing`
- Provider adapter: `billing/providers/manual.ts` — checkout واقعی بعداً (Zarinpal/IDPay)

Feature flags per plan: assistant، reports، automation limits، pack access.

## Consequences

- تغییر plan از API `change-plan` (manual provider)
- client فقط نمایش — enforcement در server

## Residual risks

- بدون درگاه واقعی، upgrade دستی است
- usage metering ساده — metering پیشرفته post-V1
