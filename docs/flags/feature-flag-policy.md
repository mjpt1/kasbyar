# Feature Flag Policy — KesbYar

**وضعیت:** V1  
**مرتبط:** [ADR-006](../decisions/006-billing-feature-gating.md) · [ADR-013](../decisions/013-demo-mode-isolation.md)

---

## 1. Feature flags ≠ pricing gates

| Mechanism | Purpose | Enforcement | Example |
|-----------|---------|-------------|---------|
| **Plan entitlement** | commercial limits | `assertFeature()` / `checkFeature()` | `aiAssistant` on STARTER |
| **Feature flag** | rollout / ops / pilot | `isFeatureFlagEnabled()` | new dashboard beta |
| **Kill switch** | emergency off | `isKillSwitchActive()` | disable AI globally |
| **Demo mode** | sales environment | `DEMO_MODE` + `canResetDemoData()` | demo reset API |

**قانون:** هرگز plan limit را با env flag دور نزنید. Entitlement **fail-closed**.

---

## 2. Flag categories

| Category | `FLAG_CATEGORIES` | Default | Who changes |
|----------|-------------------|---------|-------------|
| **Release** | `release` | off | Engineering deploy |
| **Beta** | `beta` | off | Product + Engineering |
| **Pilot** | `pilot` | off | Customer Success |
| **Kill switch** | `kill_switch` | off (service on) | On-call / ops |
| **Internal** | `internal` | off | Engineering |
| **Demo** | `demo` | env-based | Ops staging |

Constants: `packages/shared/src/flags/categories.ts`

---

## 3. Where flags live (V1)

| Storage | Use |
|---------|-----|
| **Environment variables** | release, kill, pilot wave |
| **`DEMO_MODE` / `NEXT_PUBLIC_DEMO_MODE`** | demo UI/API |
| **Plan definitions** | NOT flags — `plans.ts` |
| **DB per-org flags** | post-V1 pilot customization |

### Env naming

| Prefix | Example | Meaning |
|--------|---------|---------|
| `FEATURE_FLAG_` | `FEATURE_FLAG_RELEASE_EXAMPLE_MODULE=true` | enable release flag |
| `KILL_SWITCH_` | `KILL_SWITCH_KILL_AI_ASSISTANT=true` | disable capability |
| `PILOT_FLAG_` | `PILOT_FLAG_BETA_EXPORT=true` | pilot-only feature |

Dot keys → underscore: `release.example_module` → `FEATURE_FLAG_RELEASE_EXAMPLE_MODULE`

Helper: `apps/web/src/lib/flags.ts`

---

## 4. Server-side enforcement

```ts
import { isFeatureFlagEnabled, isKillSwitchActive, KILL_SWITCHES } from '@/lib/flags';
import { assertFeature } from '@/server/billing/entitlement.service';

// Order: kill switch → entitlement → release flag
if (isKillSwitchActive(KILL_SWITCHES.AI_ASSISTANT)) {
  throw new AppError('دستیار موقتاً غیرفعال است', 'FEATURE_DISABLED', 503);
}
await assertFeature(organizationId, 'aiAssistant');
if (!isFeatureFlagEnabled('release.new_insights')) {
  // old code path
}
```

**Client UI** may hide beta — **server must enforce**.

---

## 5. Flag lifecycle (avoid permanent debt)

```
Ship behind flag → measure → default ON → remove flag (≤ 2 sprints)
```

| Rule | Detail |
|------|--------|
| Max age | Release flags older than **60 days** → remove or promote to default |
| Registry | Add to `RELEASE_FLAGS` constant when created |
| Removal PR | delete env + branch + `RELEASE_FLAGS` entry |
| Kill switches | keep documented؛ use only incidents |
| Pilot flags | remove when pilot graduates or fails |

Quarterly audit: grep `FEATURE_FLAG_` / `isFeatureFlagEnabled` in codebase.

---

## 6. Category playbooks

### Release flags

- Gradual rollout: staging → 1 pilot → all
- Default **off** in production until validated

### Beta flags

- Opt-in via CS or `PILOT_FLAG_*`
- Known limitations doc updated

### Pilot-customer flags

- `PILOT_FLAG_<name>` per wave
- post-V1: `Organization.pilotFlags` JSON

### Emergency kill switches

- `KILL_SWITCH_KILL_AI_ASSISTANT`
- `KILL_SWITCH_KILL_AUTOMATION_RUN`
- `KILL_SWITCH_KILL_FILE_UPLOAD`
- No deploy needed — env reload / platform config

### Internal-only

- `INTERNAL_FLAGS` — ADMIN + env flag double gate

### Demo-only

- `DEMO_MODE` — never weakens tenant isolation ([ADR-013](../decisions/013-demo-mode-isolation.md))

---

## 7. Who can change flags

| Flag type | Approver | Where set |
|-----------|----------|-----------|
| Kill switch | on-call lead | hosting env |
| Release | engineering lead | deploy pipeline |
| Pilot | CS lead | staging env / future admin |
| Demo | ops | staging only |

Production changes: ticket + rollback plan.

---

## 8. Anti-patterns

| ❌ | ✅ |
|----|-----|
| `if (plan === 'BUSINESS')` for unfinished feature | release flag |
| env flag to bypass quota | fix entitlement |
| client-only flag check | server enforce |
| 10 nested flags | remove or ship |
| permanent `if (isFeatureFlagEnabled(...))` | time-box removal |

---

## 9. V1 inventory

| Flag | Type | Status |
|------|------|--------|
| `DEMO_MODE` | demo | ✅ active |
| `RELEASE_FLAGS.EXAMPLE_MODULE` | release | placeholder |
| `KILL_SWITCHES.*` | kill | defined, default off |
| Plan features | entitlement | ✅ `entitlement.service` |

---

## 10. Checklist new flag

- [ ] Category assigned
- [ ] Constant in `flags/categories.ts`
- [ ] Server enforcement (not UI only)
- [ ] ENVIRONMENT.md entry
- [ ] Removal date in PR description
- [ ] Not duplicating plan gating
