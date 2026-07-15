# ADR-013: Demo Mode Isolation

| Field | Value |
|-------|-------|
| **Status** | Accepted |
| **Date** | 2026 (V1 GTM) |
| **Domains** | demo, ops, auth |

## Context

Sales and investor demos need rich seed data and reset flows without compromising production tenant safety or bypassing auth.

## Decision

1. **Two flags:**
   - `DEMO_MODE` — server: demo API, scenario switch, reset endpoints
   - `NEXT_PUBLIC_DEMO_MODE` — client: banner, quick-login UI
2. **Demo is not a security bypass:** same session auth, same `organizationId` rules, same RBAC
3. **Demo data:** fixed slugs (`demo-general`, `demo-clinic`, …) and users (`demo@kesbyar.ir`) from seed only
4. **Scenario registry:** `packages/shared/src/demo/scenarios.ts` — single source for labels and org mapping
5. **Reset/reseed guards:**
   - Production: `APP_ENV=production` blocks demo reset unless `ALLOW_SEED=true` (discouraged)
   - Reseed: `scripts/db-reseed-guard.ts` + destructive guard pattern
   - Reset API: requires `DEMO_MODE` + `ALLOW_SEED` + ADMIN role
6. **Demo service layer:** `server/demo/` — isolated from core business paths; no special-case tenant queries that skip scope
7. **Investor/walkthrough flows:** UI routes under `/demo` — presentation only, no elevated privileges

## Consequences

- Production deploy checklist: `ALLOW_SEED=false`, intentional `DEMO_MODE` only for dedicated sales environments
- Changing demo users or slugs requires seed + `demo.test.ts` + [DEMO.md](../DEMO.md)
- [ADR-007](./007-deployment-runtime.md) env flags align with this ADR

## Related

- [DEMO.md](../DEMO.md)
- [ADR-002](./002-session-auth.md)
- [ADR-003](./003-tenant-isolation.md)
- [ADR-014](./014-audit-data-safety.md) — demo reset audited

## Residual risks

- Misconfigured production with `ALLOW_SEED=true` is catastrophic — ops checklist must catch
- `NEXT_PUBLIC_DEMO_MODE` without server `DEMO_MODE` shows UI affordances that API may reject — keep envs aligned
