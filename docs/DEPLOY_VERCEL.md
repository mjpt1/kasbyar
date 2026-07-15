# استقرار روی Vercel

راهنمای deploy اپ وب KesbYar روی Vercel (monorepo).

## پیش‌نیاز

1. مخزن روی GitHub
2. **PostgreSQL ابری** (Neon، Supabase، Vercel Postgres، یا هر host دیگر)
3. migration/schema روی دیتابیس production

> FastAPI (`apps/ai-service`) روی Vercel اجرا نمی‌شود. بدون آن اپ کار می‌کند (حالت fallback دستیار). برای دستیار کامل، AI را جدا deploy کنید (Railway، Render، VPS).

## مراحل Vercel

### ۱. Import پروژه

1. [vercel.com/new](https://vercel.com/new) → Import از GitHub
2. مخزن `kasbyar` را انتخاب کنید

### ۲. تنظیمات پروژه

| فیلد | مقدار |
|------|--------|
| **Root Directory** | `apps/web` |
| **Framework** | Next.js (خودکار) |
| **Include files outside root** | ✅ فعال |

`apps/web/vercel.json` دستور install/build monorepo را تنظیم می‌کند.

### ۳. Environment Variables

در Vercel → Settings → Environment Variables:

| متغیر | الزامی | نمونه |
|--------|--------|--------|
| `DATABASE_URL` | بله | `postgresql://...` |
| `SESSION_SECRET` | بله | رشته تصادفی ≥۳۲ کاراکتر |
| `NEXT_PUBLIC_APP_URL` | بله | `https://your-app.vercel.app` |
| `APP_ENV` | بله | `production` |
| `ALLOW_SEED` | بله | `false` |
| `DEMO_MODE` | خیر | `false` (یا `true` برای نمایش) |
| `NEXT_PUBLIC_DEMO_MODE` | خیر | هم‌راستا با DEMO_MODE |
| `AI_SERVICE_URL` | خیر | URL سرویس FastAPI |
| `AI_SERVICE_TOKEN` | اگر AI دارید | توکن داخلی |
| `UPLOAD_DIR` | خیر | `/tmp/uploads` (موقت serverless) |

مرجع کامل: [ENVIRONMENT.md](./ENVIRONMENT.md)

### ۴. دیتابیس اولیه

پس از ساخت `DATABASE_URL`، یک‌بار از local:

```bash
DATABASE_URL="postgresql://..." npm run db:push
DATABASE_URL="postgresql://..." npm run db:seed   # فقط staging/demo
```

در production معمولاً `ALLOW_SEED=false` و seed دستی فقط برای دمو.

### ۵. Deploy

Push به `main` → Vercel خودکار build می‌کند.

## محدودیت‌های Vercel

| موضوع | توضیح |
|--------|--------|
| آپلود فایل | filesystem موقت — برای production از S3/Blob استفاده کنید |
| AI service | جدا deploy شود |
| pg_dump backup | از CI یا ماشین ops، نه Vercel |

## عیب‌یابی build

- **Prisma client:** `db:generate` در build اجرا می‌شود
- **Workspace packages:** Root Directory باید `apps/web` + include outside root
- **502 login:** `DATABASE_URL` یا migration ناقص

## لینک‌های مرتبط

- [DEPLOYMENT.md](./DEPLOYMENT.md)
- [V1_LAUNCH.md](./V1_LAUNCH.md)
