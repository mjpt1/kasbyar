import { describe, expect, it, vi } from 'vitest';

vi.mock('@/lib/logger', () => ({
  APP_LOG_EVENTS: { DEPENDENCY_DEGRADED: 'dependency.degraded' },
  logger: {
    warn: vi.fn(),
    info: vi.fn(),
    error: vi.fn(),
    debug: vi.fn(),
  },
}));

import { runWithFallback, runIsolatedTasks } from '@/lib/resilience';

describe('resilience', () => {
  it('runWithFallback uses primary when successful', async () => {
    const result = await runWithFallback({
      dependency: 'ai_service',
      primary: async () => 'ai',
      fallback: () => 'local',
    });
    expect(result).toEqual({ value: 'ai', degraded: false, source: 'primary' });
  });

  it('runWithFallback uses fallback when primary throws', async () => {
    const result = await runWithFallback({
      dependency: 'ai_service',
      primary: async () => {
        throw new Error('down');
      },
      fallback: () => 'local',
    });
    expect(result).toEqual({ value: 'local', degraded: true, source: 'fallback' });
  });

  it('runIsolatedTasks isolates failures', async () => {
    const results = await runIsolatedTasks([
      { key: 'a', run: async () => 1 },
      { key: 'b', run: async () => { throw new Error('fail'); } },
    ]);
    expect(results[0]).toEqual({ key: 'a', ok: true, value: 1 });
    expect(results[1]?.ok).toBe(false);
  });
});
