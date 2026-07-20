/** قراردادهای داخلی بین وب و سرویس هوشمند */

export interface AiHealthStatus {
  status: 'ok' | 'degraded' | 'unavailable';
  service: string;
  version: string;
  latencyMs?: number;
}

export interface WorkspaceContext {
  organization_id: string;
  organization_name?: string;
  timezone?: string;
}

/** snapshot عملیاتی — از Prisma ساخته و به AI ارسال می‌شود */
export interface OperationalContextSnapshot {
  today_sales: number;
  open_invoices: number;
  overdue_receivables: number;
  active_leads: number;
  pending_tasks: number;
  tasks_due_today: number;
  stale_lead_count: number;
  overdue_invoice_count: number;
  top_overdue_customers: string[];
  top_stale_leads: string[];
  tasks_due_today_titles: string[];
  /** v2 extended metrics */
  week_sales?: number;
  month_sales?: number;
  week_sales_change_pct?: number;
  new_customers_month?: number;
  cash_received_month?: number;
}

export interface LlmChatRequest {
  messages: Array<{ role: string; content: string }>;
  system_prompt?: string;
  temperature?: number;
  max_tokens?: number;
}

export interface LlmChatResponse {
  content: string;
  model: string;
  usage?: Record<string, number>;
}

export interface LlmEmbedRequest {
  texts: string[];
}

export interface LlmEmbedResponse {
  embeddings: number[][];
  model: string;
  dimensions: number;
}

export interface OperationalSummaryRequest {
  organization_id: string;
  context: OperationalContextSnapshot;
}

export interface OperationalSummaryResponse {
  summary: string;
  highlights: string[];
  confidence: number;
  generated_at: string;
}

export interface AssistantAskRequest {
  organization_id: string;
  question: string;
  context: OperationalContextSnapshot;
}

export interface AssistantAskResponse {
  answer: string;
  confidence: number;
  sources: string[];
  citations?: import('./agents').AgentCitation[];
  recommendedActions?: import('./agents').RecommendedAction[];
  sessionId?: string;
  agentType?: import('./agents').AgentTypeName;
  degraded?: boolean;
}

/** @deprecated از AssistantAskRequest استفاده کنید */
export interface InsightRequest {
  organization_id: string;
  question: string;
  context?: Record<string, unknown>;
}

export interface InsightResponse {
  answer: string;
  confidence: number;
  sources: string[];
}

export interface DocumentParseRequest {
  organization_id: string;
  file_name: string;
  mime_type: string;
  content_base64?: string | null;
}

export interface DocumentParseResponse {
  extracted_text: string;
  fields: Record<string, unknown>;
  document_type: string | null;
  status: 'ready' | 'error';
  message?: string;
}

export interface AnalyticsHelperRequest {
  organization_id: string;
  metric: 'sales_trend' | 'receivables' | 'pipeline' | 'tasks';
  context: OperationalContextSnapshot;
  days?: number;
}

export interface AnalyticsHelperResponse {
  metric: string;
  summary: string;
  data_points: Record<string, unknown>;
  status: 'ok' | 'unavailable';
}

export interface AiServiceErrorBody {
  code: string;
  message: string;
  detail?: string;
}
