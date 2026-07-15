# ADR-005: AI Service Contract

**Status:** Accepted

## Context

دستیار باید به داده عملیاتی workspace متصل باشد، نه hallucination آزاد.

## Decision

- FastAPI در `apps/ai-service`
- Web client: `apps/web/src/lib/ai/client.ts` با timeout/retry
- Auth سرویس‌به‌سرویس: `AI_SERVICE_TOKEN` (header `X-Internal-Token` + Bearer)
- Types مشترک: `packages/shared/src/types/ai.ts`
- Context از `operational-context.ts` ساخته می‌شود
- **Fallback اجباری:** `local-fallback.ts` وقتی AI در دسترس نیست
- entitlement check قبل از UI دستیار (plan gating)

هیچ action مخرب مستقیم از AI بدون تأیید UI اجرا نمی‌شود.

## Consequences

- degraded mode قابل مشاهده برای کاربر
- AI service اختیاری برای smoke local (fallback کار می‌کند)

## Residual risks

- پاسخ AI ممکن است نادقیق باشد — محدود به خلاصه/پرسش، نه write بدون کاربر
- تاریخچه مکالمه پایدار نیست (V1 limitation)

## Related

- [ADR-015](./015-application-ai-split.md) — runtime split and DB boundary
- [AI_INTEGRATION.md](../AI_INTEGRATION.md)
