# Test Matrix — KesbYar

نقشه **ماژول/قابلیت → لایه تست مورد انتظار**.

**راهنما:**  
- **R** = Required automated (PR block if missing without documented gap)  
- **O** = Optional automated  
- **I** = Integration (planned — manual until implemented)  
- **M** = Manual QA  
- **S** = Security-sensitive manual  
- **RV** = Release verification smoke  

---

## Legend

| Code | Meaning |
|------|---------|
| R | Unit/contract — add or justify gap |
| O | Nice to have unit |
| I | Integration test target |
| M | Manual QA checklist |
| S | Security smoke |
| RV | Post-deploy smoke |

---

## Auth & workspace

| Feature / module | Unit | Contract | Integration | E2E | Manual | Security | RV | Notes / existing tests |
|------------------|:----:|:--------:|:-----------:|:---:|:------:|:--------:|:--:|------------------------|
| Login / logout | O | — | I | M | M | S | RV | validators login |
| Session resolution | O | — | I | — | M | S | — | ADR-002 |
| Workspace select | O | — | I | M | M | S | RV | org membership |
| RBAC `permissions` | **R** | — | I | — | M | S | — | `permissions.test.ts` |
| Register org | O | — | I | M | M | — | — | `registerSchema` |

---

## Tenant isolation

| Feature / module | Unit | Contract | Integration | E2E | Manual | Security | RV | Notes |
|------------------|:----:|:--------:|:-----------:|:---:|:------:|:--------:|:--:|-------|
| tenant-scope FK helpers | **R** | — | I | — | **S** | **S** | — | `tenant-scope.test.ts` |
| List queries scoped | O | — | I | — | **S** | **S** | — | code review |
| get-by-id cross-org | O | — | **I** | M | **S** | **S** | — | manual URL test |
| Soft-delete filter | O | — | I | — | M | — | — | `ACTIVE_RECORD_FILTER` |

---

## Core CRM

| Feature / module | Unit | Contract | Integration | E2E | Manual | Security | RV | Notes |
|------------------|:----:|:--------:|:-----------:|:---:|:------:|:--------:|:--:|-------|
| Customer CRUD | O | — | I | M | M | S | RV | archive manual |
| Lead CRUD + pipeline | **R** | — | I | M | M | S | — | `leads.test.ts` stale |
| Lead follow-ups | O | — | I | M | M | — | — | |
| Task CRUD | **R** | — | I | M | M | — | — | `tasks.test.ts` |
| Activity log | O | — | I | — | M | — | — | |
| Members invite/roles | O | — | I | M | M | S | — | |

---

## Invoicing & payments

| Feature / module | Unit | Contract | Integration | E2E | Manual | Security | RV | Notes |
|------------------|:----:|:--------:|:-----------:|:---:|:------:|:--------:|:--:|-------|
| Invoice line math | **R** | — | — | — | M | — | — | `invoice-math.test.ts` |
| Invoice status transitions | **R** | — | I | M | M | S | RV | cancel confirm UI |
| Invoice search/pagination | O | — | I | M | M | — | — | |
| Payment create | O | — | I | M | M | **S** | RV | FK tenant-scope |
| Receivables / overdue | **R** | — | I | — | M | — | — | `receivables.test.ts` |

---

## Files & upload

| Feature / module | Unit | Contract | Integration | E2E | Manual | Security | RV | Notes |
|------------------|:----:|:--------:|:-----------:|:---:|:------:|:--------:|:--:|-------|
| Upload size/MIME/path | **R** | — | I | M | M | **S** | — | `uploads.test.ts` |
| Entity attachment scope | O | — | I | M | **S** | **S** | — | tenant-scope |
| Download by id | O | — | I | M | **S** | **S** | — | path assert |
| Import CSV (future) | — | — | I | M | M | **S** | — | not in V1 |

---

## Billing & gating

| Feature / module | Unit | Contract | Integration | E2E | Manual | Security | RV | Notes |
|------------------|:----:|:--------:|:-----------:|:---:|:------:|:--------:|:--:|-------|
| Plan catalog | **R** | **R** | — | — | M | **S** | — | `plans.test.ts` |
| Entitlement policy | **R** | — | I | — | M | **S** | — | `entitlement.policy.test.ts` |
| `assertFeature` on routes | O | — | I | M | **S** | **S** | — | conversation, reports |
| change-plan API | O | — | I | M | M | **S** | — | ADMIN/owner |
| Upgrade UI prompt | — | — | — | M | M | — | — | visual |

---

## AI assistant

| Feature / module | Unit | Contract | Integration | E2E | Manual | Security | RV | Notes |
|------------------|:----:|:--------:|:-----------:|:---:|:------:|:--------:|:--:|-------|
| Operational context build | O | — | I | — | — | **S** | — | org scoped |
| Fallback when AI down | **R** | — | — | — | M | — | RV | `intelligence.service.test.ts` |
| AI types shared | — | **R** | — | — | — | — | — | `types/ai.ts` |
| Conversation ask | O | — | I | M | M | **S** | — | entitlement |
| AI summary route | O | — | I | M | M | **S** | — | assertFeature |
| FastAPI health | — | O | — | — | M | **S** | RV | CI compile smoke |
| AI writes data | — | — | — | — | **S** | **S** | — | must stay disabled |

---

## Vertical packs

| Feature / module | Unit | Contract | Integration | E2E | Manual | Security | RV | Notes |
|------------------|:----:|:--------:|:-----------:|:---:|:------:|:--------:|:--:|-------|
| PACK_REGISTRY | **R** | **R** | — | — | M | — | — | `registry.test.ts` |
| requirePackPage / API | O | — | I | M | M | S | — | |
| Clinic appointments | O | — | I | M | M | S | — | demo-clinic |
| Travel bookings | O | — | I | M | M | S | — | |
| Retail stock | O | — | I | M | M | S | — | |

---

## Dashboard & reports

| Feature / module | Unit | Contract | Integration | E2E | Manual | Security | RV | Notes |
|------------------|:----:|:--------:|:-----------:|:---:|:------:|:--------:|:--:|-------|
| Dashboard stats | O | — | I | M | M | S | RV | |
| Sales chart 7d | — | — | I | M | M | — | — | |
| Reports API | O | — | I | M | M | S | — | assertFeature reports |
| Pack dashboard widgets | O | — | I | M | M | — | — | |

---

## Demo mode

| Feature / module | Unit | Contract | Integration | E2E | Manual | Security | RV | Notes |
|------------------|:----:|:--------:|:-----------:|:---:|:------:|:--------:|:--:|-------|
| Demo scenarios registry | **R** | **R** | — | — | M | — | — | `scenarios.test.ts` |
| Demo env guards | **R** | — | — | — | M | **S** | — | `demo.test.ts` |
| Demo reset API | O | — | I | M | M | **S** | — | ADMIN + flags |
| Investor walkthrough | — | — | — | M | M | — | — | |

---

## Ops & data safety

| Feature / module | Unit | Contract | Integration | E2E | Manual | Security | RV | Notes |
|------------------|:----:|:--------:|:-----------:|:---:|:------:|:--------:|:--:|-------|
| destructive env guards | **R** | — | — | — | M | **S** | — | `destructive.test.ts` |
| Audit metadata sanitize | **R** | — | — | — | — | **S** | — | `audit.service.test.ts` |
| Audit list API | O | — | I | M | M | **S** | — | ADMIN+ |
| db:backup script | — | — | — | — | M | **S** | RV | staging manual |
| db:restore script | — | — | — | — | M | **S** | — | never prod auto |
| migrate deploy guard | O | — | — | — | M | **S** | RV | staging first |

---

## UI states

| Feature / module | Unit | Contract | Integration | E2E | Manual | Security | RV | Notes |
|------------------|:----:|:--------:|:-----------:|:---:|:------:|:--------:|:--:|-------|
| EmptyState / skeleton | **R** | — | — | M | M | — | — | `ui-states.test.ts` |
| ErrorState / toast | O | — | — | M | M | — | — | |
| RTL layout | — | — | — | M | M | — | RV | Persian-first |

---

## Locale & shared

| Feature / module | Unit | Contract | Integration | E2E | Manual | Security | RV | Notes |
|------------------|:----:|:--------:|:-----------:|:---:|:------:|:--------:|:--:|-------|
| Jalali dates | **R** | — | — | — | M | — | — | `jalali.test.ts` |
| Currency/format | **R** | — | — | — | M | — | — | `format.test.ts` |
| Validators (Zod) | **R** | — | — | — | M | — | — | `validators.test.ts` |

---

## How to use this matrix in PR review

1. Identify rows your PR touches  
2. Every **R** column you changed → test updated or gap justified  
3. **S** columns → run security manual steps  
4. Release cuts → **RV** column on staging + prod  

---

## Coverage count (baseline)

Current automated: **19** test files, **87** tests (`npm test`).  
Update this line when significantly growing integration suite.
