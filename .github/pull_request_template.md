## Summary

<!-- What changed and why (1–3 sentences) -->

## Type of change

- [ ] Feature
- [ ] Bug fix
- [ ] Module / pack
- [ ] Schema / database
- [ ] AI integration
- [ ] Billing / gating
- [ ] Demo mode
- [ ] Ops / deploy / CI
- [ ] Docs only
- [ ] Security-sensitive

## Definition of Done

<!-- Feature-level minimum. Full: docs/quality/definition-of-done.md -->

- [ ] `npm run verify` passes (or CI equivalent)
- [ ] Relevant tests pass or gap documented below
- [ ] Docs updated if behavior changed
- [ ] `.env.example` + `docs/ENVIRONMENT.md` if new env vars
- [ ] Tenant safety considered (`organizationId`, tenant-scope)
- [ ] Persian / RTL impact reviewed (if UI)
- [ ] Error / loading / empty states (if UI)
- [ ] `KNOWN_LIMITATIONS.md` updated if shipping limits
- [ ] Migrations reviewed if schema changed

## Review checklists

<!-- Mark all that apply — docs/quality/review-checklists.md -->

- [ ] Backend / service
- [ ] Frontend / UI
- [ ] Schema / database
- [ ] AI integration
- [ ] Billing / gating
- [ ] Demo mode
- [ ] Operational / deployment
- [ ] Security-sensitive → [security/review-gate.md](docs/security/review-gate.md) + [sensitive-change-review](docs/templates/sensitive-change-review.md)

## Manual verification

<!-- Numbered steps a reviewer can replay -->

1. 
2. 

## Test gaps (if any)

| Gap | Reason | Follow-up |
|-----|--------|-----------|
| | | |

**Test plan:** [docs/templates/test-plan-template.md](docs/templates/test-plan-template.md) · [docs/testing/test-matrix.md](docs/testing/test-matrix.md)

## Screenshots (UI changes)

<!-- Optional -->

## Related

- Phase / issue: 
- ADR: 
