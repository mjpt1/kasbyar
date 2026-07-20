export type HealthDimensionName = 'FINANCIAL' | 'SALES' | 'OPERATIONS' | 'GROWTH' | 'HR';

export type AlertLevel = 'critical' | 'warning' | 'ok';

export interface HealthScore {
  dimension: HealthDimensionName;
  score: number;
  factors: Record<string, unknown>;
  computedAt: string;
}

export interface BriefingAlert {
  level: AlertLevel;
  title: string;
  description: string;
  dimension?: HealthDimensionName;
}

export interface BriefingRecommendation {
  id?: string;
  title: string;
  description: string;
  priority: 'high' | 'medium' | 'low';
  actionType?: string;
  payload?: Record<string, unknown>;
  requiresConfirmation?: boolean;
}

export interface DailyBriefing {
  greeting: string;
  summary: string;
  alerts: BriefingAlert[];
  recommendations: BriefingRecommendation[];
  healthScores: HealthScore[];
  generatedAt: string;
  degraded?: boolean;
}
