# Convention Inventory — KesbYar

قراردادهای مشاهده‌شده در مخزن. توسعه جدید باید هم‌راستا باشد.

---

## 1. نام‌گذاری

| نوع | قرارداد | مثال |
|-----|---------|------|
| پکیج npm | `@kesbyar/{name}` | `@kesbyar/web` |
| فایل TypeScript | kebab-case | `invoice.service.ts` |
| سرویس دامنه | `{domain}.service.ts` | `customer.service.ts` |
| کامپوننت feature | `{domain}-{purpose}.tsx` | `customers-create-form.tsx` |
| تست | هم‌مسیر `*.test.ts` | `invoice-math.test.ts` |
| API route | `app/api/{resource}/route.ts` | `customers/route.ts` |
| Prisma model | PascalCase | `InvoiceItem` |
| Prisma field | camelCase | `organizationId` |
| Enum DB | SCREAMING_SNAKE | `IN_PROGRESS` |
| کوکی | `kesbyar_*` | `kesbyar_session` |
| Demo org slug | `demo-{name}` | `demo-clinic` |
| Audit action | dot notation | `invoice.status_change` |

---

## 2. ساختار ماژول جدید (core)

```
apps/web/src/
  app/(app)/{module}/page.tsx          # لیست
  app/(app)/{module}/[id]/page.tsx     # جزئیات (اختیاری)
  app/(app)/{module}/loading.tsx       # skeleton (توصیه)
  app/api/{module}/route.ts
  app/api/{module}/[id]/route.ts
  server/{module}/{module}.service.ts
  components/features/{module}/        # forms, tables
```

---

## 3. ساختار ماژول pack

```
apps/web/src/
  app/(app)/{pack}/{feature}/page.tsx
  app/api/packs/{pack}/.../route.ts
  server/packs/{pack}/{pack}.service.ts
packages/shared/src/packs/registry.ts   # nav + labels
prisma/seed/scenarios/verticals.ts      # داده دمو
```

---

## 4. الگوی service function

```typescript
// اولین پارامتر همیشه organizationId از session
export async function listItems(
  organizationId: string,
  params: { search?: string; page?: number },
) {
  return prisma.item.findMany({
    where: { organizationId, ...ACTIVE_RECORD_FILTER },
  });
}
```

---

## 5. الگوی API route

```typescript
export async function GET() {
  try {
    const session = await requireApiSession();
    const data = await listItems(session.organizationId, {});
    return jsonResponse(apiSuccess(data));
  } catch (e) {
    return handleApiError(e);
  }
}
```

---

## 6. UI و فارسی

- متن کاربر: فارسی طبیعی
- Layout: RTL (`dir="rtl"` در root layout)
- تاریخ: `<JalaliDate />` یا `format` از shared
- مبلغ: `formatCurrency` از `@kesbyar/shared`
- تلفن/ایمیل: `dir="ltr"` روی فیلد
- خطا: فارسی از `handleApiError` / toast

---

## 7. State components (استاندارد)

| حالت | کامپوننت |
|------|----------|
| خالی صفحه | `EmptyState` |
| خالی بخش | `InlineEmpty` |
| بارگذاری | `LoadingState` / `*PageSkeleton` |
| خطا | `ErrorState` / `error.tsx` |
| قفل طرح | `UpgradePrompt` |
| مخرب | `DestructiveActionButton` |

---

## 8. Shared package boundaries

| داخل `shared` | خارج `shared` |
|---------------|---------------|
| types، constants، pure functions | Prisma calls |
| plan definitions | HTTP |
| pack registry metadata | React components |
| jalali/format | session |

---

## 9. Env و scripts

- env جدید → `.env.example` + `docs/ENVIRONMENT.md`
- اسکریپت مخرب → guard در `packages/shared/src/ops/destructive.ts`
- تصمیم معماری → `docs/decisions/` — [when to write an ADR](../decisions/README.md#چه-زمانی-adr-لازم-است)

---

## 10. Deprecations فعلی (حذف نکنید بدون جایگزین)

| فایل | جایگزین |
|------|---------|
| `lib/ai-client.ts` | `lib/ai/index.ts` |
| `APP_NAV_ITEMS` | `getNavItems(industryPack)` |
| `app-sidebar.tsx` | `app-layout-client.tsx` |
