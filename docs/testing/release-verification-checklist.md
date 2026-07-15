# Release Verification Checklist — KesbYar

تأیید تست **پس از deploy** — مکمل [templates/release-readiness.md](../templates/release-readiness.md) (ops/env). تمرکز این سند: **smoke functional + security**.

---

## When to run

| Cut type | Staging | Production |
|----------|---------|------------|
| Feature branch preview | optional | — |
| Staging cut | **required** | — |
| Pilot / production | after staging pass | **required** |

---

## 1. Automated (before deploy)

- [ ] `npm run ci` green on release ref
- [ ] `npm run test:security` green
- [ ] Migration applied on staging first (if schema changed)
- [ ] Backup taken before prod migrate ([BACKUP_RESTORE.md](../BACKUP_RESTORE.md))

---

## 2. Staging smoke (functional)

| # | Step | Pass |
|---|------|------|
| 1 | `GET /api/health` → 200 | ☐ |
| 2 | `GET /api/health/ready` → 200 (DB ok) | ☐ |
| 3 | Login `demo@kesbyar.ir` | ☐ |
| 4 | Select workspace `demo-general` | ☐ |
| 5 | Open dashboard — stats load | ☐ |
| 6 | Customers list — not empty (seed) | ☐ |
| 7 | Open one invoice detail | ☐ |
| 8 | RTL layout acceptable | ☐ |

### If AI enabled on staging

| # | Step | Pass |
|---|------|------|
| 9 | `GET /api/ai/health` or intelligence status | ☐ |
| 10 | Conversation question (plan with assistant) | ☐ |

### If billing touched

| # | Step | Pass |
|---|------|------|
| 11 | `/settings/billing` loads | ☐ |
| 12 | Locked feature shows upgrade on FREE org | ☐ |

---

## 3. Staging security smoke

→ [SECURITY_REVIEW.md](../SECURITY_REVIEW.md)

- [ ] Cross-org invoice URL → 404
- [ ] Staff cannot open audit
- [ ] Demo reset works only with flags + ADMIN
- [ ] Upload oversize rejected

---

## 4. Production smoke (post-deploy, read-only bias)

| # | Step | Pass |
|---|------|------|
| 1 | Health endpoints | ☐ |
| 2 | Login real/pilot user (not shared demo password in prod unless intended) | ☐ |
| 3 | Dashboard load | ☐ |
| 4 | One list + one detail read | ☐ |
| 5 | **No** reseed/reset/demo wipe attempted | ☐ |
| 6 | `ALLOW_SEED` confirmed false | ☐ |
| 7 | Error page — no stack trace to user | ☐ |

**Duration target:** &lt; 15 minutes for core smoke.

---

## 5. Rollback verification (if deploy failed)

- [ ] Rollback procedure executed
- [ ] Health green on previous version
- [ ] Login smoke on rolled-back build
- [ ] Incident noted with ref + time

---

## 6. Sign-off

| Role | Name | Date | Staging OK | Prod OK |
|------|------|------|------------|---------|
| Engineering | | | ☐ | ☐ |
| QA / owner | | | ☐ | ☐ |

**Release status:** ☐ Go ☐ No-go

**No-go reasons:**

---

## 7. Related

- [release-readiness.md](../templates/release-readiness.md)
- [manual-qa-checklist.md](./manual-qa-checklist.md) — full QA (pre-release)
- [V1_LAUNCH.md](../V1_LAUNCH.md)
