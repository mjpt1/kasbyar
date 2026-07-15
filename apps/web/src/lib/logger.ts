import {
  APP_LOG_EVENTS,
  type MetricDimensions,
  type MetricEvent,
  sanitizeLogRecord,
  safeActorRef,
  safeOrganizationRef,
} from '@kesbyar/shared';

import { getLogLevel, isProduction } from '@/lib/env';

export type LogLevel = 'debug' | 'info' | 'warn' | 'error';

export interface LogContext {
  organizationId?: string;
  userId?: string;
  requestId?: string;
  correlationId?: string;
  errorCategory?: string;
  [key: string]: unknown;
}

const LEVEL_RANK: Record<LogLevel, number> = {
  debug: 10,
  info: 20,
  warn: 30,
  error: 40,
};

function shouldLog(level: LogLevel): boolean {
  const min = getLogLevel();
  return LEVEL_RANK[level] >= LEVEL_RANK[min];
}

function write(level: LogLevel, message: string, context?: LogContext) {
  if (!shouldLog(level)) return;

  const safeContext = sanitizeLogRecord(context) as LogContext | undefined;

  const payload = {
    level,
    message,
    timestamp: new Date().toISOString(),
    service: 'kesbyar-web',
    environment: process.env.APP_ENV ?? process.env.NODE_ENV,
    ...safeContext,
  };

  if (isProduction()) {
    console.log(JSON.stringify(payload));
    return;
  }

  const prefix = `[${level.toUpperCase()}]`;
  if (safeContext) {
    console[level === 'debug' ? 'log' : level](prefix, message, safeContext);
  } else {
    console[level === 'debug' ? 'log' : level](prefix, message);
  }
}

export const logger = {
  debug: (message: string, context?: LogContext) => write('debug', message, context),
  info: (message: string, context?: LogContext) => write('info', message, context),
  warn: (message: string, context?: LogContext) => write('warn', message, context),
  error: (message: string, context?: LogContext) => write('error', message, context),

  withRequest(requestId: string, context?: LogContext): LogContext {
    return { requestId, correlationId: requestId, ...context };
  },

  /** Tenant-scoped context — prefer over raw slug/name */
  withOrg(organizationId: string, context?: LogContext): LogContext {
    return { ...safeOrganizationRef(organizationId), ...context };
  },

  /** Actor-scoped context — use userId not email */
  withActor(userId: string, context?: LogContext): LogContext {
    return { ...safeActorRef(userId), ...context };
  },
};

/** Business/ops metric — V1 logs as structured info; future: analytics sink */
export function recordMetric(
  event: MetricEvent,
  dimensions?: MetricDimensions & LogContext,
): void {
  logger.info(event, {
    kind: 'metric',
    ...dimensions,
  });
}

export { APP_LOG_EVENTS };
