/**
 * KPI definitions — product & commercial health.
 * @see docs/metrics/business-metrics-foundation.md
 */

export const KPI_IDS = {
  ACTIVE_WORKSPACES_DAILY: 'kpi.workspace.active_daily',
  PILOT_WORKSPACES_ACTIVATED: 'kpi.workspace.pilot_activated',
  DAU: 'kpi.user.dau',
  WAU: 'kpi.user.wau',
  LEADS_CREATED: 'kpi.lead.created',
  INVOICES_CREATED: 'kpi.invoice.created',
  INVOICES_PAID: 'kpi.invoice.paid',
  PAYMENTS_RECORDED: 'kpi.payment.recorded',
  ASSISTANT_USAGE: 'kpi.assistant.usage',
  ASSISTANT_FAILURE_RATE: 'kpi.assistant.failure_rate',
  FEATURE_USAGE_BY_PLAN: 'kpi.feature.usage_by_plan',
  DEMO_TO_PILOT_CONVERSION: 'kpi.pilot.demo_conversion',
  PACK_ADOPTION: 'kpi.pack.adoption',
  RETENTION_DIRECTIONAL: 'kpi.retention.engagement',
} as const;

export type KpiId = (typeof KPI_IDS)[keyof typeof KPI_IDS];

export type KpiCadence = 'realtime' | 'daily' | 'weekly' | 'monthly';

export interface KpiDefinition {
  id: KpiId;
  metricEvent?: string;
  cadence: KpiCadence;
  owner: 'product' | 'growth' | 'engineering' | 'customer_success';
  description: string;
}

export const KPI_CATALOG: readonly KpiDefinition[] = [
  {
    id: KPI_IDS.ACTIVE_WORKSPACES_DAILY,
    metricEvent: 'metric.workspace.active_daily',
    cadence: 'daily',
    owner: 'product',
    description: 'Distinct organizations with at least one meaningful action per day',
  },
  {
    id: KPI_IDS.PILOT_WORKSPACES_ACTIVATED,
    metricEvent: 'metric.workspace.pilot_activated',
    cadence: 'realtime',
    owner: 'customer_success',
    description: 'Pilot workspace marked activated after onboarding checklist complete',
  },
  {
    id: KPI_IDS.DAU,
    metricEvent: 'metric.user.active_daily',
    cadence: 'daily',
    owner: 'product',
    description: 'Distinct users with session activity per day',
  },
  {
    id: KPI_IDS.WAU,
    metricEvent: 'metric.user.active_weekly',
    cadence: 'weekly',
    owner: 'product',
    description: 'Distinct users with session activity per week',
  },
  {
    id: KPI_IDS.LEADS_CREATED,
    metricEvent: 'metric.lead.created',
    cadence: 'realtime',
    owner: 'product',
    description: 'Leads created across all workspaces',
  },
  {
    id: KPI_IDS.INVOICES_CREATED,
    metricEvent: 'metric.invoice.created',
    cadence: 'realtime',
    owner: 'product',
    description: 'Invoices issued',
  },
  {
    id: KPI_IDS.INVOICES_PAID,
    metricEvent: 'metric.invoice.paid',
    cadence: 'realtime',
    owner: 'growth',
    description: 'Invoices reaching PAID status',
  },
  {
    id: KPI_IDS.PAYMENTS_RECORDED,
    metricEvent: 'metric.payment.recorded',
    cadence: 'realtime',
    owner: 'growth',
    description: 'Payment records created',
  },
  {
    id: KPI_IDS.ASSISTANT_USAGE,
    metricEvent: 'metric.assistant.request',
    cadence: 'realtime',
    owner: 'product',
    description: 'Assistant requests on success path',
  },
  {
    id: KPI_IDS.ASSISTANT_FAILURE_RATE,
    metricEvent: 'metric.assistant.failure',
    cadence: 'daily',
    owner: 'engineering',
    description: 'failure / request ratio — rollup',
  },
  {
    id: KPI_IDS.FEATURE_USAGE_BY_PLAN,
    metricEvent: 'metric.feature.used',
    cadence: 'daily',
    owner: 'product',
    description: 'Feature usage by planCode',
  },
  {
    id: KPI_IDS.DEMO_TO_PILOT_CONVERSION,
    metricEvent: 'metric.pilot.demo_conversion',
    cadence: 'realtime',
    owner: 'growth',
    description: 'Demo evaluation to paid pilot',
  },
  {
    id: KPI_IDS.PACK_ADOPTION,
    metricEvent: 'metric.pack.enabled',
    cadence: 'realtime',
    owner: 'product',
    description: 'Industry pack enabled per workspace',
  },
  {
    id: KPI_IDS.RETENTION_DIRECTIONAL,
    metricEvent: 'metric.user.active_weekly',
    cadence: 'weekly',
    owner: 'customer_success',
    description: 'Directional engagement via WAU trends',
  },
] as const;
