# معماری Vertical Packs — کسب‌یار

## مدل محصول

```
┌─────────────────────────────────────────┐
│           Shared Core (همیشه فعال)       │
│  مشتریان · لیدها · فاکتور · پرداخت ·    │
│  وظایف · فعالیت · گزارش · دستیار        │
└──────────────────┬──────────────────────┘
                   │ extends
     ┌─────────────┼─────────────┐
     ▼             ▼             ▼
  CLINIC    TRAVEL_AGENCY    RETAIL
```

هر **Organization** یک `industryPack` دارد (تنظیم در ثبت‌نام). هسته مشترک برای همه فعال است؛ ماژول عمودی فقط وقتی pack مربوطه فعال است در منو و API در دسترس است.

## لایه‌های معماری

| لایه | مسیر | نقش |
|------|------|-----|
| Registry | `packages/shared/src/packs/` | متادیتا، برچسب‌ها، آیتم‌های منو |
| Schema | `prisma/schema.prisma` → `Vertical Packs` | مدل‌های pack-specific با `organizationId` |
| Services | `apps/web/src/server/packs/` | منطق دامنه هر pack |
| API | `apps/web/src/app/api/packs/` | REST با `requireApiPack()` |
| UI | `apps/web/src/app/(app)/{clinic,travel,retail}/` | صفحات RTL فارسی |
| Navigation | `apps/web/src/config/navigation.ts` | `getNavItems(industryPack)` |

## فعال‌سازی Pack

- **Workspace/Org:** `Organization.industryPack` (enum Prisma)
- **Session:** `SessionContext.industryPack` از `workspace.service`
- **صفحات:** `requirePackPage('CLINIC')` — در غیر این صورت redirect به داشبورد
- **API:** `requireApiPack('CLINIC')` — پاسخ 403

## Packها و قابلیت‌های MVP

### کلینیک (`CLINIC`)
- **بیماران:** `PatientProfile` → لینک به `Customer`
- **نوبت‌ها:** `Appointment` + وضعیت + پزشک (`Practitioner`)
- **ویزیت:** `VisitRecord` (پایه پرونده)
- **داشبورد:** نوبت امروز، از دست رفته، پیگیری

### مسافرتی (`TRAVEL_AGENCY`)
- **مسافران:** `TravelerProfile` → `Customer`
- **رزرو:** `TravelBooking` + وضعیت + تاریخ حرکت
- **داشبورد:** درخواست باز، اعزام ۳۰ روز، مانده حساب

### خرده‌فروشی (`RETAIL`)
- **محصول:** همان `Product` هسته + `reorderLevel`
- **موجودی:** `StockMovement` (ورود/خروج/تعدیل)
- **داشبورد:** کم‌موجود، گردش ۷ روز

## داده نمونه

پس از `npm run db:reseed`:

| Workspace | slug | Pack |
|-----------|------|------|
| کلینیک دندانپزشکی سپهر | `demo-clinic` | CLINIC |
| آژانس آسمان آبی | `demo-travel` | TRAVEL_AGENCY |
| فروشگاه آرتین | `demo-retail` | RETAIL |

ورود: `demo@kesbyar.ir` / `demo1234` → انتخاب workspace مربوطه.

## افزودن Pack جدید

1. enum `IndustryPack` در Prisma
2. entry در `PACK_REGISTRY`
3. مدل‌های schema با `organizationId`
4. `server/packs/<name>/` + API + صفحات
5. seed در `prisma/seed/scenarios/`
6. ویجت در `pack-dashboard.service.ts`

## محدودیت‌های فعلی

- یک pack اصلی per organization (بدون multi-pack)
- `Organization.extension` JSON هنوز در UI استفاده نمی‌شود
- پرونده پزشکی کامل / EMR نیست — پایه عملیاتی
- انبارداری پیشرفته (چند انبار، بارکد) خارج از scope

**ADR:** [decisions/012-vertical-pack-extension.md](./decisions/012-vertical-pack-extension.md)
