# Retry & Timeout Guidelines — KesbYar

راهنمای timeout، retry، backoff، و idempotency برای وابستگی‌های KesbYar.

**مرتبط:** [failure-mode-catalog](./failure-mode-catalog.md) · `apps/web/src/lib/ai/client.ts`

---

## 1. اصول کلی

| اصل | توضیح |
|-----|--------|
| **Retry فقط idempotent یا safe** | GET health، AI read؛ نه duplicate payment |
| **Timeout همیشه** | هر fetch خارجی `AbortController` |
| **Cap retries** | جلوگیری از retry storm |
| **Jitter** | برای queue/worker (آینده) |
| **Log هر timeout** | `durationMs` + dependency |

---

## 2. مقادیر پیش‌فرض V1

| وابستگی | Timeout | Retries | Backoff | Env override |
|---------|---------|---------|---------|--------------|
| AI service (HTTP) | **8s** | **1** (2 attempts total) | immediate retry on 5xx | `AI_SERVICE_TIMEOUT_MS`, `AI_SERVICE_RETRIES` |
| AI health probe | 8s | 0 | — | same client |
| PostgreSQL (Prisma) | pool default | driver-level | — | `DATABASE_URL` |
| File upload | request limit (Next) | 0 | — | platform |
| Readiness probe | implicit route timeout | 0 | — | — |
| Analytics/metrics | n/a | 0 | drop | — |

---

## 3. AI Service (reference implementation)

```ts
// apps/web/src/lib/ai/config.ts
timeoutMs: AI_SERVICE_TIMEOUT_MS ?? 8_000
retries: AI_SERVICE_RETRIES ?? 1
```

**Client behavior** (`lib/ai/client.ts`):

1. `fetchWithTimeout` → `AbortError` → `AiTimeoutError`
2. Network error → `AiUnavailableError`
3. HTTP 5xx → retry if `attempt < retries`
4. HTTP 4xx → no retry (client/config error)
5. After exhaustion → `{ ok: false, error }` to caller

**Caller behavior** (`intelligence.service.ts`):

- On `!ok` → local fallback + `intelligence.*.fallback` log
- Never throw to API consumer for optional insight

**Recommended production tuning:**

| Environment | Timeout | Retries |
|-------------|---------|---------|
| Local dev | 8s | 1 |
| Staging | 10s | 1 |
| Production | 12–15s | 1–2 |

بالای 2 retry برای AI توصیه **نمی‌شود** — UX degradation بهتر از انتظار طولانی.

---

## 4. Retry decision matrix

| Operation | Retry? | Why |
|-----------|--------|-----|
| AI summary/ask | Yes (limited) | read-only inference |
| AI health | No | probe should be fast |
| DB read (user request) | No (Prisma only) | fail fast → 500 |
| DB write | No auto-retry | risk duplicate |
| Payment webhook | Yes (PSP) + idempotent handler | external redelivery |
| SMS send | Yes 3x exponential | at-least-once delivery |
| File upload | No | user must re-submit |
| Demo seed | No | manual ops retry |
| Automation rule | Next schedule | per-run isolation |

---

## 5. Backoff (future workers)

برای job queue آینده:

```
delay = min(cap, base * 2^attempt) + random(0, jitter)
```

| Parameter | Suggested |
|-----------|-----------|
| base | 1s |
| cap | 60s |
| max attempts | 5 |
| jitter | 0–500ms |

---

## 6. Idempotency requirements

| Flow | Key | Status |
|------|-----|--------|
| Payment callback | `providerTransactionId` | post-V1 |
| Invoice create API | client request id | optional future |
| Automation task create | title dedup 24h | ✅ V1 in `applyAction` |
| Reminder create | title + remindAt dedup | ✅ V1 |

---

## 7. Timeout → user experience

| Duration | UX |
|----------|-----|
| < 300ms | no indicator needed |
| 300ms–1s | subtle pending state |
| 1s–3s | spinner |
| > 3s | skeleton + «در حال پردازش» |
| timeout hit | Persian error + retry affordance |

See [dashboard-loading-guidelines](../performance/dashboard-loading-guidelines.md).

---

## 8. Internal `runWithFallback` pattern

```ts
import { runWithFallback } from '@/lib/resilience';

const { value, degraded, source } = await runWithFallback({
  dependency: 'ai_service',
  primary: () => callExternal(),
  fallback: () => localComputation(),
});
```

- Logs `dependency.degraded` on primary failure
- Use **only** for Tier 2 optional paths

---

## 9. `runIsolatedTasks` pattern

برای batch jobs (automation rules):

- هر task در try/catch جدا
- یک failure کل batch را متوقف نمی‌کند
- log per failure با correlation `organizationId`

---

## 10. Anti-patterns

| ❌ Don't | ✅ Do |
|---------|-------|
| Retry payment POST blindly | Idempotent webhook + status machine |
| Infinite retry AI in UI loop | Server retry cap + fallback |
| Swallow DB errors | 500 + log + readiness fail |
| Fail-open entitlements on error | fail-closed `PlanUpgradeRequiredError` or 500 |
| Silent timeout | `ai.request.timeout` log event |

---

## 11. Checklist for new external call

- [ ] Timeout configured
- [ ] Retry policy documented in this file
- [ ] Idempotency assessed
- [ ] Failure → user message (Persian)
- [ ] `APP_LOG_EVENTS` entry
- [ ] Entry in [failure-mode-catalog](./failure-mode-catalog.md)
