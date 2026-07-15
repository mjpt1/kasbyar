# Test Plan — [FEATURE / PHASE NAME]

> قالب طرح تست برای feature، ماژول، یا فاز.  
> Strategy: [testing-strategy.md](../testing/testing-strategy.md) · Matrix: [test-matrix.md](../testing/test-matrix.md)

**Owner:**  
**PR / branch:**  
**Date:**  
**Risk tier:** ☐ P0 ☐ P1 ☐ P2 ☐ P3  

---

## 1. Scope

What is in scope for this test plan:



Out of scope:



---

## 2. Matrix rows touched

List rows from [test-matrix.md](../testing/test-matrix.md):

- 
- 

---

## 3. Automated tests

### Unit / contract (required)

| Test file | What it covers | Status |
|-----------|----------------|--------|
| | | ☐ Added ☐ Updated ☐ N/A |

```bash
npm test
npm run test:security   # if tenant/auth/upload/demo/billing
```

### Integration (if applicable)

| Scenario | Status | Notes |
|----------|--------|-------|
| | ☐ Planned ☐ Done ☐ Gap | |

### E2E (if applicable)

| Flow | Status | Notes |
|------|--------|-------|
| | ☐ Manual only ☐ Playwright | |

---

## 4. Manual QA steps

1. 
2. 
3. 

Full checklist reference: [manual-qa-checklist.md](../testing/manual-qa-checklist.md)

---

## 5. Security-sensitive flows

- [ ] Cross-org access tested
- [ ] Role denial tested
- [ ] Entitlement/plan gate tested
- [ ] Upload/destructive (if touched)

Template: [sensitive-change-review.md](./sensitive-change-review.md)

---

## 6. Staging verification

- [ ] Deployed to staging ref: __________
- [ ] Migration/seed if needed
- [ ] Staging smoke from [release-verification-checklist.md](../testing/release-verification-checklist.md) §2–3

---

## 7. Test gaps & follow-ups

| Gap | Risk | Follow-up ticket |
|-----|------|------------------|
| | | |

---

## 8. Sign-off

| | Name | Date |
|---|------|------|
| Author | | |
| Reviewer | | |

**Ready to merge:** ☐ Yes ☐ No — gaps above
