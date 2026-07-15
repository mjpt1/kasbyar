# Feature Definition of Done — [FEATURE NAME]

> کپی در body PR یا attach به issue.  
> مرجع کامل: [docs/quality/definition-of-done.md](../quality/definition-of-done.md)

**Feature:**  
**PR:**  
**Type:** ☐ API ☐ UI ☐ Both ☐ Config only  

---

## Summary

One paragraph — what the user can now do:



---

## Checklist (feature-level)

### Build & quality

- [ ] `npm run verify` passes locally
- [ ] Lint / typecheck clean
- [ ] Relevant tests added or gap documented below

### Data & tenant

- [ ] All queries scoped by `organizationId`
- [ ] FK validation via `tenant-scope` (if new relations)
- [ ] No cross-tenant data leak (manual check: second org)

### API (if applicable)

- [ ] `requireApiSession` / `requireApiRole` on routes
- [ ] Zod validation for input
- [ ] Persian error messages via `handleApiError`

### UI (if applicable)

- [ ] Loading state
- [ ] Empty state
- [ ] Error state
- [ ] RTL / Persian copy reviewed
- [ ] Mobile layout checked

### Gating (if applicable)

- [ ] `assertFeature` / `assertPackEntitlement` on server
- [ ] `UpgradePrompt` on UI when locked

### Docs & env

- [ ] User-facing docs updated (if behavior visible)
- [ ] `ENVIRONMENT.md` + `.env.example` (if new env vars)
- [ ] `KNOWN_LIMITATIONS.md` (if shipping with limits)

### Review type(s)

Mark applicable review checklists from [review-checklists.md](../quality/review-checklists.md):

- [ ] Backend / service
- [ ] Frontend / UI
- [ ] Schema / database
- [ ] AI integration
- [ ] Billing / gating
- [ ] Demo mode
- [ ] Operational / deploy
- [ ] Security-sensitive

---

## Manual Verification Steps

1. 
2. 
3. 

---

## Test Gaps (if any)

| Gap | Reason | Follow-up ticket |
|-----|--------|------------------|
| | | |

---

## Known Limitations

- 

---

## Screenshots / recordings (optional)

- 
