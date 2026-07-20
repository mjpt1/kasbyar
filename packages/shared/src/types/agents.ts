export type AgentTypeName =
  | 'CEO'
  | 'SALES'
  | 'FINANCE'
  | 'HR'
  | 'OPERATIONS'
  | 'MARKETING'
  | 'SUPPORT'
  | 'INVENTORY'
  | 'LEGAL';

export interface AgentCitation {
  source: string;
  excerpt: string;
  documentId?: string;
  entityType?: string;
  entityId?: string;
}

export interface RecommendedAction {
  id: string;
  title: string;
  description: string;
  actionType: 'CREATE_TASK' | 'SEND_REMINDER' | 'UPDATE_STATUS' | 'CUSTOM';
  payload: Record<string, unknown>;
  requiresConfirmation: boolean;
}

export interface AgentToolCall {
  tool: string;
  input: Record<string, unknown>;
  output?: Record<string, unknown>;
}

export interface ActionConfirmation {
  actionId: string;
  approved: boolean;
}

export interface AgentAskResponse {
  answer: string;
  confidence: number;
  citations: AgentCitation[];
  recommendedActions: RecommendedAction[];
  agentType: AgentTypeName;
  sessionId?: string;
  degraded?: boolean;
}
