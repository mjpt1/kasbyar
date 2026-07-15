# Business Metrics Foundation — KesbYar

**وضعیت:** V1 foundation — log-as-metric transport  
**مالک:** Product + Growth  
**کد:** `packages/shared/src/metrics/kpi-definitions.ts` · `METRIC_EVENTS`

---

## 1. Purpose

تعریف **KPIهای سلامت محصول و تجاری** قبل از اتصال PostHog/warehouse — نام‌گذاری پایدار، مالکیت روشن، نقطه emit مشخص.

---

## 2. Principles

| Principle | Detail |
|-----------|--------|
| Names stable | `METRIC_EVENTS` — rename = migration |
| Server truth | emit after successful mutation |
| Tenant dimension | always `organizationId` when applicable |
| Plan dimension | `planCode` on commercial events |
| Pack dimension | `industryPack` on vertical events |
| V1 transport | `recordMetric()` → log `kind: 'metric'` |
| V2 transport | same event names → analytics adapter |

---

## 3. KPI catalog

| KPI | Metric event | Cadence | Owner |
|-----|--------------|---------|-------|
| Active workspaces (daily) | `metric.workspace.active_daily` | daily | product |
| Activated pilot workspaces | `metric.workspace.pilot_activated` | realtime | customer_success |
| DAU | `metric.user.active_daily` | daily | product |
| WAU | `metric.user.active_weekly` | weekly | product |
| Leads created | `metric.lead.created` | realtime | product |
| Invoices created | `metric.invoice.created` | realtime | product |
| Invoices paid | `metric.invoice.paid` | realtime | growth |
| Payments recorded | `metric.payment.recorded` | realtime | growth |
| Assistant usage | `metric.assistant.request` | realtime | product |
| Assistant failure rate | `metric.assistant.failure` ÷ request | daily | engineering |
| Feature usage by plan | `metric.feature.used` + `planCode` | daily | product |
| Feature gate hits | `metric.feature.gated_hit` | realtime | growth |
| Demo → pilot conversion | `metric.pilot.demo_conversion` | realtime | growth |
| Pack adoption | `metric.pack.enabled` | realtime | product |
| Retention (directional) | WAU trend / cohort post-V1 | weekly | customer_success |

Code mirror: `KPI_CATALOG` in shared.

---

## 4. Derived metrics (compute in rollup)

| Metric | Formula |
|--------|---------|
| Assistant failure rate | `count(assistant.failure) / count(assistant.request)` per day |
| Invoice paid rate | `invoice.paid / invoice.created` per org cohort |
| Pilot activation rate | `pilot_activated / pilot_invited` |
| Pack adoption rate | `pack.enabled / active workspaces` by pack |

V1: manual spreadsheet or log queries — batch job post-pilot.

---

## 5. Emit guidelines

```ts
import { METRIC_EVENTS, recordMetric } from '@/lib/logger';

// After successful create
recordMetric(METRIC_EVENTS.INVOICE_CREATED, {
  organizationId,
  planCode: 'BUSINESS',
  source: 'web',
});

// Feature usage (not gate hit)
recordMetric(METRIC_EVENTS.FEATURE_USED, {
  organizationId,
  planCode,
  feature: 'reports',
});

// Pilot milestone (CS workflow until automated)
recordMetric(METRIC_EVENTS.WORKSPACE_PILOT_ACTIVATED, {
  organizationId,
  planCode,
});
```

---

## 6. Implementation status

| Event | Defined | Wired in code |
|-------|---------|---------------|
| `assistant.*` | ✅ | ✅ partial |
| `plan.changed` | ✅ | ✅ subscription.service |
| `invoice.created` | ✅ | 🔲 wire invoice.service |
| `invoice.paid` | ✅ | 🔲 wire status change |
| `payment.recorded` | ✅ | 🔲 wire payment.service |
| `lead.created` | ✅ | 🔲 wire lead.service |
| `feature.used` | ✅ | 🔲 incremental |
| `workspace.pilot_activated` | ✅ | 🔲 CS manual / future API |
| `pilot.demo_conversion` | ✅ | 🔲 manual |
| `pack.enabled` | ✅ | 🔲 org settings |
| DAU/WAU rollup | ✅ | 🔲 batch job |

**Rule:** add to `METRIC_EVENTS` + this doc + [event-ownership-matrix](./event-ownership-matrix.md) before shipping feature.

---

## 7. Dashboards (recommended)

| Dashboard | KPIs |
|-----------|------|
| Pilot health | pilot_activated, DAU, invoices, assistant usage |
| Commercial | plan.changed, gated_hit, demo_conversion |
| Product core | leads, invoices, payments |
| Engineering | assistant failure rate, api.error |

---

## 8. Privacy

- No PII in metric properties (no email, phone, national id)
- `organizationId` is internal UUID — OK for ops
- Align with [data-retention-policy](../data/data-retention-policy.md)

---

## Related

- [event-ownership-matrix.md](./event-ownership-matrix.md)
- [observability/metrics-plan.md](../observability/metrics-plan.md)
- [analytics adapter](../../apps/web/src/lib/analytics/analytics.adapter.ts)
