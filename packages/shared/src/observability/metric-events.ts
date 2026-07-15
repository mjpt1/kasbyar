/**
 * Business and operational metric event names.
 * V1: emitted via app logs or future analytics sink — not a full provider yet.
 * Format: metric.<domain>.<name>
 */
export const METRIC_EVENTS = {
  // Workspaces & users
  WORKSPACE_ACTIVE_DAILY: 'metric.workspace.active_daily',
  WORKSPACE_PILOT_ACTIVATED: 'metric.workspace.pilot_activated',
  USER_ACTIVE_DAILY: 'metric.user.active_daily',
  USER_ACTIVE_WEEKLY: 'metric.user.active_weekly',

  // Core CRM
  CUSTOMER_CREATED: 'metric.customer.created',
  LEAD_CREATED: 'metric.lead.created',
  LEAD_CONVERTED: 'metric.lead.converted',
  TASK_CREATED: 'metric.task.created',
  TASK_COMPLETED: 'metric.task.completed',

  // Invoicing & payments
  INVOICE_CREATED: 'metric.invoice.created',
  INVOICE_STATUS_CHANGED: 'metric.invoice.status_changed',
  INVOICE_PAID: 'metric.invoice.paid',
  PAYMENT_RECORDED: 'metric.payment.recorded',

  // AI
  ASSISTANT_REQUEST: 'metric.assistant.request',
  ASSISTANT_FAILURE: 'metric.assistant.failure',
  ASSISTANT_FALLBACK: 'metric.assistant.fallback',

  // Billing & plans
  PLAN_CHANGED: 'metric.plan.changed',
  FEATURE_GATED_HIT: 'metric.feature.gated_hit',
  FEATURE_USED: 'metric.feature.used',

  // Pilot & packs
  PILOT_DEMO_CONVERSION: 'metric.pilot.demo_conversion',
  PACK_ENABLED: 'metric.pack.enabled',

  // Demo
  DEMO_SCENARIO_VIEWED: 'metric.demo.scenario_viewed',
  DEMO_RESET: 'metric.demo.reset',

  // Import / files
  IMPORT_SUCCESS: 'metric.import.success',
  IMPORT_FAILURE: 'metric.import.failure',
  FILE_UPLOADED: 'metric.file.uploaded',

  // Reliability
  API_ERROR_RATE: 'metric.api.error',
  CRITICAL_ERROR: 'metric.error.critical',
} as const;

export type MetricEvent = (typeof METRIC_EVENTS)[keyof typeof METRIC_EVENTS];

/** Dimensions commonly attached to metric events */
export interface MetricDimensions {
  organizationId?: string;
  planCode?: string;
  industryPack?: string;
  feature?: string;
  source?: 'web' | 'api' | 'automation' | 'ai-service';
}
