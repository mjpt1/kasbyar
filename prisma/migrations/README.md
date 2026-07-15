# Prisma migrations

این پوشه تاریخچه migration رسمی را نگه می‌دارد.

## شروع (baseline)

اگر هنوز migration ندارید:

```bash
# پس از همگام‌سازی schema با دیتابیس dev
npx prisma migrate dev --name init --schema=./prisma/schema.prisma
```

فایل‌های تولیدشده را commit کنید.

## استقرار

```bash
# staging/production — پس از backup
CONFIRM_MIGRATE_DEPLOY=true npm run db:migrate:deploy
```

## توسعه سریع (فقط local)

```bash
npm run db:push
```

`db:push` جایگزین migration در production نیست.

راهنمای کامل: [docs/MIGRATIONS.md](../docs/MIGRATIONS.md)
