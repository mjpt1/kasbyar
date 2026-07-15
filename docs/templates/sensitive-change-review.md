# Sensitive Change Security Review — [CHANGE TITLE]

> **Required** for PRs touching auth, tenant, upload, AI, billing, demo, backup/restore, or admin tools.  
> Gate: [docs/security/review-gate.md](../security/review-gate.md) · Tenant: [tenant-safety-checklist.md](../security/tenant-safety-checklist.md)

**PR:**  
**Author:**  
**Reviewer:**  
**Date:**  

---

## 1. Change summary

What is changing and why (2–4 sentences):



---

## 2. Sensitive categories (check all)

- [ ] Authentication / session
- [ ] Authorization / RBAC
- [ ] Workspace / org resolution
- [ ] File upload / import
- [ ] Invoices / payments
- [ ] AI / assistant
- [ ] Demo / admin tools
- [ ] Backup / restore / migrate
- [ ] Feature gating / billing
- [ ] Secrets / environment

---

## 3. Eight review questions

### Who can trigger?
- Roles / features required: 
- [ ] Verified

### What can be read?
- Data scopes: 
- [ ] `organizationId` on all reads

### What can be modified?
- Mutations: 
- [ ] FK tenant-scope validated

### Tenant ownership
- [ ] [tenant-safety-checklist.md](../security/tenant-safety-checklist.md) sections applicable — pass

### Abuse paths considered
- Likely abuse: 
- Mitigations: 

### Logging
- Audit events added/changed: 
- [ ] No secrets in metadata

### Failure modes
- Degraded behavior: 
- [ ] No stack leak to client

### Secrets / config
- Env vars: 
- [ ] `.env.example` + `ENVIRONMENT.md` updated if needed

---

## 4. Manual verification

| Step | Result |
|------|--------|
| Cross-org ID access test | ☐ Pass / N/A |
| Role denial test (staff vs admin) | ☐ Pass / N/A |
| Demo/destructive guard (if touched) | ☐ Pass / N/A |
| Upload/size/MIME (if touched) | ☐ Pass / N/A |
| AI entitlement (if touched) | ☐ Pass / N/A |

---

## 5. Residual risk

| Risk ID / description | Accept? | Follow-up |
|-----------------------|---------|-----------|
| | ☐ Yes / ☐ No | |

Reference: [assumptions-residual-risks.md](../security/assumptions-residual-risks.md)

---

## 6. Reviewer decision

- [ ] **Approve**
- [ ] **Approve with documented residual risk**
- [ ] **Request changes**

Notes:
