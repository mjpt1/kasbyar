# Frontend Stability Rules — KesbYar

قوانین عملی برای جلوگیری از کندی، over-hydration، و ناپایدانی در Next.js App Router.

---

## 1. Server vs client components

### Default: Server Component

Use RSC for:

- List and detail pages (`app/(app)/**/page.tsx`)
- Layout wrappers that only compose children
- Data fetching from `server/*.service.ts`
- Static Persian copy, `PageHeader`, cards with links

### Require `'use client'` only when:

- `useState`, `useEffect`, event handlers
- Browser APIs (file input, `window`)
- `toast` from sonner
- Interactive charts (`recharts`)
- Sidebar mobile drawer state
- Forms with client validation UX (most create forms)

**Rule:** Push `'use client'` to the **smallest** leaf — `customers-create-form.tsx`, not `customers/page.tsx`.

### Reference pages (good patterns)

| Page | Pattern |
|------|---------|
| `dashboard/page.tsx` | RSC + `Promise.all` |
| `invoices/page.tsx` | RSC + client forms as children |
| `login/page.tsx` | Client (auth form) — exception |

---

## 2. Avoid unnecessary client rendering

| Do | Don't |
|----|-------|
| Pass serializable props from RSC to client forms | Fetch list in client after mount |
| Server-render table rows in RSC | Entire `customers-table.tsx` fetching API |
| URL `searchParams` for list filter | Hidden client-only filter state for shareable lists |

**Smell:** `useEffect(() => { fetch('/api/...') }, [])` on a page that could be RSC.

---

## 3. Duplicate request avoidance

### At page level

```tsx
const [a, b, c] = await Promise.all([
  listInvoices(orgId, params),
  listCustomers(orgId, { pageSize: 100 }),
  getCatalog(orgId),
]);
```

### Same service twice in one tree

Use React `cache()` when the same function is called from layout + page:

```tsx
import { cache } from 'react';
export const getCachedSessionOrg = cache(async () => {
  const session = await requireSession();
  return session.organizationId;
});
```

**V1 convention file:** `lib/performance-conventions.ts`

### Client-side

- AI conversation: one in-flight request; guard with `loading` flag
- Form submit: disable button during POST
- No automatic retry storms on 500

---

## 4. Route-level loading

Every **list** route under `(app)/` should have `loading.tsx`:

| Route | Skeleton |
|-------|----------|
| `(app)/loading.tsx` | `DashboardPageSkeleton` |
| `customers/loading.tsx` | `ListPageSkeleton` |
| `invoices/loading.tsx` | `ListPageSkeleton` |
| `leads/loading.tsx` | `ListPageSkeleton` |

New list module → copy `ListPageSkeleton` pattern.

**Purpose:** Instant feedback during RSC navigation — reduces perceived latency.

---

## 5. Layout shift (CLS)

| Element | Rule |
|---------|------|
| Skeleton cards | Match grid `md:grid-cols-2 xl:grid-cols-3` like dashboard |
| List skeleton | ~8 rows fixed height |
| Charts | Reserve `h-48` or card min-height before data |
| Images | `width`/`height` or aspect ratio when added |
| Fonts | System/stack via Tailwind — avoid late webfont swap in V1 |

---

## 6. Table / list efficiency

- Server-render rows in RSC — pass data to small client widgets only if needed
- Pagination: `ListPagination` + server `page`/`pageSize`
- Search: `ListSearch` updates URL — RSC re-fetch on navigation
- Avoid rendering &gt; 100 rows without virtualisation — paginate instead
- `DataTable` from `@kesbyar/ui` when client sort needed — not default for every list

---

## 7. Form responsiveness

- Submit button `disabled` while pending
- Optimistic UI only where rollback is trivial — prefer toast on success for money flows
- Validation: Zod on server always; client mirror for instant feedback
- Destructive: `DestructiveActionButton` with confirm

---

## 8. Error boundaries

- `app/(app)/error.tsx` — recoverable segment errors
- API errors → Persian `handleApiError` — no stack to user
- `ErrorState` component for full-section failure with retry link where applicable

---

## 9. RTL under navigation

- App shell `dir="rtl"` stable — don't toggle on route change
- LTR islands: `dir="ltr"` on phone/email inputs only
- Sidebar: client state — ensure drawer doesn't reflow main content width abruptly
- Tables: `text-right` default; numeric columns may use `tabular-nums`

---

## 10. PR checklist

- [ ] New page: RSC unless justified in PR
- [ ] `loading.tsx` if list/dashboard route
- [ ] No duplicate awaits for same data
- [ ] Client bundle: import audit for heavy deps
- [ ] Shared UI states used

---

## Related

- [ui-state-consistency-rules.md](./ui-state-consistency-rules.md)
- [engineering/conventions.md](../engineering/conventions.md)
