/**
 * Metric event ownership matrix (code mirror of docs).
 * @see docs/metrics/event-ownership-matrix.md
 */
import { METRIC_EVENTS } from '../observability/metric-events';
import { KPI_CATALOG } from './kpi-definitions';

export type MetricOwnerTeam = 'product' | 'growth' | 'engineering' | 'customer_success' | 'ops';

export interface EventOwnershipRow {
  event: string;
  type: 'metric' | 'app_log' | 'audit';
  owner: MetricOwnerTeam;
  emitter: string;
  consumer: string;
  kpiLink?: string;
}

export const EVENT_OWNERSHIP: readonly EventOwnershipRow[] = [
  {
    event: METRIC_EVENTS.WORKSPACE_ACTIVE_DAILY,
    type: 'metric',
    owner: 'product',
    emitter: 'batch rollup (post-V1)',
    consumer: 'product dashboard',
    kpiLink: 'kpi.workspace.active_daily',
  },
  {
    event: METRIC_EVENTS.WORKSPACE_PILOT_ACTIVATED,
    type: 'metric',
    owner: 'customer_success',
    emitter: 'pilot onboarding completion',
    consumer: 'CS pilot tracker',
    kpiLink: 'kpi.workspace.pilot_activated',
  },
  {
    event: METRIC_EVENTS.USER_ACTIVE_DAILY,
    type: 'metric',
    owner: 'product',
    emitter: 'session / rollup',
    consumer: 'engagement reports',
    kpiLink: 'kpi.user.dau',
  },
  {
    event: METRIC_EVENTS.LEAD_CREATED,
    type: 'metric',
    owner: 'product',
    emitter: 'lead.service',
    consumer: 'funnel analytics',
  },
  {
    event: METRIC_EVENTS.INVOICE_CREATED,
    type: 'metric',
    owner: 'product',
    emitter: 'invoice.service',
    consumer: 'revenue funnel',
  },
  {
    event: METRIC_EVENTS.INVOICE_PAID,
    type: 'metric',
    owner: 'growth',
    emitter: 'invoice status PAID',
    consumer: 'commercial health',
  },
  {
    event: METRIC_EVENTS.PAYMENT_RECORDED,
    type: 'metric',
    owner: 'growth',
    emitter: 'payment.service',
    consumer: 'cash collection',
  },
  {
    event: METRIC_EVENTS.ASSISTANT_REQUEST,
    type: 'metric',
    owner: 'product',
    emitter: 'conversation API',
    consumer: 'AI adoption',
  },
  {
    event: METRIC_EVENTS.ASSISTANT_FAILURE,
    type: 'metric',
    owner: 'engineering',
    emitter: 'ai client',
    consumer: 'reliability',
  },
  {
    event: METRIC_EVENTS.FEATURE_USED,
    type: 'metric',
    owner: 'product',
    emitter: 'domain services',
    consumer: 'plan usage',
  },
  {
    event: METRIC_EVENTS.FEATURE_GATED_HIT,
    type: 'metric',
    owner: 'growth',
    emitter: 'PlanUpgradeRequiredError',
    consumer: 'upgrade ops',
  },
  {
    event: METRIC_EVENTS.PLAN_CHANGED,
    type: 'metric',
    owner: 'growth',
    emitter: 'subscription.service',
    consumer: 'MRR proxy',
  },
  {
    event: METRIC_EVENTS.PILOT_DEMO_CONVERSION,
    type: 'metric',
    owner: 'growth',
    emitter: 'CS / signup flow',
    consumer: 'sales funnel',
  },
  {
    event: METRIC_EVENTS.PACK_ENABLED,
    type: 'metric',
    owner: 'product',
    emitter: 'org pack settings',
    consumer: 'vertical adoption',
  },
];

export function getKpiCatalog() {
  return KPI_CATALOG;
}
