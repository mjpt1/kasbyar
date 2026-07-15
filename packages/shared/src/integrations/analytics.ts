/**
 * Analytics / telemetry sink — fire-and-forget, never blocks product.
 */
import type { ProviderId } from './categories';

export interface AnalyticsEvent {
  name: string;
  organizationId?: string;
  userId?: string;
  properties?: Record<string, string | number | boolean>;
  occurredAt?: string;
}

export interface AnalyticsSink {
  readonly id: ProviderId | string;
  track(event: AnalyticsEvent): void | Promise<void>;
  identify?(params: {
    userId: string;
    organizationId?: string;
    traits?: Record<string, string | number | boolean>;
  }): void | Promise<void>;
}
