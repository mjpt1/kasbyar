# استقرار KesbYar

راهنمای استقرار production-friendly برای تیم کوچک استارتاپ.

## مدل استقرار پیش‌فرض

| جزء | توصیه |
|-----|--------|
| **Web** | کانتینر Next.js standalone |
| **AI** | کانتینر FastAPI (شبکه داخلی) |
| **DB** | PostgreSQL مدیریت‌شده یا کانتینر جدا در staging |
| **Ingress** | Nginx / LB پلتفرم / Cloudflare |

Kubernetes اختیاری است؛ ساختار health و env برای مهاجرت بعدی آماده است.

## محیط‌ها

| محیط | فایل نمونه | توضیح |
|------|-----------|--------|
| Local | `deploy/env/local.env.example` | توسعه |
| Staging | `deploy/env/staging.env.example` | smoke / QA |
| Production | `deploy/env/production.env.example` | مقادیر واقعی فقط در secret store |

کپی نمونه‌ها را **هرگز** با secret واقعی commit نکنید.

## متغیرهای حیاتی

| متغیر | الزامی در prod | توضیح |
|-------|----------------|--------|
| `DATABASE_URL` | بله | اتصال PostgreSQL |
| `SESSION_SECRET` | بله (≥۱۶ کاراکتر) | کوکی نشست |
| `NEXT_PUBLIC_APP_URL` | بله | URL عمومی اپ |
| `AI_SERVICE_URL` | بله | آدرس داخلی FastAPI |
| `AI_SERVICE_TOKEN` | بله | توکن سرویس‌به‌سرویس |
| `ALLOW_SEED` | خیر (`false`) | seed فقط dev/staging کنترل‌شده |
| `LOG_LEVEL` | خیر | `debug` / `info` / `warn` / `error` |
| `SENTRY_DSN` | خیر | مانیتورینگ (اختیاری) |

## Docker — توسعه محلی

```bash
npm run docker:up          # postgres + ai-service
cp .env.example .env
npm run setup
npm run dev
```

## Docker — staging کامل

```bash
cp deploy/env/staging.env.example deploy/env/staging.env
# ویرایش secretها

docker compose -f docker/docker-compose.staging.yml \
  --env-file deploy/env/staging.env \
  --profile migrate up -d migrate

docker compose -f docker/docker-compose.staging.yml \
  --env-file deploy/env/staging.env up -d
```

## Build تصاویر production

```bash
# از ریشه repo
docker build -f apps/web/Dockerfile -t kesbyar-web:latest .
docker build -f apps/ai-service/Dockerfile -t kesbyar-ai:latest apps/ai-service
```

## Health checks

| سرویس | Liveness | Readiness |
|-------|----------|-----------|
| Web | `GET /api/health` | `GET /api/health/ready` (DB + AI اختیاری) |
| AI | `GET /health` | `GET /ready` |

```bash
sh deploy/scripts/verify-health.sh
```

## CI

GitHub Actions: `.github/workflows/ci.yml`

- `npm ci` → lint → typecheck → test → build
- compileall + import smoke برای AI
- build Docker روی push

اجرای محلی:

```bash
npm run ci
```

## Seed و reset در production

- `npm run db:seed` در `APP_ENV=production` **مسدود** است مگر `ALLOW_SEED=true`
- `db:reset` را در production اجرا نکنید

## لاگ‌ها

- Web: JSON structured در `NODE_ENV=production` (`lib/logger.ts`)
- AI: JSON-ish log lines (`app/core/logging.py`)
- سطح: `LOG_LEVEL`

## مانیتورینگ

- `lib/monitoring.ts` — آماده Sentry (`SENTRY_DSN`)
- خطاها از `handleApiError` و `captureException` در لاگ structured ثبت می‌شوند

## عیب‌یابی

| مشکل | بررسی |
|------|--------|
| Web 503 on `/api/health/ready` | `DATABASE_URL`، postgres در دسترس |
| AI degraded در داشبورد | `AI_SERVICE_URL` از داخل شبکه docker |
| Session logout مکرر | `SESSION_SECRET` ثابت بین replicaها |
| Build Docker شکست | `npm ci` از ریشه monorepo |

جزئیات عملیات: [OPERATIONS.md](./OPERATIONS.md)
