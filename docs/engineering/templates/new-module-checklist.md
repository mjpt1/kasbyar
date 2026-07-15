# New Core Module Checklist

قالب برای افزودن ماژول جدید به **هسته مشترک** (نه vertical pack).

---

## Planning

- [ ] نام ماژول انگلیسی kebab-case: `___________`
- [ ] برچسب فارسی UI: `___________`
- [ ] در navigation قرار می‌گیرد؟ بله / خیر
- [ ] نیاز به plan gate دارد؟ feature key: `___________`

---

## Database

- [ ] model(ها) در `prisma/schema.prisma` با `organizationId`
- [ ] migration یا `db:push` در dev documented
- [ ] seed minimal (اگر دمو نیاز دارد)

---

## Server

- [ ] `server/{module}/{module}.service.ts`
- [ ] همه functions: `(organizationId, ...)`
- [ ] `tenant-scope` برای FK اگر به entity دیگر وصل است
- [ ] `ACTIVE_RECORD_FILTER` اگر soft-delete

---

## API

- [ ] `app/api/{module}/route.ts`
- [ ] `app/api/{module}/[id]/route.ts` (اگر لازم)
- [ ] `requireApiSession()` + `handleApiError`
- [ ] `assertFeature` اگر gated

---

## UI

- [ ] `app/(app)/{module}/page.tsx` (RSC)
- [ ] `loading.tsx` با skeleton
- [ ] `components/features/{module}/` forms/tables
- [ ] `EmptyState` / `ListPagination` / `ListSearch` الگوی لیست
- [ ] microcopy فارسی

---

## Cross-cutting

- [ ] `config/navigation.ts` اگر nav item
- [ ] audit log برای actions مهم
- [ ] validator در `lib/validators` اگر فرم پیچیده
- [ ] تست: validator یا business logic حداقل

---

## Docs

- [ ] [change-impact-checklist.md](../change-impact-checklist.md) پر شده
- [ ] env جدید → ENVIRONMENT.md
- [ ] ADR فقط اگر تصمیم معماری

---

## Manual smoke

- [ ] create → list → detail → edit
- [ ] user org A cannot access org B IDs
- [ ] RTL و فارسی درست نمایش داده می‌شود
