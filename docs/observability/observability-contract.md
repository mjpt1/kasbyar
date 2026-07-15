# Observability Contract — KesbYar

قرارداد repository-level برای diagnosability، پشتیبانی، و عملیات در محیط واقعی.

---

## 1. App logs

**هدف:** رفتار runtime، خطاها، degradation — برای مهندس و SRE.

| Field | Required | Notes |
|-------|----------|-------|
| `level` | yes | debug \| info \| warn \| error |
| `message` | yes | از `APP_LOG_EVENTS` — [event-taxonomy.md](./event-taxonomy.md) |
| `timestamp` | yes | ISO-8601 |
| `service` | yes | `kesbyar-web` \| `kesbyar-ai` |
| `environment` | yes | `APP_ENV` |
| `organizationId` | when scoped | UUID — نه slug |
| `userId` | when actor known | UUID — نه email |
| `requestId` / `correlationId` | recommended API | برای همبستگی |
| `errorCategory` | on errors | از `ERROR_CATEGORIES` |

**Implementation:** `apps/web/src/lib/logger.ts` — production = one JSON line per entry.

**Must log:** unhandled exceptions، AI fallback، plan gate hits، tenant-scope failures، demo reset attempts، upload rejections.

**Must not log:** passwords، tokens، full AI prompts/responses، payment card data، raw national ID.

---

## 2. Audit logs

**هدف:** trail حسابرسی tenant برای مدیر — «چه کسی چه کرد».

| Property | Value |
|----------|--------|
| Storage | PostgreSQL `AuditEvent` |
| Actions | `AUDIT_ACTIONS` in `@kesbyar/shared` |
| UI | `/settings/audit` (ADMIN+) |
| vs Activity | `ActivityLog` = CRM timeline؛ `AuditEvent` = security/ops |

**Must audit:** login/register، settings change، payment create، invoice status/archive، customer archive، plan change، demo reset.

**Metadata:** `sanitizeAuditMetadata` — same rules as app log redaction.

---

## 3. Security-sensitive events

دو مسیر همزمان:

1. **App log** (`SECURITY_LOG_EVENTS`) — real-time ops
2. **Audit** (where user action) — durable trail

Examples: `demo.reset`، `api.tenant_scope_fail`، `file.upload.rejected`، failed privilege escalation.

→ [security/logging-policy overlap](../security/assumptions-residual-risks.md)

---

## 4. Background job / async task logs

**V1 scope:** automation run (`POST /api/automation/run`) — not a separate worker yet.

| Event | When |
|-------|------|
| `automation.run.start` | begin org run |
| `automation.run.complete` | summary count |
| `automation.rule.failed` | per-rule error |

**Future:** queue workers must include `organizationId`, `jobId`, `correlationId` on every line.

---

## 5. AI service request/response tracing

**Principles:**

- Log **operation name**, `organizationId`, latency, HTTP status, error code
- **Never** log full prompt, full context JSON, or model response body in production
- Web → AI: internal token header only in env — not in logs
- Fallback: `intelligence.*.fallback` + `metric.assistant.fallback`
- AI service (Python): request id in access log — no PII in message field

**Helpers:** `logAiRequestOutcome()` in `lib/observability.ts`

---

## 6. Deployment / health logs

| Probe | Path | Logs |
|-------|------|------|
| Liveness | `/api/health` | no DB — minimal JSON |
| Readiness | `/api/health/ready` | DB fail → orchestrator 503 |
| AI liveness | `/health` (FastAPI) | structured Python log |

Startup: `validateServerEnvAtStartup` warnings for `ALLOW_SEED`, `DEMO_MODE` in prod.

Monitoring bootstrap: `initMonitoring()` — Sentry DSN presence logged once.

---

## 7. Business KPI events

**V1:** `recordMetric(METRIC_EVENTS.*)` → structured log with `kind: 'metric'`.

**Post-V1:** export to PostHog / GA / internal warehouse — names stable in `metric-events.ts`.

Categories: workspaces/users active، invoices/payments، leads، assistant usage، plan/feature gates، demo، imports، error rates.

→ [metrics-plan.md](./metrics-plan.md)

---

## 8. Support / debug correlation

| ID | Source | Use |
|----|--------|-----|
| `requestId` | API handler (generate UUID) | tie log lines one request |
| `correlationId` | same as requestId V1 | support ticket paste |
| `organizationId` | session | tenant filter in logs |
| `userId` | session | actor filter |
| `timestamp` | all entries | time window search |

**Support workflow:** [support-investigation-guide.md](./support-investigation-guide.md)

---

## Error classification

API `code` + log `errorCategory` align with `ERROR_CATEGORIES`:

`auth` · `authorization` · `tenant` · `validation` · `not_found` · `plan_gating` · `external_ai` · `internal`

User-facing message: Persian generic — details only in logs.

---

## Compliance stance

Product-level audit and logging — **not** SOC2/ISO certification. Retention and access control are operator responsibilities.

---

## Related

- [logging-policy.md](./logging-policy.md)
- [DATA_SAFETY.md](../DATA_SAFETY.md)
- [ADR-014](../decisions/014-audit-data-safety.md)
