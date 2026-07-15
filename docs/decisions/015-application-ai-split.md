# ADR-015: Application and AI Service Split

| Field | Value |
|-------|-------|
| **Status** | Accepted |
| **Date** | 2025 (V1 foundation) |
| **Domains** | architecture, ai, ops |
| **Related** | Complements [ADR-005](./005-ai-service-contract.md) (HTTP contract) |

## Context

The product needs a rich web app (auth, tenant data, billing, RTL UI) and optional LLM inference. Monolith-in-one-process vs separate AI service affects deploy, security, and failure modes.

## Decision

### Responsibility split

| Runtime | Stack | Owns |
|---------|-------|------|
| **Application** | Next.js 15 (`apps/web`) | Auth, sessions, Prisma/Postgres, all business writes, UI, billing, audit, file metadata |
| **AI service** | FastAPI (`apps/ai-service`) | Stateless inference: summarize, answer from provided context — **no direct DB access** |

### Integration rules

1. Web builds operational context from DB (`operational-context.ts`) and sends to AI
2. AI returns text/structured response — web decides what to show or whether to persist (user-confirmed actions only)
3. Communication: HTTP + `AI_SERVICE_TOKEN`; configurable timeout/retry in `lib/ai/client.ts`
4. **Degraded mode:** if AI unreachable, `local-fallback.ts` serves reduced assistant — app remains usable
5. **Deploy independently:** AI container optional; Vercel/web can run without AI URL set (fallback)
6. Shared types only in `@kesbyar/shared` — not shared runtime code between Python and TS

### What AI service must not do

- Connect to Postgres
- Issue session cookies or impersonate users
- Execute destructive or billing mutations
- Bypass entitlement checks (enforced on web before call)

## Consequences

- Scale AI horizontally without moving core DB
- Security boundary: compromise of AI service does not grant DB credentials
- CI validates both apps separately (`.github/workflows/ci.yml`)
- Feature gating for assistant remains in web ([ADR-006](./006-billing-feature-gating.md))

## Related

- [ADR-001](./001-monorepo-structure.md)
- [ADR-005](./005-ai-service-contract.md)
- [AI_INTEGRATION.md](../AI_INTEGRATION.md)

## Residual risks

- Operational complexity of two deployables
- Context window limits may truncate large workspaces — documented in KNOWN_LIMITATIONS
- Conversation history not persisted in V1
