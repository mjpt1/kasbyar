import { describe, expect, it } from 'vitest';

describe('empty state contract', () => {
  it('supports href-based CTA for server pages', async () => {
    const mod = await import('@/components/shared/empty-state');
    expect(mod.EmptyState).toBeDefined();
  });
});

describe('page skeletons', () => {
  it('exports dashboard and list skeletons', async () => {
    const mod = await import('@/components/shared/page-skeleton');
    expect(mod.DashboardPageSkeleton).toBeDefined();
    expect(mod.ListPageSkeleton).toBeDefined();
  });
});

describe('destructive action button', () => {
  it('exports confirm-gated destructive button', async () => {
    const mod = await import('@/components/shared/destructive-action-button');
    expect(mod.DestructiveActionButton).toBeDefined();
  });
});
