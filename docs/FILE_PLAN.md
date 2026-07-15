# نقشه فایل‌های کسب‌یار

## Batch 1 — زیرساخت (انجام شد)
- `package.json`, `.gitignore`, `.env.example`
- `docker/docker-compose.yml`
- `prisma/schema.prisma`, `prisma/seed.ts`
- `packages/config/*`, `packages/shared/*`
- `apps/ai-service/*`
- `apps/web` — config, lib, server, UI primitives, middleware

## Batch 2 — API و احراز هویت (انجام شد)
- `apps/web/src/app/api/auth/*`
- `apps/web/src/app/api/{customers,leads,invoices,payments,tasks,dashboard,conversation,automation}/*`
- `apps/web/src/server/**/*`

## Batch 3 — UI و صفحات (انجام شد)
- `apps/web/src/components/layout/*`
- `apps/web/src/components/ui/*`
- `apps/web/src/components/features/*`
- `apps/web/src/app/(auth)/*`
- `apps/web/src/app/(app)/**/*`

## Batch 4 — سخت‌سازی (بعدی)
- تست‌های واحد سرویس‌ها
- آپلود فایل واقعی
- اجرای اتوماسیون scheduled
- vertical pack modules
