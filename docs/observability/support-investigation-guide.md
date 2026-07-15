# Support & Investigation Guide — KesbYar

راهنمای عملی پشتیبانی و عیب‌یابی برای staging/production.

---

## 1. Information to collect from reporter

| Field | Example | Why |
|-------|---------|-----|
| Time (with timezone) | 2026-07-15 14:32 +0330 | log window |
| Environment | production / staging | config differs |
| `organizationId` | uuid | tenant filter |
| User role | ADMIN / STAFF | permission issues |
| `userId` | uuid | actor filter |
| `requestId` / correlation | if shown in UI/error ref | single request trace |
| Page URL / API route | `/invoices/...` | reproduce |
| Expected vs actual | one sentence | triage |

**Do not ask users to paste:** passwords, session cookies, full export files in chat.

---

## 2. Investigation workflow

```
1. Reproduce in staging (same plan/pack if possible)
2. Check readiness: GET /api/health/ready
3. Search logs (time + organizationId + message prefix)
4. Check AuditEvent in app (/settings/audit) for user actions
5. Classify: auth | tenant | plan | AI | validation | internal
6. Fix or document known limitation
```

---

## 3. Log search patterns

### By tenant

```text
organizationId="<uuid>"
```

### By error class

```text
message="api.unhandled"
message="exception.captured"
errorCategory="external_ai"
```

### By feature

```text
message="api.plan_upgrade_required"
message="intelligence.assistant.fallback"
message="api.tenant_scope_fail"
```

### Metrics (V1 log sink)

```text
kind="metric" message="metric.assistant.failure"
```

---

## 4. Common scenarios

### «Cannot see invoice / 404»

1. Confirm same `organizationId` as resource
2. Check soft-delete (`deletedAt`)
3. Search `api.tenant_scope_fail`
4. Manual: IDOR test with second org

### «Assistant not working»

1. `/api/health/ready` → `ai_service` field
2. Logs: `ai.request.failure` vs `intelligence.*.fallback`
3. Plan: `api.plan_upgrade_required`?
4. User sees degraded banner — expected if AI down

### «Upgrade / feature locked»

1. `settings/billing` current plan
2. Log `api.plan_upgrade_required` with `reason` / `suggestedPlan`
3. Confirm server `assertFeature` on route — not UI-only bug

### «Upload failed»

1. `file.upload.rejected` — reason mime vs size
2. `MAX_UPLOAD_SIZE_MB` env
3. Entity ownership — tenant-scope

### «Demo reset failed»

1. `DEMO_MODE`, `ALLOW_SEED`, `APP_ENV`
2. User role ADMIN?
3. Audit `demo.reset` event?

### «Wrong workspace data»

1. `workspace.selected` log around incident time
2. Cookie `kesbyar_org` — user switched org?
3. Not a tenant leak — UX confusion vs bug

---

## 5. Correlation fields

| Field | Set by | Propagate |
|-------|--------|-----------|
| `requestId` | API handler | all logs in handler via `logger.withRequest` |
| `correlationId` | same as requestId V1 | support ticket |
| `organizationId` | session | services |
| `userId` | session | audit + logs |

**Recommended handler pattern:**

```ts
const requestId = crypto.randomUUID();
const logCtx = logger.withRequest(requestId, logger.withOrg(session.organizationId, logger.withActor(session.user.id)));
logger.info(APP_LOG_EVENTS.SOME_EVENT, logCtx);
```

---

## 6. Audit vs logs for support

| Question | Use |
|----------|-----|
| Who deleted/archived X? | Audit UI |
| Why did server return 500? | App logs |
| How many errors today? | Metrics / log counts |
| What did user click? | Manual reproduce — no full clickstream V1 |

---

## 7. Escalation to engineering

Include:

- [ ] Staging reproduced? yes/no
- [ ] Log snippets (redacted)
- [ ] `requestId` if available
- [ ] Related `AUDIT_ACTIONS` entries
- [ ] Regression from release? git ref

Template: [test-plan-template.md](../templates/test-plan-template.md) for fix verification.

---

## 8. Post-incident

- Update [assumptions-residual-risks.md](../security/assumptions-residual-risks.md) if new accepted risk
- Add metric or log event if blind spot
- Add manual step to [manual-qa-checklist.md](../testing/manual-qa-checklist.md) if recurring

---

## Related

- [logging-policy.md](./logging-policy.md)
- [SECURITY_REVIEW.md](../SECURITY_REVIEW.md)
- [OPERATIONS.md](../OPERATIONS.md)
