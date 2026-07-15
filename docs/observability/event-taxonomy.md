# Event Taxonomy — KesbYar

نام‌گذاری یکپارچه برای app logs، audit actions، و metrics.

**Source of truth (code):**

- `packages/shared/src/observability/log-events.ts` — `APP_LOG_EVENTS`
- `packages/shared/src/audit/actions.ts` — `AUDIT_ACTIONS`
- `packages/shared/src/observability/metric-events.ts` — `METRIC_EVENTS`

---

## Naming conventions

| Channel | Pattern | Example |
|---------|---------|---------|
| App log | `domain.action[.detail]` | `api.unhandled` |
| Audit | `resource.verb` | `payment.create` |
| Metric | `metric.domain.name` | `metric.invoice.created` |

- lowercase
- dot-separated
- stable — تغییر نام = breaking change for dashboards

---

## App log events (`APP_LOG_EVENTS`)

### API
| Event | Meaning |
|-------|---------|
| `api.app_error` | Known AppError |
| `api.unhandled` | 500 path |
| `api.plan_upgrade_required` | Feature gated |
| `api.tenant_scope_fail` | FK/scope validation failed |

### Auth / workspace
| Event | Meaning |
|-------|---------|
| `workspace.selected` | User switched org |
| `auth.login_failed` | Failed login (no password in log) |

### AI
| Event | Meaning |
|-------|---------|
| `ai.request.start` | Outbound call begun |
| `ai.request.success` | HTTP OK |
| `ai.request.failure` | HTTP/logical fail |
| `ai.request.timeout` | Timeout |
| `intelligence.summary.fallback` | Local summary used |
| `intelligence.assistant.fallback` | Local assistant used |

### Automation
| Event | Meaning |
|-------|---------|
| `automation.run.start` | Org automation run |
| `automation.run.complete` | Finished |
| `automation.rule.failed` | Single rule error |

### Files
| Event | Meaning |
|-------|---------|
| `file.upload.rejected` | Size/MIME/path |
| `file.upload.success` | Stored |

### Ops
| Event | Meaning |
|-------|---------|
| `exception.captured` | captureException |
| `monitoring.sentry.*` | Bootstrap |
| `health.check.failed` | Readiness failure |

### Demo
| Event | Meaning |
|-------|---------|
| `demo.reset.attempt` | API called |
| `demo.reset.blocked` | Env guard |
| `demo.reset.failed` | Seed error — no success audit |

### Reliability
| Event | Meaning |
|-------|---------|
| `dependency.degraded` | Primary path failed; fallback used |

### Integrations
| Event | Meaning |
|-------|---------|
| `integration.provider.failed` | Adapter caught vendor error |
| `integration.not_configured` | Provider selected but secrets missing |
| `notification.queued` | Notification deferred (noop or async) |

→ [integrations/failure-normalization-guidelines.md](../integrations/failure-normalization-guidelines.md)

---

## Audit actions (`AUDIT_ACTIONS`)

| Action | Trigger |
|--------|---------|
| `auth.login` | Successful login |
| `auth.logout` | Logout |
| `auth.register` | New org signup |
| `settings.update` | Org settings |
| `customer.archive` | Soft delete customer |
| `invoice.status_change` | Status transition |
| `invoice.archive` | Archive invoice |
| `payment.create` | Payment recorded |
| `subscription.change` | Plan change |
| `membership.change` | Role/member |
| `demo.reset` | Demo data reset |
| `db.restore` | Restore (script) |

Entity types: `AUDIT_ENTITY_TYPES` — `User`, `Organization`, `Customer`, etc.

---

## Metric events (`METRIC_EVENTS`)

See [metrics-plan.md](./metrics-plan.md) for definitions and dimensions.

**V1 emission shape (log):**

```json
{
  "level": "info",
  "message": "metric.invoice.created",
  "kind": "metric",
  "organizationId": "...",
  "planCode": "STARTER",
  "timestamp": "..."
}
```

---

## Error categories (`ERROR_CATEGORIES`)

Used in log field `errorCategory` and support triage — see `error-taxonomy.ts`.

---

## Adding new events

1. Add constant to shared package
2. Document row in this file
3. Use constant in code — no ad-hoc strings
4. If user-visible security impact → consider matching `AUDIT_ACTIONS`
5. If business KPI → add `METRIC_EVENTS`
