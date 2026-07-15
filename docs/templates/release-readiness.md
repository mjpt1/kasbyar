# Release Readiness — [VERSION / CUT NAME]

> مرجع: [definition-of-done.md](../quality/definition-of-done.md) — release level

**Target:** ☐ Pilot ☐ Staging ☐ Production  
**Date:**  
**Release owner:**  
**Git ref / tag:**  

---

## Pre-flight

| Item | Status | Notes |
|------|--------|-------|
| `npm run ci` green on release branch | ☐ | |
| All phase gates for scope complete | ☐ | |
| [QA_CHECKLIST.md](../QA_CHECKLIST.md) executed | ☐ | |
| [SECURITY_REVIEW.md](../SECURITY_REVIEW.md) smoke | ☐ | |
| [KNOWN_LIMITATIONS.md](../KNOWN_LIMITATIONS.md) current | ☐ | |

---

## Environment (production)

| Variable | Set | Verified |
|----------|-----|----------|
| `DATABASE_URL` | ☐ | |
| `SESSION_SECRET` (strong, unique) | ☐ | |
| `NEXT_PUBLIC_APP_URL` | ☐ | |
| `APP_ENV=production` | ☐ | |
| `ALLOW_SEED=false` | ☐ | |
| `DEMO_MODE` intentional | ☐ | |
| AI service URL (if used) | ☐ / N/A | |

---

## Database

- [ ] Backup taken: `npm run db:backup`
- [ ] Migration plan: push / migrate deploy documented
- [ ] Rollback: restore procedure tested or documented

---

## Deploy verification

| Step | Result |
|------|--------|
| `/api/health` | ☐ |
| `/api/health/ready` | ☐ |
| Login smoke | ☐ |
| Core flow (invoice or customer) | ☐ |
| RTL dashboard | ☐ |

---

## Rollback plan

1. 
2. 

---

## Sign-off

| Role | Name | Date |
|------|------|------|
| Engineering | | |
| Product / owner | | |

**Go / no-go:** ☐ Go ☐ No-go

**No-go blockers:**
