# متغیرهای محیط (Environment)

مرجع کامل env vars. نمونه‌ها: `.env.example`، `deploy/env/*.env.example`  
Next.js dev همچنین به `apps/web/.env.local` نیاز دارد.

## هسته

| متغیر | الزامی | پیش‌فرض | مصرف‌کننده | توضیح |
|--------|--------|---------|------------|--------|
| `APP_ENV` | خیر | `development` | shared ops, health | `development` \| `staging` \| `production` \| `test` |
| `NODE_ENV` | خیر | `development` | Next.js | fallback برای `APP_ENV` |
| `DATABASE_URL` | **بله** | — | Prisma, scripts | PostgreSQL connection string |
| `SESSION_SECRET` | prod: **بله** | dev fallback | auth | ≥۱۶ کاراکتر؛ کوکی session |

## وب (Next.js)

| متغیر | الزامی | پیش‌فرض | توضیح |
|--------|--------|---------|--------|
| `NEXT_PUBLIC_APP_URL` | بله | `http://localhost:3000` | URL عمومی برای redirect |
| `NEXT_PUBLIC_DEMO_MODE` | خیر | `false` | نمایش UI دمو (کلاینت) |

## سرویس AI

| متغیر | الزامی | پیش‌فرض | توضیح |
|--------|--------|---------|--------|
| `AI_SERVICE_URL` | خیر* | `http://localhost:8000` | *برای دستیار کامل بله |
| `AI_SERVICE_TOKEN` | خیر* | — | توکن داخلی سرویس‌به‌سرویس |
| `AI_SERVICE_TIMEOUT_MS` | خیر | `8000` | timeout درخواست |
| `AI_SERVICE_RETRIES` | خیر | `1` | تعداد retry |

## فایل و آپلود

| متغیر | الزامی | پیش‌فرض | توضیح |
|--------|--------|---------|--------|
| `UPLOAD_DIR` | خیر | `./uploads` | مسیر ذخیره local (adapter) |
| `MAX_UPLOAD_SIZE_MB` | خیر | `10` | سقف حجم آپلود |
| `STORAGE_PROVIDER` | خیر | `local` | `local` \| `s3` — [integrations](../integrations/provider-selection-policy.md) |

## یکپارچه‌سازی (providers)

| متغیر | الزامی | پیش‌فرض | توضیح |
|--------|--------|---------|--------|
| `BILLING_PROVIDER` | خیر | `manual` | `manual` \| `zarinpal` \| `idpay` |
| `NOTIFICATION_PROVIDER` | خیر | `noop` | `noop` \| `kavenegar` \| `resend` |
| `SMS_PROVIDER` | خیر | — | alias برای notification اگر unset |
| `ANALYTICS_PROVIDER` | خیر | `log` | `log` \| `posthog` |

Secrets per vendor: `BILLING_*`, `SMS_*`, `EMAIL_*`, `STORAGE_S3_*`, `ANALYTICS_POSTHOG_*` — فقط در adapter.

→ [docs/integrations/](../integrations/)

## عملیات و لاگ

| متغیر | الزامی | پیش‌فرض | توضیح |
|--------|--------|---------|--------|
| `LOG_LEVEL` | خیر | `debug` (dev) | `debug` \| `info` \| `warn` \| `error` |
| `SENTRY_DSN` | خیر | — | مانیتورینگ خطا |
| `SENTRY_ENVIRONMENT` | خیر | — | برچسب محیط در Sentry |

## دمو / seed

| متغیر | الزامی | پیش‌فرض | توضیح |
|--------|--------|---------|--------|
| `DEMO_MODE` | خیر | `false` | فعال‌سازی API دمو (سرور) |
| `ALLOW_SEED` | خیر | `true` (dev) | seed/reseed؛ **production: false** |

## Feature flags (see docs/flags/)

| متغیر | پیش‌فرض | توضیح |
|--------|---------|--------|
| `FEATURE_FLAG_<KEY>` | off | release/beta — dots → underscores |
| `KILL_SWITCH_<KEY>` | off | `true` disables capability |
| `PILOT_FLAG_<KEY>` | off | pilot-wave features |

## عملیات مخرب DB (اسکریپت‌ها)

| متغیر | متى | توضیح |
|--------|-----|--------|
| `CONFIRM_MIGRATE_DEPLOY` | `true` | الزام برای `db:migrate:deploy` در production |
| `CONFIRM_RESTORE` | `true` | الزام برای `db:restore` |
| `ALLOW_RESTORE` | `true` | الزام اضافی restore در production |
| `BACKUP_DIR` | خیر | مسیر خروجی backup (پیش‌فرض: `./backups`) |

## اعتبارسنجی

`apps/web/src/lib/env.ts` — Zod schema برای runtime web.

## چک‌لیست افزودن env جدید

1. `.env.example`
2. `deploy/env/local.env.example` (+ staging/production در صورت نیاز)
3. این فایل (`ENVIRONMENT.md`)
4. `env.ts` اگر web مصرف می‌کند
5. ADR اگر تصمیم معماری است
