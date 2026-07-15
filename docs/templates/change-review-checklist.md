# Change Review Checklist — PR #[NUMBER]

> Reviewer: mark sections that apply. Full detail in [review-checklists.md](../quality/review-checklists.md).

**Author:**  
**Reviewer:**  
**Change types (check all that apply):**

- [ ] Backend / service
- [ ] Frontend / UI
- [ ] Schema / database
- [ ] AI integration
- [ ] Billing / gating
- [ ] Demo mode
- [ ] Operational / deployment
- [ ] Security-sensitive

---

## Universal (every PR)

| Check | OK | Notes |
|-------|-----|-------|
| `npm run verify` / CI green | ☐ | |
| No secrets in diff | ☐ | |
| Tenant scope preserved | ☐ | |
| Docs updated if behavior changed | ☐ | |
| Manual steps in PR description | ☐ | |

---

## Quick passes by type

### Backend
- [ ] Service layer — not fat route handlers
- [ ] `organizationId` on all tenant queries
- [ ] Appropriate HTTP status codes

### Frontend
- [ ] loading / empty / error states
- [ ] RTL + Persian copy
- [ ] No business logic in components

### Schema
- [ ] Migration strategy noted
- [ ] Seed still works
- [ ] `db:generate` + typecheck

### AI
- [ ] Fallback when service down
- [ ] No direct DB writes from AI
- [ ] Types in `@kesbyar/shared`

### Billing
- [ ] Server-side gating — not UI-only
- [ ] `plans.ts` single source

### Demo
- [ ] Production reset guarded
- [ ] No auth bypass

### Ops
- [ ] Env docs updated
- [ ] Rollback noted if risky

### Security
- [ ] [SECURITY_REVIEW.md](../SECURITY_REVIEW.md) items for area
- [ ] Cross-org URL test if IDs in routes

---

## Impact checklist

- [ ] [change-impact-checklist.md](../engineering/change-impact-checklist.md) reviewed

---

## Decision

- [ ] **Approve**
- [ ] **Request changes** — blockers:
- [ ] **Comment only**

**Residual risk (if approve with notes):**
