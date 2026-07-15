# عملیات و مانیتورینگ KesbYar

**قرارداد observability:** [observability/README.md](./observability/README.md)  
**سیاست degradation:** [reliability/README.md](./reliability/README.md)

## لاگ‌ها

### Web (Next.js)

- Helper: `apps/web/src/lib/logger.ts`
- Events: `packages/shared/src/observability/log-events.ts` (`APP_LOG_EVENTS`)
- Helpers: `apps/web/src/lib/observability.ts`
- Production: یک خط JSON per log
- فیلدها: `level`, `message`, `timestamp`, `service`, `environment`, optional `organizationId`, `userId`, `requestId`, `kind` (metrics)
- سطح حداقلی: `LOG_LEVEL` (پیش‌فرض production: `info`)
- Redaction: `packages/shared/src/observability/sanitize.ts`

### AI (FastAPI)

- `apps/ai-service/app/core/logging.py`
- سطح: env `LOG_LEVEL`
- Policy: [observability/logging-policy.md](./observability/logging-policy.md) §8

### Audit (database)

- `AuditEvent` table — not stdout — see [observability/observability-contract.md](./observability/observability-contract.md) §2

### همبستگی درخواست

از `logger.withRequest(requestId, context)` در API handlerها — [support-investigation-guide.md](./observability/support-investigation-guide.md)

## خطاها

- API: `handleApiError` در `lib/api-auth.ts` — بدون leak stack به کاربر
- `captureException` در `lib/monitoring.ts` — ثبت structured + آماده Sentry

## Sentry (اختیاری)

1. `SENTRY_DSN` و `SENTRY_ENVIRONMENT` را set کنید
2. `@sentry/nextjs` نصب و `instrumentation.ts` wire کنید
3. `initMonitoring()` در bootstrap فراخوانی شود

تا زمان نصب SDK، DSN فقط در لاگ ثبت می‌شود.

## Health در orchestration

**Kubernetes-style probes:**

```yaml
livenessProbe:
  httpGet:
    path: /api/health
    port: 3000
readinessProbe:
  httpGet:
    path: /api/health/ready
    port: 3000
```

AI service:

```yaml
livenessProbe:
  httpGet:
    path: /health
    port: 8000
readinessProbe:
  httpGet:
    path: /ready
    port: 8000
```

## Staging vs Production

| | Staging | Production |
|--|---------|------------|
| `LOG_LEVEL` | info | warn |
| `ALLOW_SEED` | false | false |
| Docs FastAPI | ممکن است فعال | غیرفعال (`DEBUG=false`) |
| DB | container یا managed dev | managed + SSL |
| AI exposure | internal network only | internal network only |

## پشتیبان‌گیری

- PostgreSQL: snapshot روزانه managed provider
- `UPLOAD_DIR`: volume جدا sync شود

## امنیت عملیاتی

- `AI_SERVICE_TOKEN` را rotate کنید
- `SESSION_SECRET` را per-environment منحصر کنید
- AI را پشت firewall داخلی نگه دارید — فقط web به آن دسترسی دارد
- CORS AI: `CORS_ORIGINS` (comma-separated) — معمولاً فقط origin وب

## CD-ready

CI artifact: Docker images `kesbyar-web`, `kesbyar-ai`

مرحله بعد (خارج از repo):

- push به registry
- deploy staging از tag `staging`
- deploy production از tag semver با approval
