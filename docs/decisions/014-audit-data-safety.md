# ADR-014: Audit Trail and Destructive-Action Safety

| Field | Value |
|-------|-------|
| **Status** | Accepted |
| **Date** | 2026 (V1 data safety phase) |
| **Domains** | data, ops, tenant |

## Context

B2B operators need traceability for sensitive actions. Developers need guardrails against accidental production reseed, restore, or migrate without confirmation.

## Decision

### Audit vs activity

| Concern | Model | Purpose |
|---------|--------|---------|
| Business timeline | `ActivityLog` | CRM narrative (customer, invoice, lead) |
| Security/ops | `AuditEvent` | login, settings, payments, archive, demo reset |

- Implementation: `apps/web/src/server/audit/`
- UI: `/settings/audit` (ADMIN+)
- API: `GET /api/audit`
- Metadata sanitized — no secrets (`sanitizeAuditMetadata`)

### Soft delete (not hard delete for core entities)

- `deletedAt` on Customer, Lead, Invoice
- Invoice archive only for DRAFT/CANCELLED
- Queries use `ACTIVE_RECORD_FILTER` ([ADR-003](./003-tenant-isolation.md))

### Destructive operation guards

Central pattern: `scripts/ops/destructive-guard.ts`

| Operation | Script | Production gate |
|-----------|--------|-----------------|
| Reseed | `db-reseed-guard.ts` | `ALLOW_SEED=true` |
| Reset DB | `db-reset-guard.ts` | `ALLOW_SEED=true` |
| Restore | `db-restore.ts` | `CONFIRM_RESTORE` / `ALLOW_RESTORE` |
| Migrate deploy | `db-migrate-deploy.ts` | `CONFIRM_MIGRATE_DEPLOY=true` |

### Backup direction

- `npm run db:backup` (pg_dump) — manual/scheduled ops responsibility
- Documented in [BACKUP_RESTORE.md](../BACKUP_RESTORE.md), [DATA_SAFETY.md](../DATA_SAFETY.md)
- No claim of SOC2/ISO certification in V1

### Tenant safety (with audit)

- IDOR → 404
- Destructive UI uses confirm patterns (`DestructiveActionButton` where applicable)

## Consequences

- New sensitive mutations should emit `AuditEvent`
- New destructive scripts must use destructive-guard
- Production checklist in [DATA_SAFETY.md](../DATA_SAFETY.md)

## Related

- [ADR-003](./003-tenant-isolation.md)
- [ADR-007](./007-deployment-runtime.md)
- [ADR-013](./013-demo-mode-isolation.md)

## Residual risks

- Not every mutation audited yet — expand incrementally
- No global Prisma middleware for tenant — service discipline + review
- Automated cloud backup not in repo — operator must schedule pg_dump
