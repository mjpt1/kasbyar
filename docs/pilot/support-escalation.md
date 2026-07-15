# Support Escalation — Pilot

**For:** KesbYar support + CS

---

## Severity guide

| Sev | Examples | Response |
|-----|----------|----------|
| **SEV1** | cannot login all users، data visible cross-tenant، DB down | immediate engineering |
| **SEV2** | cannot create invoice، payment wrong amount in DB | < 4h business hours |
| **SEV3** | AI degraded، automation rule failed | next business day |
| **SEV4** | UI polish، feature request | backlog |

---

## Triage questions

1. `organizationId` / company name?
2. User role (OWNER/ADMIN/STAFF)?
3. Exact URL path?
4. Persian error message text?
5. Screenshot + time (timezone Asia/Tehran)?
6. Repro steps 1-2-3?

---

## Where to look (internal)

| Issue | Check |
|-------|-------|
| Auth | session cookie، `auth.login_failed` logs |
| Plan block | 402 — `subscription` row، `planCode` |
| AI | `intelligence.*.fallback` — [operator-response-guide](../reliability/operator-response-guide.md) |
| Upload | `file.upload.rejected` |
| Tenant | `api.tenant_scope_fail` — **security** |

---

## Escalation path

```
Customer ADMIN
  → CS (ticket)
    → Engineering on-call (SEV1/2)
      → Post-incident doc if trust impact
```

---

## Customer communication

- Acknowledge in Persian within SLA
- No blame — factual status
- For SEV1: hourly update until resolved
- Share workaround if core app usable (e.g. AI offline)

---

## After resolution

- [ ] Root cause in internal notes
- [ ] Update KNOWN_LIMITATIONS if new gap
- [ ] `POST_LAUNCH_PRIORITIES` if product fix needed
