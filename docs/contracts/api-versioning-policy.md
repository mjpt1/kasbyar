# API & Service Versioning Policy — KesbYar

**وضعیت:** V1  
**مرتبط:** [API.md](../API.md) · [ADR-005](../decisions/005-ai-service-contract.md) · [AI_INTEGRATION.md](../AI_INTEGRATION.md)

---

## 1. Scope

| Contract boundary | Mechanism V1 |
|-----------------|--------------|
| Browser ↔ Next.js API | Unversioned `/api/*` — additive evolution |
| Web ↔ AI service | URL path `/api/v1/*` + shared TypeScript types |
| Web ↔ integration adapters | `packages/shared/src/integrations/*` |
| Background tasks | shared types + idempotent handlers |
| Prisma schema | migrations — [MIGRATIONS.md](../MIGRATIONS.md) |

---

## 2. Breaking vs non-breaking

### Breaking (requires migration plan)

| Change | Example |
|--------|---------|
| Remove JSON field | drop `highlights` from summary response |
| Rename field | `organization_id` → `orgId` |
| Change type | `confidence: number` → string |
| Change semantics | `status: paid` means different state |
| Tighten validation | reject previously accepted payload |
| Remove endpoint | delete `POST /api/conversation` |

### Non-breaking (preferred)

| Change | Example |
|--------|---------|
| Add optional field | new `degraded?: boolean` |
| Add endpoint | `GET /api/audit` |
| Add enum value | new invoice status with UI handling |
| Loosen validation | accept optional `metadata` |

---

## 3. Version expression

### Public web API (`/api/*`)

- **V1:** no version in URL
- Breaking change → either:
  1. **Additive period:** new field alongside old (deprecation window)
  2. **New path:** `/api/v2/invoices` when unavoidable
- Response envelope stable: `{ success, data }` / `{ success: false, error: { code, message } }`

### AI service

- Path: `/api/v1/...` (FastAPI router)
- Health returns `version: "0.1.0"`
- Shared contracts: `packages/shared/src/types/ai.ts`
- Web client pins to v1 paths in `lib/ai/client.ts`

### Integration adapters

- Contract version = npm package `@kesbyar/shared` + integration interface shape
- Vendor API version **inside adapter only**

---

## 4. Backward compatibility rules

1. **Web deploys before AI** when adding optional AI response fields
2. **AI deploys before web** when web requires new AI fields (avoid)
3. **Shared types** updated in same PR as producer or consumer with compatibility comment
4. **Database:** additive migrations first؛ destructive column drop = two-phase
5. **Mobile/external API (future):** explicit `Accept-Version` header

---

## 5. Deprecation process

```
1. Mark deprecated in shared types (JSDoc @deprecated)
2. Log warn on use (server) for one release
3. Document in CHANGELOG / migration note
4. Remove after ≥ 1 pilot cycle or 60 days (whichever longer)
```

### AI endpoint deprecation

- Keep `/api/v1/old` returning 410 with `migration` hint
- New route `/api/v2/...` parallel until web migrated

---

## 6. Migration notes

Location: `docs/contracts/migrations/` (create per breaking change)

Template:

```markdown
# Migration: <title>
**Date:** YYYY-MM-DD
**Breaking:** yes/no
**Affected:** web | ai | both

## Before
## After
## Rollout order
## Rollback
```

Also link from ADR if architectural.

---

## 7. Contract ownership

| Contract | Owner | Source of truth |
|----------|-------|-----------------|
| AI DTOs | Engineering | `packages/shared/src/types/ai.ts` |
| Billing integration | Engineering | `integrations/billing.ts` |
| Public REST | Engineering | route + Zod schema in `app/api` |
| OpenAPI (future) | Engineering | generated from Zod |

---

## 8. Testing compatibility

- Unit tests on shared types (compile-time)
- `intelligence.service.test.ts` — fallback when AI shape wrong
- Contract test post-V1: web ↔ ai-service in CI

---

## 9. V1 current versions

| Service | Version | Notes |
|---------|---------|-------|
| kesbyar-web API | implicit v1 | unversioned paths |
| kesbyar-ai | 0.1.0 | `/api/v1` |
| @kesbyar/shared | monorepo lockstep | workspace package |

---

## 10. Checklist PR (contract touch)

- [ ] Breaking? → migration note + rollout order
- [ ] Shared types updated?
- [ ] AI path version correct?
- [ ] Deprecation JSDoc if replacing field?
- [ ] KNOWN_LIMITATIONS if user-visible behavior change?
