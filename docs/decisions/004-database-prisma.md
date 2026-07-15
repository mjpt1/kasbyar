# ADR-004: Database — PostgreSQL + Prisma

**Status:** Accepted

## Context

مدل کسب‌وکار غنی (۳۴+ entity)، روابط FK، نیاز به migration و seed.

## Decision

- PostgreSQL 16
- Prisma ORM، schema در `prisma/schema.prisma`
- Dev: `db push` برای سرعت
- Staging/prod: `db:migrate:deploy` با `CONFIRM_MIGRATE_DEPLOY=true`
- Soft delete: `deletedAt` روی Customer، Lead، Invoice
- Audit: `AuditEvent` جدا از `ActivityLog`

## Consequences

- seed در `prisma/seed/` با سناریوهای عمودی
- backup: `npm run db:backup` (pg_dump)

## Residual risks

- baseline migration history ممکن است در حال تکمیل باشد — قبل از prod اولین deploy migration را audit کنید

## Related

- [ADR-016](./016-prisma-migration-policy.md) — push vs migrate deploy
- [ADR-014](./014-audit-data-safety.md) — backup and soft delete
- [MIGRATIONS.md](../MIGRATIONS.md)
