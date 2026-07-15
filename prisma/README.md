# Prisma Migrations

## توسعه محلی (سریع)

```bash
npm run db:push
npm run db:seed
```

## migration رسمی

```bash
npm run db:migrate
# نام migration را وارد کنید
```

استقرار: `CONFIRM_MIGRATE_DEPLOY=true npm run db:migrate:deploy`

راهنمای کامل: [docs/MIGRATIONS.md](../docs/MIGRATIONS.md)

## Reset (فقط dev)

```bash
npm run db:reset
```

## Reseed (با محافظ)

```bash
npm run db:reseed
```

اسکیما در `prisma/schema.prisma` منبع حقیقت است.
تاریخچه migration: `prisma/migrations/`
