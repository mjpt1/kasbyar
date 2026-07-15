# پشتیبان‌گیری و بازگردانی

## اهداف عملی (RPO/RTO)

| محیط | RPO هدف | RTO هدف | روش |
|------|---------|---------|-----|
| Local | اختیاری | دقایق | `db:reseed` یا restore فایل |
| Staging | ۲۴ ساعت | ۱–۲ ساعت | backup روزانه + restore دستی |
| Production | ۱–۴ ساعت* | ۲–۴ ساعت* | backup مدیریت‌شده + runbook |

\* بسته به ارائه‌دهنده DB (RDS، managed PostgreSQL و غیره) تنظیم کنید.

## پشتیبان‌گیری از CLI

```bash
# نیاز به pg_dump در PATH
npm run db:backup
```

خروجی پیش‌فرض: `backups/kesbyar-<env>-<timestamp>.sql`

متغیر اختیاری: `BACKUP_DIR=./my-backups`

### از Docker

```bash
docker exec kesbyar-postgres pg_dump -U kesbyar kesbyar > backup.sql
```

## بازگردانی

**هشدار:** داده فعلی بازنویسی می‌شود.

```bash
# local/staging
CONFIRM_RESTORE=true npm run db:restore -- backups/your-file.sql

# production — هر دو فلگ لازم است
ALLOW_RESTORE=true CONFIRM_RESTORE=true npm run db:restore -- /path/to/backup.sql
```

پس از restore:

1. `npm run verify:health` یا `/api/health/ready`
2. نمونه‌گیری از داده tenant
3. بررسی audit log

## قبل از migration

```bash
npm run db:backup
# سپس migrate
```

## نگهداری backup

- فایل‌های `backups/` در git نیستند (`.gitignore`)
- staging/production: backup را در object storage نگه دارید
- رمز عبور و secrets داخل dump نیستند — فقط داده schema

## بازیابی حادثه (خلاصه)

1. تشخیص: health check، خطای migrate، گزارش مشتری
2. توقف عملیات مخرب (deploy، seed، demo reset)
3. آخرین backup سالم را شناسایی کنید
4. restore به instance جدید یا همان DB (با تأیید)
5. deploy نسخه سازگار اپ
6. ثبت در audit و post-mortem

جزئیات عملیات: [OPERATIONS.md](./OPERATIONS.md) · [DATA_SAFETY.md](./DATA_SAFETY.md)
