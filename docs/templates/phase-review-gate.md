# Phase Review Gate — [PHASE NAME]

> کپی این قالب در پایان هر فاز از MASTER_EXECUTION.  
> فاز **complete نیست** تا این سند پر و در PR نهایی یا `docs/phases/` commit نشود.

**Phase:**  
**Date:**  
**Owner:**  
**Branch / PRs:**  

---

## 1. Phase Summary

What was implemented (2–5 sentences):



---

## 2. Scope & Files Changed

### Modules / areas touched

- 

### Key files (representative)

- 

---

## 3. Acceptance Criteria

| # | Criterion | Status | Evidence |
|---|-----------|--------|----------|
| 1 | | ☐ Met / ☐ Partial / ☐ Not met | |
| 2 | | | |
| 3 | | | |

---

## 4. Quality Gates

| Gate | Result | Command / link |
|------|--------|----------------|
| `npm run verify` | ☐ Pass | |
| `npm run ci` (if release cut) | ☐ Pass / N/A | |
| ADR(s) | ☐ N/A / ☐ Added: | |
| Docs updated | ☐ Yes | |
| MASTER_EXECUTION.md | ☐ Updated | |

---

## 5. Evidence of Completion

- CI run: 
- Test count / new tests: 
- Screenshots / manual notes: 

---

## 6. Manual Verification Performed

| Step | Result |
|------|--------|
| Happy path | ☐ |
| Cross-tenant isolation | ☐ / N/A |
| RTL / Persian copy | ☐ / N/A |
| Error / empty / loading states | ☐ / N/A |
| Demo mode (if touched) | ☐ / N/A |

---

## 7. Known Gaps

| Gap | Severity | Follow-up |
|-----|----------|-----------|
| | Low / Med / High | |

**Blockers for phase complete:** ☐ None / ☐ Listed above

---

## 8. Assumptions

- 

---

## 9. Rollback / Mitigation

| Risk | Mitigation |
|------|------------|
| Schema change | backup: `npm run db:backup` |
| Deploy | revert commit / Vercel rollback |
| Other | |

---

## 10. Safe to Continue?

- [ ] **Yes** — next phase may start
- [ ] **No** — blockers in section 7 must be resolved first

**Next phase dependencies:**

- 

---

## 11. Reviewer Sign-off

| Role | Name | Date | OK |
|------|------|------|-----|
| Implementer | | | ☐ |
| Reviewer | | | ☐ |
