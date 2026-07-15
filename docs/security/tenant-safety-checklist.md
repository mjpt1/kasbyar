# Tenant Safety Checklist — KesbYar

چک‌لیست بازبینی **جداسازی tenant** (`organizationId`). برای هر PR که داده لمسی می‌کند — reviewer علامت بزند.

**مرز tenant:** `organizationId` از session — نه از body/query قابل اعتماد.

---

## 1. List queries

- [ ] `findMany` / `count` شامل `where: { organizationId }` است
- [ ] pagination با `take`/`skip` bounded (حداکثر معقول)
- [ ] search/filter روی فیلدهای indexed — بدون raw SQL بدون org filter
- [ ] sort field از allowlist — نه user-controlled column name
- [ ] نتایج soft-deleted فقط اگر عمداً (`ACTIVE_RECORD_FILTER`)

**مسیرهای مرجع:** `server/*/*.service.ts` — الگوی `listX(organizationId, ...)`

---

## 2. Detail queries (get by id)

- [ ] `findFirst({ where: { id, organizationId } })` — نه `findUnique({ id })` تنها
- [ ] 404 وقتی رکورد در org دیگر است (نه 403 با پیام «متعلق به org دیگر»)
- [ ] dynamic route `[id]` همیشه session org را pass می‌کند

**Manual test:** user org A opens `/customers/{id-from-org-B}` → 404 یا empty

---

## 3. Create actions

- [ ] `organizationId` از session inject می‌شود — client نمی‌تواند org دیگر set کند
- [ ] FKها validate: `assertCustomerInOrg`, `assertInvoiceInOrg`, etc. (`tenant-scope.ts`)
- [ ] unique constraints per-org در schema در نظر گرفته شده
- [ ] bulk create محدود یا absent

---

## 4. Update / delete actions

- [ ] update با `where: { id, organizationId }` یا get-then-verify
- [ ] delete = soft delete where policy says so (Customer, Lead, Invoice)
- [ ] hard delete فقط برای entities کم‌ریسک (file attachment scoped)
- [ ] cascade effects همان org (payment → invoice same org)

---

## 5. Joins across tables

- [ ] `include`/`select` relations از root query با org filter شروع می‌شود
- [ ] join دستی (raw) هر دو طرف `organizationId` دارند
- [ ] report aggregations grouped within single org
- [ ] pack entities (Patient, Booking) همان org as parent Customer

---

## 6. Imported external identifiers

- [ ] import CSV/API: هر row به session org bind می‌شود
- [ ] external id (CRM id) optional — dedup within org only
- [ ] phone/email lookup scoped to org
- [ ] no «global» lookup table without org

*V1: bulk import محدود — اگر اضافه شد این بخش اجباری.*

---

## 7. Background jobs / automation

- [ ] automation run با `organizationId` از rule record
- [ ] scheduled job (future) carries org context
- [ ] no job processes all tenants without explicit admin tool

**مسیر:** `server/automation/`, `api/automation/run`

---

## 8. AI data retrieval

- [ ] `buildOperationalContext(organizationId)` — all sub-queries scoped
- [ ] question text does not change org id passed to services
- [ ] AI service receives `organization_id` — does not query DB itself
- [ ] fallback local uses same context builder
- [ ] no cross-org data in prompt assembly

---

## 9. Exports

- [ ] export/report API filters `organizationId`
- [ ] export file/download session-scoped
- [ ] rate/size limits on large exports (or documented gap)

**مسیر:** `server/reports/`, `api/reports`

---

## 10. Audit access

- [ ] `listAuditEvents(organizationId, ...)` only
- [ ] ADMIN+ role on `/api/audit`
- [ ] audit write includes correct org (or null for system pre-auth events only)
- [ ] staff cannot read other users' sessions

---

## 11. Demo / admin bypasses

- [ ] **هیچ** demo flag باعث skip `organizationId` نمی‌شود
- [ ] demo reset فقط demo slugs / seeded data — نه arbitrary org
- [ ] `isDemo` flag on org does not weaken RBAC
- [ ] investor walkthrough = UI only — same API rules

---

## 12. File storage

- [ ] files under `UPLOAD_DIR/{organizationId}/`
- [ ] download verifies path stays in org directory
- [ ] `entityId` ownership before upload

---

## 13. Code pointers

| Utility | File |
|---------|------|
| FK validation | `apps/web/src/server/tenant/tenant-scope.ts` |
| Active records | `ACTIVE_RECORD_FILTER` in tenant module |
| Session org | `lib/auth/session.ts`, `workspace.service` |
| Tests | `tenant-scope.test.ts` |

---

## 14. Sign-off

| Check | Pass |
|-------|------|
| All list/detail/mutate paths scoped | ☐ |
| Manual cross-org test done | ☐ |
| New FK has tenant-scope helper | ☐ |

Reviewer: _______________ Date: _______________
