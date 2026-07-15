# مهاجرت دیتابیس (Migrations)

راهنمای عملی تغییر اسکیما در کسب‌یار.

## اصل‌ها

| محیط | روش پیشنهادی |
|------|----------------|
| Local dev | `db:push` + seed برای سرعت |
| Staging | `prisma migrate dev` → commit → `db:migrate:deploy` |
| Production | **فقط** `db:migrate:deploy` پس از backup و تست staging |

منبع حقیقت: `prisma/schema.prisma`

## جریان پیشنهادی تغییر اسکیما

1. تغییر `schema.prisma`
2. `npm run db:migrate` (نام توصیفی، مثلاً `add_customer_deleted_at`)
3. بررسی SQL تولیدشده در `prisma/migrations/`
4. تست local + `npm test`
5. PR با migration commit شده
6. **Staging:** `npm run db:backup` سپس `npm run db:migrate:deploy`
7. smoke test اپ
8. **Production:** backup → `CONFIRM_MIGRATE_DEPLOY=true npm run db:migrate:deploy`

## Rollback

Prisma rollback خودکار ندارد. در صورت شکست:

1. اپ را در حالت read-only نگه دارید (در صورت امکان)
2. از backup قبل از migration بازگردانی کنید — [BACKUP_RESTORE.md](./BACKUP_RESTORE.md)
3. نسخه قبلی اپ را deploy کنید
4. post-mortem و اصلاح migration

## Backfill برای فیلدهای non-null

الگوی سه مرحله‌ای:

1. فیلد optional اضافه کنید + backfill در اسکریپت یا seed
2. اپ را deploy کنید تا داده پر شود
3. migration بعدی: `NOT NULL` + default

## Seed در مقابل migration

| عملیات | ابزار | production |
|--------|--------|------------|
| داده نمونه دمو | `db:seed` / `db:reseed` | فقط با `ALLOW_SEED=true` |
| تغییر ساختار | migration | همیشه با backup |

`db:reseed` اکنون از `scripts/db-reseed-guard.ts` عبور می‌کند.

## Enum و وضعیت‌ها

- مقادیر enum جدید را ابتدا در کد و schema اضافه کنید
- مقادیر قدیمی را تا deploy کامل نگه دارید
- حذف enum value نیاز به migration داده‌ای دارد

## چک‌لیست production

- [ ] migration در staging اجرا و smoke test شده
- [ ] `npm run db:backup` گرفته شده
- [ ] پنجره نگهداری یا deploy بدون downtime برنامه‌ریزی شده
- [ ] `CONFIRM_MIGRATE_DEPLOY=true` تنظیم شده
- [ ] نسخه اپ با schema سازگار deploy می‌شود
- [ ] `/api/health/ready` بعد از migrate سبز است

## محدودیت‌های فعلی

- تاریخچه migration ممکن است در repo در حال baseline باشد (`prisma/migrations/README.md`)
- rollback خودکار وجود ندارد — restore دستی

**ADR:** [decisions/016-prisma-migration-policy.md](./decisions/016-prisma-migration-policy.md)
