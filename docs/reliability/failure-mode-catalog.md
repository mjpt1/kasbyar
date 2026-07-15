# Failure Mode Catalog — KesbYar

کاتالوگ failure mode به‌ازای هر وابستگی/زیرسیستم. برای هر مورد: حالت خرابی، رفتار کاربر، رفتار اپراتور، retry، fallback، block/defer، لاگ/audit، بازرسی پشتیبانی.

**مرتبط:** [graceful-degradation-policy](./graceful-degradation-policy.md) · [retry-timeout-guidelines](./retry-timeout-guidelines.md)

---

## نحوه خواندن جدول‌ها

| ستون | معنی |
|------|------|
| **Failure modes** | علل محتمل |
| **User** | آنچه کاربر می‌بیند/می‌تواند انجام دهد |
| **Operator** | آنچه ops/support بررسی می‌کند |
| **Retry** | انتظار retry خودکار |
| **Fallback** | مسیر جایگزین |
| **Block** | چه زمانی action متوقف شود |
| **Defer** | چه زمانی صف/بعداً |
| **Log/Audit** | رویدادهای استاندارد |
| **Support inspect** | چک‌لیست پشتیبانی |

---

## Database (PostgreSQL)

| | |
|--|--|
| **Failure modes** | connection pool exhausted، migration lock، disk full، wrong `DATABASE_URL` |
| **User** | 503 / «خطای سرور»؛ صفحات load نمی‌شوند |
| **Operator** | readiness `database: failed`؛ Prisma errors در log |
| **Retry** | connection pool auto-retry Prisma؛ user retry بعد از recovery |
| **Fallback** | **هیچ** — Tier 0 |
| **Block** | همه mutations و reads tenant-scoped |
| **Defer** | — |
| **Log/Audit** | `health.check.failed`؛ unhandled Prisma |
| **Support inspect** | `GET /api/health/ready`؛ DB uptime؛ recent migrations |

---

## AI Service

**کد:** `lib/ai/client.ts` · `server/intelligence/intelligence.service.ts` · `local-fallback.ts`

| | |
|--|--|
| **Failure modes** | service down، timeout (`AbortError`)، 5xx، invalid token، network partition |
| **User** | خلاصه/پاسخ محلی؛ badge «حالت آفلاین»؛ conversation toast on hard network error |
| **Operator** | `ai_service: degraded/unavailable` در readiness؛ `intelligence.*.fallback` logs |
| **Retry** | `AI_SERVICE_RETRIES` (default 1) on 5xx/timeout in client |
| **Fallback** | `buildLocalOperationalSummary` / `buildLocalAssistantAnswer` |
| **Block** | فقط routeهایی که `assertFeature('aiAssistant')` — 402 نه 500 |
| **Defer** | — |
| **Log/Audit** | `ai.request.*`، `intelligence.*.fallback`، `dependency.degraded`؛ metric `assistant.fallback` |
| **Support inspect** | `AI_SERVICE_URL`، `AI_SERVICE_TOKEN`، FastAPI health، latency |

### سناریو: assistant unavailable، core app usable

✅ **Implemented.** CRM، invoices، leads بدون AI کار می‌کنند. Insight card degraded است نه empty crash.

---

## Feature gating / Entitlements

**کد:** `server/billing/entitlement.service.ts` · `assertFeature` · `PlanUpgradeRequiredError`

| | |
|--|--|
| **Failure modes** | plan row missing، DB error on read، logic bug (wrong limit) |
| **User** | 402 + پیام ارتقا (intended)؛ یا 500 اگر DB down |
| **Operator** | `api.plan_upgrade_required` vs `api.app_error` |
| **Retry** | user retry بعد از fix subscription |
| **Fallback** | **fail-closed** — هرگز unlock رایگان روی DB error |
| **Block** | feature خارج از پلن |
| **Defer** | — |
| **Log/Audit** | `API_PLAN_UPGRADE_REQUIRED` |
| **Support inspect** | `Subscription` row، `planCode`، feature flags در entitlement policy tests |

### سناریو: feature-gating service issue

- اگر query fail → treat as block (500)، نه allow
- اگر limit اشتباه → fix data + `entitlement.policy.test.ts`

---

## Billing / Payment callbacks

**کد:** `subscription.service.ts` · manual billing V1

| | |
|--|--|
| **Failure modes** | delayed gateway callback، duplicate webhook، amount mismatch، provider outage |
| **User** | «در انتظار تأیید» تا reconcile؛ نه وضعیت paid جعلی |
| **Operator** | audit `payment.*`؛ pending records؛ gateway dashboard |
| **Retry** | webhook retry از سمت PSP (آینده)؛ idempotent handler |
| **Fallback** | manual confirm توسط admin (V1) |
| **Block** | upgrade plan تا payment confirm |
| **Defer** | callback processing در queue (آینده) |
| **Log/Audit** | `billing.plan_change`؛ `AUDIT_ACTIONS` payment |
| **Support inspect** | invoice status، audit trail، provider transaction id |

### سناریو: payment confirmation delayed

📋 **post-V1 webhook.** سیاست: status pending، user messaging صادقانه، ops reconcile دستی V1.

---

## File storage / Upload

**کد:** `lib/uploads.ts` · file API routes

| | |
|--|--|
| **Failure modes** | invalid MIME، path traversal، size limit، disk full (future object storage) |
| **User** | پیام رد فارسی؛ آپلود مجدد |
| **Operator** | `file.upload.rejected` با reason |
| **Retry** | user retry با فایل معتبر |
| **Fallback** | — |
| **Block** | upload نامعتبر |
| **Defer** | — |
| **Log/Audit** | `FILE_UPLOAD_REJECTED` / `FILE_UPLOAD_SUCCESS` |
| **Support inspect** | MIME، size env limits، storage path permissions |

---

## Storage / Import

📋 **Bulk import post-V1** — سیاست از پیش تعریف شده:

| | |
|--|--|
| **Failure modes** | partial row validation fail، duplicate key، timeout mid-batch، charset error |
| **User** | «X از Y ردیف import شد» + فایل خطاها؛ داده معتبر commit |
| **Operator** | import job id، row error log |
| **Retry** | failed rows only (re-upload) |
| **Fallback** | — |
| **Block** | entire batch اگر schema invalid |
| **Defer** | large import → background job |
| **Log/Audit** | `import.batch.complete` (آینده)؛ audit per entity created |
| **Support inspect** | job status، validation errors، org scope |

### سناریو: import partially fails

سیاست: **no silent partial** — گزارش explicit؛ transaction boundary per batch.

---

## SMS / Email providers

📋 **post-V1** — V1 reminders در DB (`SEND_REMINDER` automation)

| | |
|--|--|
| **Failure modes** | provider 5xx، invalid number، rate limit، template reject |
| **User** | یادآوری در اپ/navigation؛ عدم دریافت SMS (بدون crash) |
| **Operator** | dispatch failure logs؛ provider status page |
| **Retry** | exponential backoff 3x؛ then dead-letter |
| **Fallback** | in-app reminder record باقی |
| **Block** | — (non-blocking) |
| **Defer** | queue outbound SMS |
| **Log/Audit** | `notification.sms.failed` (آینده) |
| **Support inspect** | `Reminder.isSent`، provider message id |

### سناریو: SMS delivery failure for reminders

سیاست: core app OK؛ reminder record preserved؛ retry async.

---

## Background jobs / Automation

**کد:** `server/automation/automation.service.ts`

| | |
|--|--|
| **Failure modes** | single rule throws، Prisma error in `applyAction`، stale data edge case |
| **User** | سایر قوانین اجرا می‌شوند؛ بدون crash کل run |
| **Operator** | `automation.rule.failed` با ruleId |
| **Retry** | next scheduled run |
| **Fallback** | skip failed rule |
| **Block** | — |
| **Defer** | scheduled cron (آینده infra) |
| **Log/Audit** | `AUTOMATION_RUN_*`، `AUTOMATION_RULE_FAILED` |
| **Support inspect** | rule config، orgId، last run results |

✅ **Per-rule try/catch implemented.**

---

## Analytics / Telemetry

**کد:** `recordMetric` · Sentry stub · `lib/observability.ts`

| | |
|--|--|
| **Failure modes** | sink unreachable، Sentry DSN missing، log pipeline backpressure |
| **User** | **هیچ تأثیری** |
| **Operator** | `monitoring.sentry.missing` info |
| **Retry** | fire-and-forget؛ drop |
| **Fallback** | ignore |
| **Block** | never |
| **Defer** | — |
| **Log/Audit** | local structured log always |
| **Support inspect** | metric volume در logs؛ Sentry env |

---

## External integrations (packs, webhooks)

**کد:** `server/packs/` · future integrations

| | |
|--|--|
| **Failure modes** | third-party timeout، auth expire، schema change |
| **User** | پیام «اتصال موقتاً در دسترس نیست» |
| **Operator** | integration health؛ token expiry |
| **Retry** | 2 retries با backoff کوتاه |
| **Fallback** | disable feature flag per integration |
| **Block** | action needing live integration |
| **Defer** | sync jobs |
| **Log/Audit** | `integration.*.failed` (آینده) |
| **Support inspect** | API credentials، last successful sync |

---

## Demo reset

**کد:** `server/demo/demo-reset.service.ts` · `canResetDemoData()`

| | |
|--|--|
| **Failure modes** | seed throws، env guard wrong، partial seed (transaction fail) |
| **User** | خطای فارسی «داده قبلی سالم» |
| **Operator** | `demo.reset.failed`؛ no success audit |
| **Retry** | admin retry بعد از fix seed |
| **Fallback** | — |
| **Block** | reset اگر `!canResetDemoData()` → `demo.reset.blocked` |
| **Defer** | — |
| **Log/Audit** | attempt always؛ audit **only on success** |
| **Support inspect** | `DEMO_MODE`، `ALLOW_SEED`، seed script logs |

### سناریو: demo reset fails safely

✅ **Implemented** — try/catch، no false success audit.

---

## Database backup

**کد:** `scripts/db-backup.ts`

| | |
|--|--|
| **Failure modes** | `pg_dump` missing، auth fail، disk full، network to DB |
| **User** | **هیچ** (ops script) |
| **Operator** | exit code ≠ 0؛ stderr message |
| **Retry** | cron retry next window |
| **Fallback** | secondary backup path |
| **Block** | — |
| **Defer** | — |
| **Log/Audit** | console + `.meta.json` on success only |
| **Support inspect** | `BACKUP_DIR`، file size، `pg_dump` version |

### سناریو: backup script failure

✅ **Non-zero exit**؛ production DB untouched.

---

## Internal timeout / retry (generic)

| | |
|--|--|
| **Failure modes** | slow query، upstream hang، client abort |
| **User** | timeout message؛ retry button |
| **Operator** | `ai.request.timeout` یا slow query log |
| **Retry** | see [retry-timeout-guidelines](./retry-timeout-guidelines.md) |
| **Fallback** | context-specific |
| **Block** | after max retries for Tier 1 |
| **Defer** | long operations → async |
| **Log/Audit** | timeout event + durationMs |
| **Support inspect** | p95 latency، timeout env vars |

### سناریو: AI action request timeout

✅ `AiTimeoutError` → retry in client → fallback in intelligence service.

---

## Admin actions (staging / production)

**کد:** `scripts/ops/destructive-guard.ts` · audit service

| | |
|--|--|
| **Failure modes** | guard reject، partial mutation، wrong org |
| **User** | 403/500 با پیام فارسی |
| **Operator** | audit trail؛ `API_TENANT_SCOPE_FAIL` |
| **Retry** | fix env/scope then retry |
| **Fallback** | — |
| **Block** | destructive without guard pass |
| **Defer** | — |
| **Log/Audit** | full audit on admin mutations |
| **Support inspect** | actor userId، orgId، action type |

### سناریو: admin action failure in staging/production

همان guardrails؛ staging باید `APP_ENV` صریح داشته باشد.

---

## Health aggregation

**کد:** `api/health/ready/route.ts`

| Check | fail impact |
|-------|-------------|
| database | 503 not_ready |
| ai_service | degraded label؛ **still 200** if DB ok |

---

## Index of log events (reliability-related)

| Event | Domain |
|-------|--------|
| `dependency.degraded` | any Tier 2 fallback |
| `ai.request.timeout` | AI client |
| `intelligence.*.fallback` | AI business logic |
| `automation.rule.failed` | automation |
| `demo.reset.failed` | demo |
| `health.check.failed` | probes |
| `file.upload.rejected` | storage |
| `api.plan_upgrade_required` | entitlements |

Full list: [event-taxonomy](../observability/event-taxonomy.md)
