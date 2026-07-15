import { describe, expect, it } from 'vitest';

import type { OperationalContextSnapshot } from '@kesbyar/shared/ai';

import { buildLocalOperationalSummary } from './local-fallback';

const baseContext: OperationalContextSnapshot = {
  today_sales: 5_000_000,
  open_invoices: 3,
  overdue_receivables: 12_000_000,
  active_leads: 8,
  pending_tasks: 4,
  tasks_due_today: 2,
  stale_lead_count: 1,
  overdue_invoice_count: 2,
  top_overdue_customers: ['شرکت الف', 'شرکت ب'],
  top_stale_leads: ['لید نمونه'],
  tasks_due_today_titles: ['تماس پیگیری'],
};

describe('buildLocalOperationalSummary', () => {
  it('includes sales and overdue highlights', () => {
    const result = buildLocalOperationalSummary(baseContext);
    expect(result.summary).toContain('فروش امروز');
    expect(result.summary).toContain('مطالبات سررسید گذشته');
    expect(result.highlights.length).toBeGreaterThan(0);
    expect(result.confidence).toBeGreaterThan(0);
  });

  it('reports clean state when no overdue items', () => {
    const result = buildLocalOperationalSummary({
      ...baseContext,
      overdue_receivables: 0,
      overdue_invoice_count: 0,
      stale_lead_count: 0,
      top_overdue_customers: [],
      top_stale_leads: [],
    });
    expect(result.summary).toContain('فاکتور سررسید گذشته‌ای ندارید');
  });
});
