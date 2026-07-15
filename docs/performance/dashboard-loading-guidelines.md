# Dashboard Loading Guidelines — KesbYar

انضباط بارگذاری داشبورد و صفحات aggregate — الگوی مرجع: `app/(app)/dashboard/page.tsx`.

---

## 1. Architecture

```
dashboard/page.tsx (RSC)
  ├─ requireSession()
  ├─ Promise.all([
  │     getDashboardDetails(orgId),   // stats + lists inside one service call
  │     getSalesTrend(orgId),
  │   ])
  └─ render cards + chart + widgets (mostly server components)
```

**Rule:** One parallel batch at page top — not six separate awaits.

---

## 2. Service layer

`server/dashboard/dashboard.service.ts` should:

- Batch queries inside `getDashboardDetails` with `Promise.all` where independent
- Return a **single DTO** for the page — avoid page calling 10 services
- Scope every query with `organizationId`
- Limit list sections (recent activity, tasks) with `take`

**Anti-pattern:** Page calls `getStats`, `getOverdue`, `getLeads`, … in sequence.

---

## 3. Loading UX

| Phase | UX |
|-------|-----|
| Route transition | `(app)/loading.tsx` → `DashboardPageSkeleton` |
| RSC resolving | Skeleton visible until HTML streams |
| Partial empty sections | `InlineEmpty` inside card — not whole-page empty |
| Pack widgets | Load with same RSC pass — no client waterfall |

Skeleton must mirror final layout:

- 6 stat cards in grid
- 1 chart card with `h-48` placeholder

---

## 4. Widgets

| Widget | Loading | Empty | Client? |
|--------|---------|-------|---------|
| StatCard | Server data ready | N/A (0 is valid) | No |
| SalesTrendChart | Server passes data | InlineEmpty if no data | Yes (chart) |
| OperationalInsightCard | RSC AI/fallback | Degraded badge | Partial |
| ConversationPanel | N/A on dashboard embed | — | Yes |
| PackDashboardWidgets | RSC | InlineEmpty per widget | Mostly server |

**AI insight card:** Must not block stat cards — fetch in parallel; show degraded state inline.

---

## 5. Conversation / AI on dashboard

- Embedded `ConversationPanel` is client — acceptable island
- Do not fetch AI summary in RSC **and** duplicate in client for same mount
- `OperationalInsightCard`: server-side `getOperationalInsight` once

**Waiting state:** User send → immediate spinner in thread; disable send (see `conversation-panel.tsx`).

---

## 6. Demo walkthrough

`DemoDashboardWalkthrough` — client island; must not delay stat grid render.

Place **after** `PageHeader`, before or after stats — but stats should not wait on demo JS.

---

## 7. Caching (future)

When needed:

```tsx
import { cache } from 'react';
export const getDashboardBundle = cache((orgId: string) =>
  Promise.all([
    getDashboardDetails(orgId),
    getSalesTrend(orgId),
  ]),
);
```

Invalidate on mutations that affect dashboard — or accept stale-until-navigation for V1.

---

## 8. Performance smells

| Smell | Fix |
|-------|-----|
| Dashboard waits for AI before showing stats | Parallel fetch; AI card skeleton/degraded |
| Full page spinner | Use `DashboardPageSkeleton` via `loading.tsx` |
| Refetch dashboard on every client navigation | RSC remount is OK; avoid client polling |
| N+1 in `getDashboardDetails` | Batch Prisma queries |

---

## 9. Verification

Manual:

1. Hard refresh `/dashboard` — skeleton → content, minimal jump
2. Throttle CPU 4x — skeleton still appears quickly
3. Stop AI service — stats still load; insight shows degraded
4. RTL: cards align right; chart legend readable

---

## Related

- [performance-budget.md](./performance-budget.md)
- [ui-state-consistency-rules.md](./ui-state-consistency-rules.md)
