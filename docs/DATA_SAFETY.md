# امنیت داده و حاکمیت عملیاتی

نمای کلی لایه اعتماد داده در کسب‌یار — migration، backup، tenant isolation، audit.

## اجزای پیاده‌سازی‌شده

| حوزه | مسیر / ابزار |
|------|----------------|
| محافظ عملیات مخرب | `scripts/ops/destructive-guard.ts` |
| Reseed امن | `npm run db:reseed` → `scripts/db-reseed-guard.ts` |
| Backup / restore | `npm run db:backup` · `npm run db:restore` |
| Migrate deploy | `npm run db:migrate:deploy` |
| محدوده tenant | `apps/web/src/server/tenant/tenant-scope.ts` |
| Audit | `AuditEvent` + `apps/web/src/server/audit/` |
| بایگانی نرم | `deletedAt` روی Customer، Lead، Invoice |
| UI ممیزی | `/settings/audit` (ADMIN+) |
| API ممیزی | `GET /api/audit` |

## اصل tenant safety

1. **مرز tenant = `organizationId`** — نه workspaceId
2. هر query روی داده tenant باید `organizationId` از session داشته باشد
3. IDهای foreign در POST باید با `tenant-scope` اعتبارسنجی شوند
4. IDOR → پاسخ `404` (بدون افشای وجود رکورد در tenant دیگر)
5. عملیات مخرب production بدون فلگ صریح مسدود است

## Audit در مقابل Activity log

| نوع | مدل | کاربرد |
|-----|------|--------|
| Activity | `ActivityLog` | timeline کسب‌وکار (مشتری، فاکتور، لید) |
| Audit | `AuditEvent` | رویدادهای حساس امنیتی/عملیاتی |

رویدادهای audit نمونه: ورود، تغییر تنظیمات، ثبت پرداخت، تغییر وضعیت فاکتور، بایگانی مشتری، بازنشانی دمو.

Secrets در metadata ذخیره نمی‌شوند (`sanitizeAuditMetadata`).

## سیاست حذف

| موجودیت | رفتار |
|---------|--------|
| Customer | بایگانی نرم (`deletedAt`) |
| Lead / Invoice | فیلد `deletedAt`؛ archive invoice فقط DRAFT/CANCELLED |
| Seed / reset | فقط demo slugs؛ production guard |

## فلگ‌های محیط

| فلگ | معنی |
|-----|------|
| `ALLOW_SEED=true` | seed / reseed / reset در production |
| `CONFIRM_RESTORE=true` | اجازه restore در dev/staging |
| `ALLOW_RESTORE=true` | + production restore |
| `CONFIRM_MIGRATE_DEPLOY=true` | migrate deploy در production |

## مستندات مرتبط

- [MIGRATIONS.md](./MIGRATIONS.md)
- [BACKUP_RESTORE.md](./BACKUP_RESTORE.md)
- [OPERATIONS.md](./OPERATIONS.md)
- [DEMO.md](./DEMO.md) — بازنشانی دمو

## محدودیت‌ها و گام‌های بعدی

- Prisma middleware سراسری برای tenant هنوز اضافه نشده (انضباط در سرویس‌ها)
- export کامل داده tenant به صورت self-service در roadmap
- backup خودکار cloud-specific در repo نیست — runbook و اسکریپت pg_dump ارائه شده
- certification (SOC2/ISO) ادعا نشده — پایه product-level audit
- **Retention policy:** [data/data-retention-policy.md](./data/data-retention-policy.md)

## بررسی سریع قبل از production

- [ ] `ALLOW_SEED` خاموش
- [ ] `DEMO_MODE` خاموش (مگر محیط فروش جدا)
- [ ] migration history commit شده
- [ ] backup زمان‌بندی‌شده فعال
- [ ] نقش ADMIN برای audit محدود به مالک/مدیر

**ADR:** [decisions/014-audit-data-safety.md](./decisions/014-audit-data-safety.md)
