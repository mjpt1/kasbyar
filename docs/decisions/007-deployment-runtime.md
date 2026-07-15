# ADR-007: Deployment Runtime

**Status:** Accepted

## Context

استقرار برای تیم کوچک با مسیر scale بعدی.

## Decision

- Web: Next.js standalone Docker image
- AI: FastAPI container، شبکه داخلی
- Postgres: managed یا container جدا
- Env per environment: `deploy/env/*.env.example`
- Health: `/api/health`، `/api/health/ready` (DB + optional AI)
- CI: `.github/workflows/ci.yml` — lint, typecheck, test, build, docker build
- Logging: structured `logger.ts`، Sentry اختیاری

`APP_ENV` منبع حقیقت محیط (development/staging/production).

## Consequences

- `ALLOW_SEED=false` در production
- destructive ops نیاز به env confirm flags

## Residual risks

- rate limiting edge — تنظیم در ingress/production
- upload volume در container — persistent volume برای `UPLOAD_DIR`

## Related

- [ADR-013](./013-demo-mode-isolation.md) — demo env in production
- [ADR-014](./014-audit-data-safety.md) — destructive op flags
- [ADR-016](./016-prisma-migration-policy.md)
