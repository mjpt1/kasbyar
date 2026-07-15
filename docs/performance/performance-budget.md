# Performance Budget — KesbYar

بودجه عملی کارایی — اهداف قابل بررسی بدون ابزار profiling سنگین در V1.

**نه:** SLA رسمی enterprise. **بله:** خطوط قرمز برای regression.

---

## 1. Scope

| Area | Stack | Primary metric |
|------|-------|----------------|
| Web app | Next.js 15 App Router | TTFB + perceived load |
| API | Route handlers + services | p95 latency (informal) |
| AI UI | Client fetch → FastAPI | time-to-first-token feel |
| Lists | RSC + pagination | rows rendered |

---

## 2. Page-level budgets (targets)

| Page type | Target (good connection) | Notes |
|-----------|--------------------------|-------|
| Dashboard (RSC) | First meaningful paint &lt; 2s local | 2 parallel service calls max at page level |
| List page (20 rows) | Navigation + skeleton &lt; 300ms feel | `loading.tsx` instant |
| Detail page | Single entity + relations in one `Promise.all` | |
| Auth (login) | Client OK — small bundle | |
| Conversation (AI) | Spinner within 100ms of send | timeout 30s+ degrades gracefully |

**Measurement V1:** manual Chrome DevTools + `npm run build` output size review — no CI bundle gate yet.

---

## 3. Bundle awareness

| Rule | Budget |
|------|--------|
| New `'use client'` page | Avoid — split interactive island |
| Chart libraries | One chart per dashboard (`recharts` already) — no second chart lib |
| Icon set | `lucide-react` tree-shake per import |
| Shared UI | Import from `@/components/shared/*` not duplicate patterns |
| Persian/format | `@kesbyar/shared` — server-safe |

**Review:** `npm run build` — note First Load JS for changed routes; flag &gt; +50KB unexplained.

---

## 4. Data fetching budgets

| Pattern | Allowed | Avoid |
|---------|---------|-------|
| Server page fetch | `Promise.all([...])` | Sequential await chain |
| Per-request dedup | `React.cache()` on read services (when needed) | Same query twice in one tree |
| Client fetch | Forms, AI chat, toggles | Initial list data |
| Pagination | `pageSize` 20 default, max 100 | Unbounded `findMany` |
| Search | Debounced client or URL `searchParams` | Fetch on every keystroke without debounce |

---

## 5. Database / service (informal)

| Operation | Guideline |
|-----------|-----------|
| List queries | `take` + `skip` always |
| Dashboard aggregates | Dedicated service — not N+1 per card |
| Includes | Only fields needed for view |
| Reports | Feature-gated; heavy queries off critical path |

---

## 6. AI-related UI

| State | Budget |
|-------|--------|
| Show loading | Immediately on send (`loading` state + spinner in thread) |
| Block double-send | Disable input while `loading` |
| Timeout | Fallback message — not infinite spinner |
| Dashboard AI card | RSC fetch with fallback badge — no blocking whole page |

---

## 7. Regression triggers (investigate if hit)

- New full-page `'use client'` for CRUD list
- Removing `loading.tsx` from list route
- List without pagination on &gt; 50 rows expected
- Third-party script on app shell
- Duplicate service call for same org+resource in one request tree
- Layout shift visible on dashboard (cards jumping)

---

## 8. Environment expectations

| Env | Expectation |
|-----|-------------|
| Local | Fast — not representative of prod DB latency |
| Staging | Match prod topology; test with realistic seed size |
| Production | CDN + managed Postgres; monitor logs for slow queries post-launch |

---

## 9. Future CI (post-V1)

- Lighthouse CI on `/dashboard`, `/invoices` (optional)
- Bundle size diff on PR
- `React.cache` audit for hot paths

---

## Related

- [frontend-stability-rules.md](./frontend-stability-rules.md)
- [dashboard-loading-guidelines.md](./dashboard-loading-guidelines.md)
