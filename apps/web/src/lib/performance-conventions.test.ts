import { describe, expect, it } from 'vitest';

import {
  DEFAULT_LIST_PAGE_SIZE,
  parallelServerFetch,
  createInFlightGuard,
} from '@/lib/performance-conventions';

describe('performance-conventions', () => {
  it('exposes list page size defaults', () => {
    expect(DEFAULT_LIST_PAGE_SIZE).toBe(20);
  });

  it('parallelServerFetch resolves all tasks', async () => {
    const [a, b] = await parallelServerFetch([
      async () => 1,
      async () => 'two',
    ]);
    expect(a).toBe(1);
    expect(b).toBe('two');
  });

  it('inFlightGuard blocks duplicate keys until release', () => {
    const guard = createInFlightGuard();
    expect(guard.tryAcquire('ai-send')).toBe(true);
    expect(guard.tryAcquire('ai-send')).toBe(false);
    guard.release('ai-send');
    expect(guard.tryAcquire('ai-send')).toBe(true);
  });
});
