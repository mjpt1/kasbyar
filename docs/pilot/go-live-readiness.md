# Go-Live Readiness — Pilot Workspace

**Gate:** all items required before customer receives login.

---

## Product & commercial

- [ ] Pilot agreement / LOI signed (commercial assumption documented)
- [ ] Plan and trial dates set in DB
- [ ] Pricing gates tested (`assertFeature` for sold features)
- [ ] `pilot-known-limitations.md` approved for send

---

## Technical

- [ ] `npm run ci` green on deployed commit
- [ ] `/api/health/ready` → database ok
- [ ] AI health ok OR fallback documented if AI sold
- [ ] No `DEMO_MODE` on customer production org
- [ ] `ALLOW_SEED=false` production
- [ ] Backup run in last 7 days ([BACKUP_RESTORE.md](../BACKUP_RESTORE.md))

---

## Security

- [ ] `SESSION_SECRET` production strength
- [ ] ADMIN accounts use strong passwords
- [ ] Tenant isolation smoke: cross-org ID returns 404
- [ ] [tenant-safety-checklist.md](../security/tenant-safety-checklist.md) spot-check

---

## Operations

- [ ] On-call rotation aware of pilot date
- [ ] Kill switches off (documented)
- [ ] Support escalation path shared internally
- [ ] `organizationId` in pilot tracker

---

## Data & retention

- [ ] [data-retention-policy.md](../data/data-retention-policy.md) acknowledged internally
- [ ] No test junk data in org
- [ ] Audit logging verified (login creates audit)

---

## Metrics baseline

- [ ] Emit path for `metric.workspace.pilot_activated` agreed
- [ ] Baseline captured: user count, plan, pack

---

## Sign-off

| Role | Name | Date |
|------|------|------|
| CS lead | | |
| Engineering | | |
| Ops | | |

**Only after sign-off:** send [operator-quickstart.md](./operator-quickstart.md) to customer.
