# Observability — KesbYar

قرارداد observability برای لاگ، audit، متریک، و پشتیبانی عملیاتی.

---

## فهرست

| سند | کاربرد |
|-----|--------|
| [observability-contract.md](./observability-contract.md) | قرارداد کلی — ۸ دسته رویداد |
| [logging-policy.md](./logging-policy.md) | چه چیز log شود / نشود |
| [event-taxonomy.md](./event-taxonomy.md) | نام‌گذاری app log، audit، metric |
| [metrics-plan.md](./metrics-plan.md) | KPI و متریک عملیاتی |
| [support-investigation-guide.md](./support-investigation-guide.md) | عیب‌یابی و همبستگی |

**کد مشترک:** `packages/shared/src/observability/`  
**Web logger:** `apps/web/src/lib/logger.ts` · `lib/observability.ts`  
**عملیات:** [OPERATIONS.md](../OPERATIONS.md)  
**Reliability:** [docs/reliability/](../reliability/)

---

## سه کانال جدا

| کانال | ذخیره | مخاطب | مثال |
|--------|--------|--------|------|
| **App logs** | stdout / log aggregator | مهندس، SRE | `api.unhandled` |
| **Audit trail** | `AuditEvent` table | مدیر، compliance سبک | `payment.create` |
| **Metrics** | log-as-metric V1 → analytics بعدی | محصول، ops | `metric.invoice.created` |

**قانون:** audit برای «چه کسی چه کاری روی داده tenant کرد»؛ app log برای «سیستم چه اتفاقی دید»؛ metric برای «چند بار / روند».

---

## شروع سریع (developer)

```ts
import { APP_LOG_EVENTS, logger } from '@/lib/logger';
import { logAudit } from '@/server/audit/audit.service';
import { AUDIT_ACTIONS, METRIC_EVENTS, recordMetric } from '@kesbyar/shared';

logger.info(APP_LOG_EVENTS.WORKSPACE_SELECTED, logger.withOrg(orgId, logger.withActor(userId)));
await logAudit({ organizationId: orgId, userId, action: AUDIT_ACTIONS.PAYMENT_CREATE, ... });
recordMetric(METRIC_EVENTS.INVOICE_CREATED, { organizationId: orgId, planCode: 'STARTER' });
```

---

## Health

- Liveness: `GET /api/health`
- Readiness: `GET /api/health/ready` (DB + optional AI)

---

## وضعیت V1

- Structured JSON logs در production ✅
- Sentry-ready stub ✅
- Metric sink: structured log با `kind: 'metric'` — provider بعدی
- Distributed tracing: `requestId` / `correlationId` — propagate دستی در handler
