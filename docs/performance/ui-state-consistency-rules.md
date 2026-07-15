# UI State Consistency Rules — KesbYar

قوانین کیفیت درک‌شده — حالت‌های پایدار، قابل پیش‌بینی، و فارسی/RTL یکدست.

**کامپوننت‌های مرجع:** `apps/web/src/components/shared/`

---

## 1. Component map (mandatory)

| User situation | Component | File |
|----------------|-----------|------|
| Full page / list has no items | `EmptyState` | `empty-state.tsx` |
| Section inside page empty | `InlineEmpty` | `inline-empty.tsx` |
| Route loading (navigation) | `*PageSkeleton` | `page-skeleton.tsx` |
| In-section async (client) | `LoadingState` | `loading-state.tsx` |
| Recoverable error block | `ErrorState` | `error-state.tsx` |
| Plan locked | `UpgradePrompt` | `billing/upgrade-prompt.tsx` |
| Destructive action | `DestructiveActionButton` | `destructive-action-button.tsx` |
| Toast success/error | `sonner` `toast` | client forms |

**Do not invent** new spinner markup per page.

---

## 2. Stable initial render

- RSC pages ship HTML with real content when possible — not blank shell + client fill
- `loading.tsx` covers transition; first visit should not flash empty then populate without skeleton
- Stat cards: show `0` or formatted zero — not blank placeholder after load
- Avoid hydration mismatch: don't render dates random/client-only on server HTML

---

## 3. Empty states

### `EmptyState` (page-level)

Required props:

- `icon`, `title`, `description` (Persian)
- `actionHref` + `actionLabel` when user can create — **preferred for RSC**
- `onAction` only in client components

Example: invoices list with no rows → CTA «صدور فاکتور» or link to create section.

### `InlineEmpty` (section-level)

- Dashboard widget with no overdue invoices
- Detail tab with no files yet

**Rule:** Never empty without explaining what happened and what to do next.

---

## 4. Loading states

### Route (`loading.tsx`)

- Use `ListPageSkeleton` or `DashboardPageSkeleton`
- `role="status"` + `aria-label` Persian (already in skeletons)

### Client actions

- `LoadingState` for full-section client fetch
- Forms: button disabled + optional `Loader2` on button
- AI chat: inline spinner in message list — keep input area stable (no layout jump)

### Consistency

| Context | Pattern |
|---------|---------|
| List navigation | Skeleton (not spinner center page) |
| Form submit | Button loading |
| AI reply | Typing indicator row at bottom of messages |

---

## 5. Confirmation & success feedback

| Action severity | Feedback |
|-----------------|----------|
| Create/update | `toast.success('…')` Persian |
| Destructive | confirm dialog → then toast |
| Invoice cancel | confirm in `invoice-status-actions` |
| Payment recorded | toast + redirect/list refresh via `router.refresh()` if needed |

Messages short, past tense, specific: «فاکتور با موفقیت ثبت شد» not «موفق».

---

## 6. Error recoverability

| Layer | Behavior |
|-------|----------|
| API | Persian message; retry possible |
| Form | Inline field errors from Zod |
| Page | `error.tsx` — «تلاش مجدد» |
| AI failure | Assistant message explaining degraded mode — not silent fail |
| Network | Toast with retry hint |

Log technical detail server-side only — [logging-policy.md](../observability/logging-policy.md).

---

## 7. Responsive & mobile

- Sidebar → drawer on small screens (`app-sidebar.tsx`)
- Tables: horizontal scroll wrapper if needed — don't shrink text illegibly
- Touch targets ≥ 44px for primary buttons
- Pagination controls usable on mobile
- Conversation fullPage: input fixed accessible above keyboard

**Tradeoff:** Dense data tables on phone — prefer key columns + link to detail over hiding all data.

---

## 8. RTL consistency under load

- Skeleton blocks align same grid as loaded content (RTL start = right)
- `Loader2` spin animation direction OK universal
- Toast position: consistent corner (sonner config in layout)
- Don't switch `dir` between loading and loaded states
- `JalaliDate` and `formatCurrency` in loaded state — skeleton uses neutral bars (no LTR numbers in skeleton)

---

## 9. AI waiting states (specific)

From `conversation-panel.tsx` patterns:

1. Set `loading` true before `fetch`
2. Disable send + suggestion chips while loading
3. Append assistant message on success or error text on failure
4. Show `AiServiceStatusBadge` for service health — not blocking chat
5. No full-page overlay for AI wait

Dashboard `OperationalInsightCard`: show loading skeleton inside card only.

---

## 10. Adding a new module checklist

- [ ] `loading.tsx` with correct skeleton variant
- [ ] List empty → `EmptyState` with `actionHref`
- [ ] Section empty → `InlineEmpty`
- [ ] Forms → toast on success
- [ ] Destructive → confirm pattern
- [ ] RTL check on mobile

---

## 11. Tests

`ui-states.test.ts` — exports exist; extend when adding new shared state components.

---

## Related

- [POLISH_PRINCIPLES.md](../POLISH_PRINCIPLES.md)
- [frontend-stability-rules.md](./frontend-stability-rules.md)
- [QA_CHECKLIST.md](../QA_CHECKLIST.md) — UX section
