import {
  PROVIDER_IDS,
  resolveProviderId,
  type AnalyticsEvent,
  type AnalyticsSink,
} from '@kesbyar/shared';

import { logger } from '@/lib/logger';

/** V1 analytics sink — structured log metrics; swap for PostHog/etc. via env */
class LogAnalyticsSink implements AnalyticsSink {
  readonly id = PROVIDER_IDS.ANALYTICS_LOG;

  track(event: AnalyticsEvent): void {
    const name = event.name.startsWith('metric.') ? event.name : `metric.${event.name}`;
    logger.info(name, {
      kind: 'metric',
      organizationId: event.organizationId,
      userId: event.userId,
      ...event.properties,
    });
  }
}

const ALLOWED_ANALYTICS_PROVIDERS = [
  PROVIDER_IDS.ANALYTICS_LOG,
  PROVIDER_IDS.ANALYTICS_POSTHOG,
] as const;

let cached: AnalyticsSink | null = null;

export function getAnalyticsSink(): AnalyticsSink {
  if (cached) {
    return cached;
  }

  const id = resolveProviderId(
    null,
    process.env.ANALYTICS_PROVIDER,
    PROVIDER_IDS.ANALYTICS_LOG,
    ALLOWED_ANALYTICS_PROVIDERS,
  );

  if (id === PROVIDER_IDS.ANALYTICS_POSTHOG) {
    // post-V1: PostHogAnalyticsSink
    cached = new LogAnalyticsSink();
    return cached;
  }

  cached = new LogAnalyticsSink();
  return cached;
}

export function trackProductEvent(event: AnalyticsEvent): void {
  try {
    void getAnalyticsSink().track(event);
  } catch {
    // analytics must never throw — see failure-normalization guidelines
  }
}
