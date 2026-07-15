/**
 * Performance & UI conventions — KesbYar web app.
 * @see docs/performance/README.md
 * @see docs/performance/frontend-stability-rules.md
 */

/** Default pagination for list pages (invoices, customers, leads) */
export const DEFAULT_LIST_PAGE_SIZE = 20;

/** Hard cap for list queries — do not exceed without virtualisation */
export const MAX_LIST_PAGE_SIZE = 100;

/** Catalog dropdowns on create forms — bounded fetch */
export const FORM_CATALOG_PAGE_SIZE = 100;

/**
 * Shared UI state components — use instead of ad-hoc spinners.
 * @see docs/performance/ui-state-consistency-rules.md
 */
export const UI_STATE_COMPONENTS = {
  pageEmpty: '@/components/shared/empty-state',
  sectionEmpty: '@/components/shared/inline-empty',
  routeLoadingDashboard: '@/components/shared/page-skeleton#DashboardPageSkeleton',
  routeLoadingList: '@/components/shared/page-skeleton#ListPageSkeleton',
  clientLoading: '@/components/shared/loading-state',
  error: '@/components/shared/error-state',
} as const;

/**
 * Fetch multiple independent server resources in parallel (RSC pages).
 * Prefer this over sequential await in page components.
 *
 * @example
 * const [invoices, customers] = await parallelServerFetch([
 *   () => listInvoices(orgId, params),
 *   () => listCustomers(orgId, { pageSize: FORM_CATALOG_PAGE_SIZE }),
 * ]);
 */
export async function parallelServerFetch<T extends readonly unknown[]>(
  tasks: readonly [...{ [K in keyof T]: () => Promise<T[K]> }],
): Promise<T> {
  return Promise.all(tasks.map((task) => task())) as Promise<T>;
}

/**
 * Client-side: prevent duplicate in-flight requests with the same key.
 * Use for AI chat, not for initial page data (use RSC instead).
 */
export function createInFlightGuard() {
  const pending = new Set<string>();
  return {
    tryAcquire(key: string): boolean {
      if (pending.has(key)) return false;
      pending.add(key);
      return true;
    },
    release(key: string): void {
      pending.delete(key);
    },
  };
}
