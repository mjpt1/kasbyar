# ADR-010: Quality Enforcement Framework

**Status:** Accepted  
**Date:** 2026-07

## Context

V1 implementation is complete across 12 phases, but acceptance criteria were tracked informally in `GUARDRAILS.md` and `MASTER_EXECUTION.md`. Future work needs repeatable Definition of Done levels (feature → release), typed review checklists, and phase-completion gates with evidence — without heavy automation the repo cannot support yet.

## Decision

Add a **repository-real quality layer**:

| Artifact | Purpose |
|----------|---------|
| `docs/quality/` | DoD hub, four-level DoD, eight review checklists |
| `docs/templates/` | phase-review-gate, feature DoD, change-review, release-readiness |
| `.github/pull_request_template.md` | DoD + checklist links on every PR |
| `.github/ISSUE_TEMPLATE/` | phase-completion, release-readiness issues |
| `npm run verify` | lint + typecheck + test (+ db:generate) — local fast gate |
| `scripts/verify-quality.ps1` / `.sh` | wrapper for contributors |

Enforcement model: **documented gates + PR template + CI** — not custom pre-commit bots.

Integrates with existing `engineering/change-impact-checklist.md`, `SECURITY_REVIEW.md`, `QA_CHECKLIST.md` — does not duplicate them.

## Consequences

- Reviewers have explicit checklists per change type
- Phase work must produce a filled `phase-review-gate` before marked complete
- Contributors run `npm run verify` before PR; `npm run ci` before release
- Some checklist items remain human judgment (RTL quality, tenant manual tests)

## Residual risks

- Templates are not schema-validated — empty PR sections possible without review discipline
- `verify` skips build — release cuts must still run `ci`
- No automated tenant-isolation or RTL tests in CI yet
