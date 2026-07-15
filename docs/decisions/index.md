# Decision Log Index — KesbYar

مرجع سریع همه ADRها. برای راهنمای نوشتن ADR جدید: [README.md](./README.md).

**Legend:** 🏗 architecture · 🔐 auth · 🏢 tenant · 💾 data · 🤖 ai · 💳 billing · 🎭 demo · 🚀 ops · 🎨 product

---

## Active decisions (Accepted)

| ADR | Title | Status | Domains | Primary code / docs |
|-----|-------|--------|---------|---------------------|
| [001](./001-monorepo-structure.md) | Monorepo structure and app boundaries | Accepted | 🏗 | `apps/*`, `packages/*`, `prisma/` |
| [002](./002-session-auth.md) | Session + cookie auth model | Accepted | 🔐 | `lib/auth/`, `middleware.ts` |
| [003](./003-tenant-isolation.md) | Workspace-aware multi-tenant isolation | Accepted | 🏢 | `server/tenant/tenant-scope.ts` |
| [004](./004-database-prisma.md) | PostgreSQL + Prisma as data layer | Accepted | 💾 | `prisma/schema.prisma` |
| [005](./005-ai-service-contract.md) | AI service HTTP contract + fallback | Accepted | 🤖 | `lib/ai/`, `apps/ai-service/` |
| [006](./006-billing-feature-gating.md) | Pricing/gating centralization | Accepted | 💳 | `packages/shared/src/billing/`, `entitlement.service.ts` |
| [007](./007-deployment-runtime.md) | Deployment and runtime assumptions | Accepted | 🚀 | `deploy/`, `docker/`, health routes |
| [008](./008-integration-adapters.md) | External integration adapters | Accepted | 🏗 | `storage.adapter.ts`, billing providers |
| [009](./009-repository-awareness.md) | Repository awareness layer | Accepted | 🏗 | `docs/engineering/*` |
| [010](./010-quality-enforcement.md) | Quality enforcement framework | Accepted | 🏗 | `docs/quality/`, PR template |
| [011](./011-persian-rtl-first.md) | Persian-first and RTL-first product | Accepted | 🎨 | `packages/shared` jalali/format, UI RTL |
| [012](./012-vertical-pack-extension.md) | Vertical pack extension model | Accepted | 🏗 🎨 | `packages/shared/src/packs/`, `server/packs/` |
| [013](./013-demo-mode-isolation.md) | Demo mode isolation from production | Accepted | 🎭 | `lib/demo.ts`, `server/demo/` |
| [014](./014-audit-data-safety.md) | Audit trail + destructive-action safety | Accepted | 💾 🚀 | `server/audit/`, `scripts/ops/` |
| [015](./015-application-ai-split.md) | Next.js app vs FastAPI AI split | Accepted | 🏗 🤖 | `apps/web`, `apps/ai-service` |
| [016](./016-prisma-migration-policy.md) | Prisma migration policy (dev vs prod) | Accepted | 💾 🚀 | `MIGRATIONS.md`, migrate scripts |

---

## By domain (quick lookup)

### Architecture & boundaries
- **001** Monorepo — web, AI, shared, prisma root
- **008** Integration adapters — swap providers without service churn
- **009** Repository awareness — extend vs rewrite
- **010** Quality gates — DoD + review checklists
- **012** Vertical packs — registry + one pack per org
- **015** App/AI split — system of record vs inference

### Auth & tenant
- **002** Session cookies, workspace selection, bcrypt
- **003** `organizationId` discipline, tenant-scope FK checks

### Data & safety
- **004** Prisma schema, soft delete, audit vs activity
- **014** Audit events, destructive guards, backup direction
- **016** `db push` dev vs `migrate deploy` prod

### AI
- **005** Token auth, shared types, fallback, no direct DB writes
- **015** Runtime boundary (complements 005)

### Billing & product
- **006** `plans.ts` single source, server enforcement
- **011** Persian copy, Jalali, RTL layout defaults

### Demo & ops
- **007** `APP_ENV`, health checks, `ALLOW_SEED` in prod
- **013** Demo flags, no auth bypass, reset guards

---

## Superseded / deprecated

| ADR | Status | Notes |
|-----|--------|-------|
| — | — | No superseded ADRs yet |

When superseding: add row here and set `Superseded by` in the old ADR header.

---

## Decision timeline (foundation → V1)

```
001 Monorepo ──┬── 004 Prisma/Postgres ── 016 Migration policy
               ├── 002 Auth ── 003 Tenant
               ├── 005 AI contract ── 015 App/AI split
               ├── 006 Billing
               ├── 007 Deploy ── 013 Demo ── 014 Data safety
               ├── 008 Adapters
               ├── 011 Persian/RTL
               └── 012 Vertical packs
        009 Repository awareness ── 010 Quality
```

---

## Next ADR number

**017** — update this line when adding ADR-017.
