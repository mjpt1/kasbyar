/**
 * Resilience helpers — graceful degradation patterns.
 * @see docs/reliability/graceful-degradation-policy.md
 */
import type { DependencyId, DegradationLevel } from '@kesbyar/shared';

import { APP_LOG_EVENTS, logger } from '@/lib/logger';

export interface FallbackResult<T> {
  value: T;
  degraded: boolean;
  source: 'primary' | 'fallback';
}

/**
 * Run primary operation; on failure invoke fallback and mark degraded.
 * Use for optional enrichments (AI) — not for auth or payments.
 */
export async function runWithFallback<T>(options: {
  dependency: DependencyId;
  primary: () => Promise<T>;
  fallback: () => T | Promise<T>;
  onPrimaryError?: (error: unknown) => void;
}): Promise<FallbackResult<T>> {
  try {
    const value = await options.primary();
    return { value, degraded: false, source: 'primary' };
  } catch (error) {
    options.onPrimaryError?.(error);
    logDependencyDegraded(options.dependency, error);
    const value = await options.fallback();
    return { value, degraded: true, source: 'fallback' };
  }
}

export function logDependencyDegraded(
  dependency: DependencyId,
  error: unknown,
  context?: Record<string, unknown>,
): void {
  logger.warn(APP_LOG_EVENTS.DEPENDENCY_DEGRADED, {
    dependency,
    errorCategory: 'external',
    message: error instanceof Error ? error.message : String(error),
    ...context,
  });
}

export function mapAiHealthToLevel(
  status: 'ok' | 'degraded' | 'unavailable',
): DegradationLevel {
  if (status === 'ok') return 'healthy';
  if (status === 'degraded') return 'degraded';
  return 'unavailable';
}

/**
 * Execute async tasks independently — failures isolated (automation rules pattern).
 */
export async function runIsolatedTasks<T>(
  tasks: Array<{
    key: string;
    run: () => Promise<T>;
    onError?: (error: unknown) => void;
  }>,
): Promise<Array<{ key: string; ok: true; value: T } | { key: string; ok: false; error: unknown }>> {
  const results = await Promise.all(
    tasks.map(async ({ key, run, onError }) => {
      try {
        const value = await run();
        return { key, ok: true as const, value };
      } catch (error) {
        onError?.(error);
        return { key, ok: false as const, error };
      }
    }),
  );
  return results;
}
