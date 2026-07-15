import { getAppEnv, getServerEnv, isProduction } from '@/lib/env';
import { APP_LOG_EVENTS, logger } from '@/lib/logger';

let initialized = false;

/**
 * Monitoring bootstrap — Sentry-ready without hard dependency.
 * Set SENTRY_DSN to enable; install @sentry/nextjs when ready.
 */
export function initMonitoring(): void {
  if (initialized) return;
  initialized = true;

  const env = getServerEnv();
  const dsn = env.SENTRY_DSN;

  if (dsn) {
    logger.info(APP_LOG_EVENTS.MONITORING_SENTRY_CONFIGURED, {
      environment: env.SENTRY_ENVIRONMENT ?? getAppEnv(),
      note: 'Install @sentry/nextjs and wire instrumentation.ts to activate capture',
    });
  } else if (isProduction()) {
    logger.warn(APP_LOG_EVENTS.MONITORING_SENTRY_MISSING, {
      message: 'SENTRY_DSN not set — errors only go to structured logs',
    });
  }
}

export function captureException(error: unknown, context?: Record<string, unknown>): void {
  logger.error(APP_LOG_EVENTS.EXCEPTION_CAPTURED, {
    message: error instanceof Error ? error.message : String(error),
    stack: error instanceof Error ? error.stack : undefined,
    ...context,
  });
  // Future: Sentry.captureException(error, { extra: context });
}
