# Logging Policy — KesbYar

سیاست عملی لاگ‌گذاری برای web، shared helpers، و AI service.

---

## 1. What must be logged

| Category | Examples | Level |
|----------|----------|-------|
| Unhandled errors | `exception.captured`, `api.unhandled` | error |
| Expected app errors | `api.app_error` with code | warn |
| Plan gating | `api.plan_upgrade_required` | warn |
| Tenant violations | `api.tenant_scope_fail` | warn |
| Auth failures (aggregate) | `auth.login_failed` — no password | warn |
| Workspace switch | `workspace.selected` | info |
| AI degradation | `intelligence.*.fallback`, `ai.request.failure` | warn |
| AI success (sampled optional) | `ai.request.success` | info/debug |
| Upload rejected | `file.upload.rejected` + reason | warn |
| Demo reset | audit + `demo.reset.attempt` | info/warn |
| Billing transition | audit `subscription.change` + metric | audit + metric |
| Destructive scripts | console from guards — not app log | stderr |
| Health failure | readiness 503 path | warn |
| Startup misconfig | ALLOW_SEED in prod | warn |

---

## 2. What must never be logged

| Data | Reason |
|------|--------|
| `SESSION_SECRET`, `AI_SERVICE_TOKEN`, API keys | credential leak |
| Password plaintext or hash | credential |
| Full cookie / Authorization header | session hijack |
| Full credit card / Sheba if added | PCI/privacy |
| Full AI user question + operational context blob | PII + injection surface |
| Full AI model response | may contain echoed PII |
| Email in high-volume debug loops | prefer `userId` |
| National ID, addresses in bulk | minimize PII |
| Raw SQL with parameter values | may contain PII |

---

## 3. Workspace identifiers safely

```ts
logger.info(event, logger.withOrg(organizationId));
// ✅ organizationId: UUID from session
// ❌ organizationName, slug in high-volume logs
```

- **OK:** `organizationId` (internal UUID)
- **Sparingly:** `organizationSlug` in low-volume admin/debug only
- **Never:** cross-tenant slug in same log line without org id

---

## 4. Actor / user identifiers safely

```ts
logger.info(event, logger.withActor(userId, { role: 'ADMIN' }));
// ✅ userId UUID
// ❌ email, phone, name in routine logs
```

Audit UI may show user name/email from DB join — that is **admin-only**, not stdout log stream.

---

## 5. Avoiding secret / payload leaks

- Use `sanitizeLogRecord()` / shared `SENSITIVE_LOG_KEYS`
- Truncate strings > 500 chars
- Log `error.message` not full `error` object with nested config
- `captureException` — stack in server log only; never to API client

---

## 6. Domain-specific rules

### Imports (future)

- Log: row count, success/fail count, `organizationId`, import job id
- Never: full CSV row content

### Destructive actions

- **DB scripts:** guard messages to stderr; production block
- **App:** customer/invoice archive → `logAudit` + activity
- **Demo reset:** `AUDIT_ACTIONS.DEMO_RESET` + metric `metric.demo.reset`

### Plan changes

- Audit: `SUBSCRIPTION_CHANGE` with `{ fromPlan, toPlan }` in metadata (no payment PAN)
- Metric: `metric.plan.changed`
- App log: `billing.plan_change` at info

### AI failures

- Log: `operation`, `latencyMs`, `statusCode`, `errorCode`, `organizationId`
- Metric: `metric.assistant.failure`
- Never: question text in production `info`/`warn`

### Tenant-scope failures

- `logTenantScopeFailure({ reason, entityType, entityId, organizationId })`
- Do not log the **other** tenant's id if known — only acting org + target entity id

### Billing transitions

- Audit trail primary
- App log for provider errors only

---

## 7. Log levels

| Level | Use |
|-------|-----|
| debug | dev-only verbose (disabled prod default) |
| info | normal ops, metrics, successful workspace select |
| warn | handled errors, fallbacks, gating, rejections |
| error | unhandled, exception.captured |

`LOG_LEVEL` env — production default `info` ([OPERATIONS.md](../OPERATIONS.md)).

---

## 8. AI service (Python)

- JSON-ish single line format
- Log route, status, duration
- No request body in info logs
- Token values never logged

---

## 9. Implementation reference

| Component | Path |
|-----------|------|
| Redaction | `packages/shared/src/observability/sanitize.ts` |
| App events | `packages/shared/src/observability/log-events.ts` |
| Web logger | `apps/web/src/lib/logger.ts` |
| Helpers | `apps/web/src/lib/observability.ts` |
| Audit sanitize | `server/audit/audit.service.ts` |

---

## 10. Review checklist (PR)

- [ ] New log lines use `APP_LOG_EVENTS` constants
- [ ] `organizationId` / `userId` only — no email
- [ ] No secrets in context keys or values
- [ ] Sensitive user action has `logAudit` where appropriate
