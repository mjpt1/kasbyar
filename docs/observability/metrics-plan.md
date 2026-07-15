# Metrics Plan — KesbYar

مدل متریک عملیاتی و کسب‌وکار — **foundation** بدون الزام analytics provider در V1.

---

## 1. Philosophy

| Principle | Detail |
|-----------|--------|
| Names stable | `METRIC_EVENTS` in shared — do not rename lightly |
| Emit from truth | Prefer server-side after success (not click-only) |
| Tenant dimension | `organizationId` on all product metrics |
| Plan dimension | `planCode` when billing-relevant |
| V1 transport | `recordMetric()` → structured log `kind: 'metric'` |
| V2 transport | PostHog / Metabase / warehouse — same event names |

---

## 2. Operational metrics

| Metric | Event constant | How to compute (V1) |
|--------|----------------|---------------------|
| API error rate | `metric.api.error` | count `api.unhandled` + 5xx / requests |
| Critical errors | `metric.error.critical` | `exception.captured` count |
| Assistant failures | `metric.assistant.failure` | AI HTTP fail + timeout |
| Assistant fallbacks | `metric.assistant.fallback` | local fallback used |
| Import failures | `metric.import.failure` | future import job |

**Source:** log aggregator queries on `message` + `kind=metric`.

---

## 3. Business metrics

### Workspaces & users

| Metric | Event | When emit |
|--------|-------|-----------|
| Active workspaces (daily) | `metric.workspace.active_daily` | cron/rollup: distinct org with activity |
| DAU | `metric.user.active_daily` | distinct `userId` per day |
| WAU | `metric.user.active_weekly` | distinct `userId` per week |

*V1: rollup job post-launch — event defined, batch not required day-1.*

### CRM

| Metric | Event | Emit point |
|--------|-------|------------|
| Customers created | `metric.customer.created` | `customer.service` create success |
| Leads created | `metric.lead.created` | lead create |
| Leads converted | `metric.lead.converted` | status WON |
| Tasks created | `metric.task.created` | task create |
| Tasks completed | `metric.task.completed` | task complete |

### Invoicing & payments

| Metric | Event | Emit point |
|--------|-------|------------|
| Invoices created | `metric.invoice.created` | invoice create |
| Invoice status changes | `metric.invoice.status_changed` | status update |
| Payments recorded | `metric.payment.recorded` | payment create |

### AI

| Metric | Event | Emit point |
|--------|-------|------------|
| Assistant requests | `metric.assistant.request` | conversation ask success path |
| Assistant failures | `metric.assistant.failure` | AI error |
| Assistant fallbacks | `metric.assistant.fallback` | local fallback |

### Billing & features

| Metric | Event | Emit point |
|--------|-------|------------|
| Plan changed | `metric.plan.changed` | `changePlan` success |
| Feature gate hit | `metric.feature.gated_hit` | `PlanUpgradeRequiredError` |

### Demo

| Metric | Event | Emit point |
|--------|-------|------------|
| Demo scenario viewed | `metric.demo.scenario_viewed` | demo switch API |
| Demo reset | `metric.demo.reset` | reset success |

### Files / import

| Metric | Event | Emit point |
|--------|-------|------------|
| File uploaded | `metric.file.uploaded` | upload success |
| Import success/failure | `metric.import.*` | future |

---

## 4. Standard dimensions

```ts
interface MetricDimensions {
  organizationId?: string;
  planCode?: string;
  industryPack?: string;
  feature?: string;
  source?: 'web' | 'api' | 'automation' | 'ai-service';
}
```

---

## 5. Feature usage by plan

Query pattern (future warehouse):

```sql
-- conceptual
SELECT plan_code, feature, COUNT(*)
FROM metric_events
WHERE message = 'metric.feature.gated_hit'
GROUP BY 1, 2;
```

Emit `feature` dimension on gate hits to see which plans hit which walls.

---

## 6. Dashboards (recommended)

| Dashboard | Audience | Metrics |
|-----------|----------|---------|
| Ops health | Engineering | error rate, readiness, AI availability |
| Product funnel | Product | signups, invoices, payments, assistant usage |
| Billing | Growth | plan changes, gate hits by plan |
| Demo | Sales | scenario views, resets |

---

## 7. Implementation status

| Metric | Defined | Emitted in code |
|--------|---------|-----------------|
| Assistant request/failure/fallback | ✅ | ✅ partial (AI paths) |
| Plan changed | ✅ | 🔲 wire in subscription.service |
| Invoice/customer/lead | ✅ | 🔲 wire incrementally |
| DAU/WAU rollup | ✅ | 🔲 batch job post-V1 |

**Rule for new features:** add `METRIC_EVENTS` row here before shipping.

→ [metrics/business-metrics-foundation.md](../metrics/business-metrics-foundation.md) · [event-ownership-matrix.md](../metrics/event-ownership-matrix.md)

---

## 8. API

```ts
import { METRIC_EVENTS, recordMetric } from '@/lib/logger';

recordMetric(METRIC_EVENTS.PAYMENT_RECORDED, {
  organizationId,
  planCode: 'STARTER',
  source: 'web',
});
```

---

## Related

- [event-taxonomy.md](./event-taxonomy.md)
- [observability-contract.md](./observability-contract.md)
