# ADR-012: Vertical Pack Extension Model

| Field | Value |
|-------|-------|
| **Status** | Accepted |
| **Date** | 2025–2026 (V1) |
| **Domains** | architecture, product |

## Context

Different industries (clinic, travel agency, retail) need specialized entities and dashboards atop a shared CRM/invoicing core. Options: separate products, feature flags only, or **pack** modules extending one platform.

## Decision

1. **Shared core always on:** customers, leads, invoices, payments, tasks, activities, reports, assistant
2. **One primary `industryPack` per `Organization`** (enum in Prisma) — no multi-pack per org in V1
3. **Registry-driven metadata:** `packages/shared/src/packs/` (`PACK_REGISTRY`, nav labels, menu items)
4. **Layered implementation:**

   | Layer | Location |
   |-------|----------|
   | Schema | `prisma/schema.prisma` — pack models with `organizationId` |
   | Services | `apps/web/src/server/packs/<pack>/` |
   | API | `apps/web/src/app/api/packs/` + `requireApiPack()` |
   | UI | `apps/web/src/app/(app)/{clinic,travel,retail}/` |
   | Nav | `config/navigation.ts` — `getNavItems(industryPack)` |

5. **Gating:** pack pages/API require matching pack on session org; wrong pack → redirect or 403
6. **Seed:** per-pack scenarios in `prisma/seed/scenarios/` (`demo-clinic`, etc.)
7. **Adding a pack:** enum → registry → schema → service → API → UI → seed → dashboard widget — no ad-hoc routes

## Consequences

- Core modules stay pack-agnostic; pack logic does not leak into `customer.service` etc.
- Billing can gate pack access via plan + `assertPackEntitlement`
- Documentation: [VERTICAL_PACKS.md](../VERTICAL_PACKS.md)

## Related

- [ADR-001](./001-monorepo-structure.md) — shared package hosts registry
- [ADR-003](./003-tenant-isolation.md) — pack entities tenant-scoped
- [ADR-006](./006-billing-feature-gating.md) — plan limits on packs

## Residual risks

- `Organization.extension` JSON unused — avoid silent config there until ADR
- Removing or renaming a pack requires migration + seed + nav + entitlement together
- EMR-level clinic depth explicitly out of V1 scope
