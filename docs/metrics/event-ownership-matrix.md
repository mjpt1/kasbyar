# Event Ownership Matrix — KesbYar

**مالکیت:** هر event دقیقاً یک تیم owner دارد.  
**کد:** `packages/shared/src/metrics/event-ownership.ts`

---

## How to read

| Column | Meaning |
|--------|---------|
| **Event** | `METRIC_EVENTS` constant value |
| **Owner** | team accountable for definition + quality |
| **Emitter** | code path that fires event |
| **Consumer** | dashboard, ops, or downstream |
| **KPI** | linked `KPI_IDS` entry |

---

## Metrics

| Event | Owner | Emitter | Consumer | KPI |
|-------|-------|---------|----------|-----|
| `metric.workspace.active_daily` | product | batch rollup | engagement dashboard | kpi.workspace.active_daily |
| `metric.workspace.pilot_activated` | customer_success | pilot completion | pilot tracker | kpi.workspace.pilot_activated |
| `metric.user.active_daily` | product | session / rollup | DAU | kpi.user.dau |
| `metric.user.active_weekly` | product | rollup | WAU / retention | kpi.user.wau |
| `metric.lead.created` | product | lead.service | funnel | kpi.lead.created |
| `metric.invoice.created` | product | invoice.service | revenue funnel | kpi.invoice.created |
| `metric.invoice.paid` | growth | invoice PAID transition | commercial | kpi.invoice.paid |
| `metric.payment.recorded` | growth | payment.service | cash | kpi.payment.recorded |
| `metric.assistant.request` | product | conversation API | AI adoption | kpi.assistant.usage |
| `metric.assistant.failure` | engineering | ai client | reliability | kpi.assistant.failure_rate |
| `metric.assistant.fallback` | engineering | intelligence.service | degradation | — |
| `metric.feature.used` | product | domain services | plan usage | kpi.feature.usage_by_plan |
| `metric.feature.gated_hit` | growth | PlanUpgradeRequiredError | upgrade ops | — |
| `metric.plan.changed` | growth | subscription.service | MRR proxy | — |
| `metric.pilot.demo_conversion` | growth | CS / signup | sales funnel | kpi.pilot.demo_conversion |
| `metric.pack.enabled` | product | org pack settings | vertical adoption | kpi.pack.adoption |
| `metric.demo.scenario_viewed` | growth | demo API | sales | — |
| `metric.demo.reset` | ops | demo reset success | demo env | — |
| `metric.file.uploaded` | product | file.service | storage usage | — |
| `metric.api.error` | engineering | api error handler | SRE | — |

---

## App logs (cross-reference)

Not metrics — see [event-taxonomy.md](../observability/event-taxonomy.md).

| Event | Owner |
|-------|-------|
| `api.unhandled` | engineering |
| `integration.provider.failed` | engineering |
| `automation.rule.failed` | engineering |
| `billing.plan_change` | growth |

---

## Audit events

| Action | Owner |
|--------|-------|
| `payment.create` | growth + security |
| `subscription.change` | growth |
| `auth.login` | security |
| `demo.reset` | security |

Full list: `packages/shared/src/audit/actions.ts`

---

## Adding a new event

1. Choose owner team from: product | growth | engineering | customer_success | ops
2. Add `METRIC_EVENTS` constant
3. Add row here + `EVENT_OWNERSHIP` in code
4. Add KPI to `KPI_CATALOG` if business-facing
5. PR review: product owner approves definition

---

## RACI (summary)

| Activity | Product | Growth | Engineering | CS |
|----------|---------|--------|-------------|-----|
| Define KPI | A | C | C | C |
| Implement emit | C | C | R | I |
| Dashboard | A | R | R | R |
| Pilot metrics | C | C | I | A |

R = responsible, A = accountable, C = consulted, I = informed
