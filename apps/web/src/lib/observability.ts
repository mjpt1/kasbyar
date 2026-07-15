import type { LogContext } from '@/lib/logger';
import { logger, recordMetric } from '@/lib/logger';
import {
  APP_LOG_EVENTS,
  ERROR_CATEGORIES,
  METRIC_EVENTS,
  type MetricDimensions,
  type MetricEvent,
  safeActorRef,
  safeOrganizationRef,
} from '@kesbyar/shared';

export {
  APP_LOG_EVENTS,
  METRIC_EVENTS,
  ERROR_CATEGORIES,
  recordMetric,
  safeActorRef,
  safeOrganizationRef,
};

/** Log tenant-scope validation failure — security-sensitive */
export function logTenantScopeFailure(
  context: LogContext & { reason: string; entityType?: string; entityId?: string },
): void {
  logger.warn(APP_LOG_EVENTS.API_TENANT_SCOPE_FAIL, {
    errorCategory: ERROR_CATEGORIES.TENANT,
    ...context,
  });
}

/** Log AI call outcome without prompt/response body */
export function logAiRequestOutcome(params: {
  operation: string;
  organizationId: string;
  ok: boolean;
  latencyMs?: number;
  statusCode?: number;
  errorCode?: string;
}): void {
  const base = {
    operation: params.operation,
    ...safeOrganizationRef(params.organizationId),
    latencyMs: params.latencyMs,
    statusCode: params.statusCode,
  };

  if (params.ok) {
    logger.info(APP_LOG_EVENTS.AI_REQUEST_SUCCESS, base);
    recordMetric(METRIC_EVENTS.ASSISTANT_REQUEST, {
      organizationId: params.organizationId,
      source: 'web',
    });
    return;
  }

  logger.warn(APP_LOG_EVENTS.AI_REQUEST_FAILURE, {
    ...base,
    errorCode: params.errorCode,
    errorCategory: ERROR_CATEGORIES.EXTERNAL_AI,
  });
  recordMetric(METRIC_EVENTS.ASSISTANT_FAILURE, {
    organizationId: params.organizationId,
    source: 'web',
  });
}

export function logMetric(
  event: MetricEvent,
  dimensions?: MetricDimensions & LogContext,
): void {
  recordMetric(event, dimensions);
}
