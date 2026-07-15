/**
 * Application log event names (structured logs via logger.ts).
 * Format: domain.action[.detail] — lowercase dot-separated.
 * Not persisted to AuditEvent — see AUDIT_ACTIONS for compliance trail.
 */
export const APP_LOG_EVENTS = {
  // API layer
  API_APP_ERROR: 'api.app_error',
  API_UNHANDLED: 'api.unhandled',
  API_PLAN_UPGRADE_REQUIRED: 'api.plan_upgrade_required',
  API_TENANT_SCOPE_FAIL: 'api.tenant_scope_fail',

  // Auth / workspace
  WORKSPACE_SELECTED: 'workspace.selected',
  AUTH_LOGIN_FAILED: 'auth.login_failed',

  // AI
  AI_REQUEST_START: 'ai.request.start',
  AI_REQUEST_SUCCESS: 'ai.request.success',
  AI_REQUEST_FAILURE: 'ai.request.failure',
  AI_REQUEST_TIMEOUT: 'ai.request.timeout',
  INTELLIGENCE_SUMMARY_FALLBACK: 'intelligence.summary.fallback',
  INTELLIGENCE_ASSISTANT_FALLBACK: 'intelligence.assistant.fallback',

  // Automation / async
  AUTOMATION_RUN_START: 'automation.run.start',
  AUTOMATION_RUN_COMPLETE: 'automation.run.complete',
  AUTOMATION_RULE_FAILED: 'automation.rule.failed',

  // Files
  FILE_UPLOAD_REJECTED: 'file.upload.rejected',
  FILE_UPLOAD_SUCCESS: 'file.upload.success',

  // Billing
  BILLING_PLAN_CHANGE: 'billing.plan_change',

  // Ops / monitoring
  MONITORING_SENTRY_CONFIGURED: 'monitoring.sentry.configured',
  MONITORING_SENTRY_MISSING: 'monitoring.sentry.missing',
  EXCEPTION_CAPTURED: 'exception.captured',
  HEALTH_CHECK_FAILED: 'health.check.failed',

  // Integrations
  INTEGRATION_PROVIDER_FAILED: 'integration.provider.failed',
  INTEGRATION_NOT_CONFIGURED: 'integration.not_configured',
  NOTIFICATION_QUEUED: 'notification.queued',

  // Demo
  DEMO_RESET_ATTEMPT: 'demo.reset.attempt',
  DEMO_RESET_BLOCKED: 'demo.reset.blocked',
  DEMO_RESET_FAILED: 'demo.reset.failed',
  DEPENDENCY_DEGRADED: 'dependency.degraded',
} as const;

export type AppLogEvent = (typeof APP_LOG_EVENTS)[keyof typeof APP_LOG_EVENTS];

/** Security-sensitive app log events — review before adding fields */
export const SECURITY_LOG_EVENTS: readonly AppLogEvent[] = [
  APP_LOG_EVENTS.AUTH_LOGIN_FAILED,
  APP_LOG_EVENTS.API_TENANT_SCOPE_FAIL,
  APP_LOG_EVENTS.DEMO_RESET_ATTEMPT,
  APP_LOG_EVENTS.DEMO_RESET_BLOCKED,
  APP_LOG_EVENTS.DEMO_RESET_FAILED,
  APP_LOG_EVENTS.FILE_UPLOAD_REJECTED,
] as const;
