# ADR-016: Prisma Migration Policy

| Field | Value |
|-------|-------|
| **Status** | Accepted |
| **Date** | 2026 |
| **Domains** | data, ops |
| **Related** | Extends [ADR-004](./004-database-prisma.md) (ORM choice) |

## Context

Development speed favors schema iteration; production requires reproducible, reviewable schema changes. Using only `db push` in prod is unsafe; using only migrations in local dev slows iteration.

## Decision

### Environments

| Environment | Primary tool | Notes |
|-------------|--------------|-------|
| **Local dev** | `npm run db:push` | Fast iteration; seed via `db:seed` / `db:reseed` |
| **CI** | `db:generate` only | Tests use generated client; no live migrate in default CI job |
| **Staging / Production** | `npm run db:migrate:deploy` | Requires `CONFIRM_MIGRATE_DEPLOY=true` |

### Rules

1. **Schema source of truth:** `prisma/schema.prisma` at repo root
2. **Before production cut:** migration files committed; history audited ([MIGRATIONS.md](../MIGRATIONS.md))
3. **Destructive changes** (drop column/table): explicit rollback plan + backup (`db:backup`) before deploy
4. **Seed never runs automatically in production** — `ALLOW_SEED=false` default ([ADR-007](./007-deployment-runtime.md))
5. **`prisma generate`** runs on `postinstall` and in CI before build
6. **Review:** schema PRs use [quality review checklist — schema](../quality/review-checklists.md#3-schema--database-changes)

### What we do not do in V1

- Automatic migrate on app boot in production
- Per-tenant schema isolation
- Blue/green migration automation in repo

## Consequences

- Developers may have local DB state from push that differs from migration SQL — reseed or reset when joining team
- Ops owns scheduling backup before `migrate:deploy`
- Gap: baseline migration history may still be maturing — track in KNOWN_LIMITATIONS until first prod deploy

## Related

- [MIGRATIONS.md](../MIGRATIONS.md)
- [BACKUP_RESTORE.md](../BACKUP_RESTORE.md)
- [ADR-014](./014-audit-data-safety.md)

## Residual risks

- Drift between push-based dev DB and migration SQL if developers skip `migrate dev` before prod
- Long-running migrations on large tables need manual planning — not automated
