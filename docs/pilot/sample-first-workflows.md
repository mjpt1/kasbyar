# Sample First Workflows — Onboarding Session

**Duration:** 30–45 minutes  
**Goal:** customer issues real invoice and records payment unaided

---

## Workflow A — مشتری تا فاکتور (core)

```
1. Dashboard — explain KPI cards (2 min)
2. Customers — add "شرکت نمونه" with mobile (5 min)
3. Leads — optional: one open lead (3 min)
4. Invoices — new invoice for customer:
   - one line item
   - status DRAFT → issue (10 min)
5. Payments — record partial or full payment (5 min)
6. Dashboard — show updated receivables (2 min)
```

**Success:** customer clicks through alone on second invoice.

---

## Workflow B — دستیار (if BUSINESS+)

```
1. Open /conversation
2. Ask: «چند فاکتور باز دارم؟»
3. Show degraded badge if AI offline — explain fallback
4. Ask operational question tied to their data
```

**Success:** customer understands AI is helper not authority.

---

## Workflow C — تیم (if multi-user)

```
1. Settings — invite STAFF (or explain roles)
2. Show what STAFF cannot do (billing)
3. Audit — ADMIN can see sensitive actions (/settings/audit)
```

---

## Workflow D — صنعت (pack)

If `industryPack` set:

- Show pack-specific nav / labels
- One pack workflow from [VERTICAL_PACKS.md](../VERTICAL_PACKS.md)

---

## Avoid in first session

- Demo reset
- Bulk delete
- Plan downgrade experiments
- Automation rule editing (unless power user)

---

## Homework for customer

| Day | Task |
|-----|------|
| Day 1 | 2 real customers + 1 invoice |
| Day 3 | Record payment + 1 lead update |
| Day 7 | Try assistant OR reports |
