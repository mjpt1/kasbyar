# Operator Response Guide — KesbYar

Playbook عملیات برای outage، degradation جزئی، و incidentهای پشتیبانی.

**مخاطب:** on-call engineer، ops، support lead  
**مرتبط:** [support-investigation-guide](../observability/support-investigation-guide.md) · [OPERATIONS.md](../OPERATIONS.md)

---

## 1. تشخیص سریع (5 دقیقه اول)

```
1. GET /api/health          → process alive?
2. GET /api/health/ready    → database + ai_service checks
3. Recent logs: search last 15m
   - health.check.failed
   - dependency.degraded
   - api.unhandled
   - demo.reset.failed
4. Sentry (if SENTRY_DSN set)
5. Identify: total outage vs partial degradation
```

| Symptom | Likely tier | User impact |
|---------|-------------|-------------|
| readiness 503 | Tier 0 DB | Full outage |
| readiness 200, ai degraded | Tier 2 | AI offline badge only |
| 402 spikes | entitlement | plan limits (expected) |
| automation.rule.failed | Tier 3 | single rule skipped |

---

## 2. Runbook: AI service down

**Signals:** `intelligence.*.fallback`, `ai.request.failure`, readiness `ai_service: unavailable`

| Step | Action |
|------|--------|
| 1 | Confirm web app loads (leads, invoices) |
| 2 | `curl $AI_SERVICE_URL/health` from web container/network |
| 3 | Check `AI_SERVICE_TOKEN` matches ai-service env |
| 4 | Review FastAPI logs / restart ai-service |
| 5 | Tune `AI_SERVICE_TIMEOUT_MS` if latency spike |
| 6 | Communicate: «دستیار هوشمند موقتاً در حالت آفلاین» — core OK |

**Do not:** disable web app or block CRM due to AI.

**Escalate if:** DB also failing or auth broken.

---

## 3. Runbook: Database unavailable

**Signals:** readiness `database: failed`, Prisma connection errors

| Step | Action |
|------|--------|
| 1 | Verify `DATABASE_URL` / network / RDS status |
| 2 | Connection count / pool exhaustion |
| 3 | Recent migration? `prisma migrate status` |
| 4 | Failover procedure per hosting provider |
| 5 | Status page / user comms: full maintenance |

**Escalate immediately** — Tier 0.

---

## 4. Runbook: Payment confirmation delayed

**Signals:** user report «پرداخت کردم ولی فعال نشد»

| Step | Action |
|------|--------|
| 1 | Audit trail: `payment.*` actions for org |
| 2 | Invoice/subscription status in DB |
| 3 | V1: manual reconcile in admin/billing |
| 4 | post-V1: PSP dashboard + webhook delivery log |
| 5 | Never mark paid without evidence |

**User message template:** «پرداخت شما در حال بررسی است. معمولاً تا X دقیقه تأیید می‌شود.»

---

## 5. Runbook: Import partial failure

📋 post-V1 — prepare now:

| Step | Action |
|------|--------|
| 1 | Locate import job id in logs |
| 2 | Download error report (row numbers) |
| 3 | Verify org scope — no cross-tenant rows |
| 4 | Re-import failed rows only |
| 5 | Audit count vs user-reported count |

---

## 6. Runbook: Demo reset failed

**Signals:** `demo.reset.failed`, user sees Persian 500 message

| Step | Action |
|------|--------|
| 1 | Verify `DEMO_MODE=true` AND `ALLOW_SEED=true` |
| 2 | Read seed error in server log (no success audit exists) |
| 3 | Run seed locally: `npm run db:seed` (staging only) |
| 4 | Confirm user data unchanged (no partial audit) |
| 5 | Retry reset after fix |

**Security:** `demo.reset.attempt` is security-logged — review if unexpected in prod.

---

## 7. Runbook: Backup failure

**Signals:** cron exit ≠ 0, missing fresh file in `BACKUP_DIR`

| Step | Action |
|------|--------|
| 1 | Check `pg_dump` installed / PATH |
| 2 | `PGPASSWORD` / `DATABASE_URL` credentials |
| 3 | Disk space in backup volume |
| 4 | Manual run: `npx tsx scripts/db-backup.ts` |
| 5 | Verify `.sql` + `.meta.json` created |
| 6 | Alert if > 24h without successful backup |

**Never:** run destructive scripts as backup recovery without [destructive-guard](../../scripts/ops/destructive-guard.ts).

---

## 8. Runbook: SMS / reminder delivery failure

📋 post-V1 dispatch

| Step | Action |
|------|--------|
| 1 | `Reminder` rows: `isSent=false`, past `remindAt` |
| 2 | Provider status / rate limits |
| 3 | User still sees in-app tasks/reminders |
| 4 | Retry queue or manual resend |
| 5 | Log `notification.sms.failed` when implemented |

**User impact:** notification delay only — not data loss.

---

## 9. Runbook: AI request timeout spike

**Signals:** `ai.request.timeout` rate ↑

| Step | Action |
|------|--------|
| 1 | p95 latency ai-service |
| 2 | Model/load on FastAPI workers |
| 3 | Increase `AI_SERVICE_TIMEOUT_MS` temporarily |
| 4 | Confirm fallbacks working (no 500 on summary API) |
| 5 | Scale ai-service replicas if sustained |

---

## 10. Runbook: Feature gating / wrong plan access

**Signals:** `api.plan_upgrade_required` or user «باید دسترسی داشته باشم»

| Step | Action |
|------|--------|
| 1 | `Subscription` for `organizationId` |
| 2 | Compare `planCode` vs feature matrix |
| 3 | Run `entitlement.policy.test.ts` expectations |
| 4 | If DB error → 500 (not silent unlock) |
| 5 | Fix subscription row; user refresh |

**Policy:** fail-closed on errors — fix data, don't bypass gates in prod.

---

## 11. Runbook: Admin action failure (staging/production)

**Signals:** 403 from destructive guard, `api.tenant_scope_fail`

| Step | Action |
|------|--------|
| 1 | Confirm `APP_ENV` / target environment |
| 2 | Audit: actor, org, action |
| 3 | destructive-guard message in logs |
| 4 | Re-run with correct env flags |
| 5 | post-incident: was action appropriate for prod? |

---

## 12. Automation run issues

**Signals:** `automation.rule.failed`

| Step | Action |
|------|--------|
| 1 | Identify `ruleId`, `ruleName`, `organizationId` |
| 2 | Other rules in same run — did they succeed? |
| 3 | Inspect trigger data (stale leads, due tasks) |
| 4 | Fix rule config or data edge case |
| 5 | Next run auto-retries |

---

## 13. Correlation fields

هنگام جستجو در logs، این فیلدها را ترکیب کنید:

| Field | Use |
|-------|-----|
| `organizationId` | tenant scope |
| `userId` | actor |
| `requestId` | single HTTP request |
| `ruleId` | automation |
| `dependency` | degradation |
| `planCode` | billing |

---

## 14. Severity classification

| Sev | Definition | Example | Response time |
|-----|------------|---------|---------------|
| **SEV1** | Tier 0 down | DB unavailable | immediate |
| **SEV2** | Tier 1 impaired | payments stuck widespread | < 1h |
| **SEV3** | Tier 2 degraded | AI fallback only | < 4h |
| **SEV4** | Tier 3 / single tenant | one automation rule | next business day |

---

## 15. Post-incident

- [ ] Timeline in incident doc
- [ ] Update [failure-mode-catalog](./failure-mode-catalog.md) if new mode
- [ ] Add ADR if architecture change
- [ ] User comms if trust-impacting
- [ ] Verify `npm run verify` after fix

---

## 16. Quick reference — log events

| Event | First look |
|-------|------------|
| `dependency.degraded` | which dependency field |
| `demo.reset.failed` | seed stack |
| `automation.rule.failed` | ruleId |
| `ai.request.timeout` | AI_SERVICE_URL reachability |
| `health.check.failed` | readiness JSON |
| `api.tenant_scope_fail` | security — possible abuse |
| `file.upload.rejected` | MIME/size |

Full taxonomy: [event-taxonomy](../observability/event-taxonomy.md)
