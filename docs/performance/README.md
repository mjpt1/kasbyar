# Performance & Perceived Quality — KesbYar

راهنمای عملی کارایی و کیفیت درک‌شده برای محصول Next.js فارسی‌اول.

---

## فهرست

| سند | کاربرد |
|-----|--------|
| [performance-budget.md](./performance-budget.md) | بودجه و اهداف قابل اندازه‌گیری |
| [frontend-stability-rules.md](./frontend-stability-rules.md) | RSC، bundle، درخواست‌ها |
| [dashboard-loading-guidelines.md](./dashboard-loading-guidelines.md) | داشبورد و داده aggregate |
| [ui-state-consistency-rules.md](./ui-state-consistency-rules.md) | loading / empty / error / RTL |

**کد UI مشترک:** `apps/web/src/components/shared/`  
**قراردادها:** `apps/web/src/lib/performance-conventions.ts`  
**پولیش محصول:** [POLISH_PRINCIPLES.md](../POLISH_PRINCIPLES.md)

---

## اصول خلاصه

1. **Server-first** — لیست‌ها و جزئیات در RSC؛ client فقط برای تعامل
2. **یک بار fetch** — `Promise.all` در page؛ بدون waterfall
3. **Skeleton ثابت** — `loading.tsx` با ابعاد نزدیک به محتوا
4. **حالت‌های استاندارد** — `EmptyState` / `LoadingState` / `ErrorState`
5. **Client کوچک** — فرم و جدول تعاملی؛ نه کل صفحه

---

## بررسی سریع PR

- [ ] صفحه لیست Server Component است؟
- [ ] `loading.tsx` برای route جدید؟
- [ ] empty/loading/error از shared components؟
- [ ] `Promise.all` برای fetchهای موازی؟
- [ ] بدون `useEffect` fetch برای داده‌ای که RSC می‌تواند بگیرد؟

---

## مرتبط

- [testing/testing-strategy.md](../testing/testing-strategy.md) — manual RTL/UX
- [observability/README.md](../observability/README.md) — slow path logging
- [GUARDRAILS.md](../GUARDRAILS.md) — performance & UX stability
