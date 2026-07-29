export interface MemberKpiInput {
  tasksCompleted: number;
  tasksOverdue: number;
  tasksOpen: number;
  callsLogged: number;
  meetingsLogged: number;
  leadsWon: number;
  messagesSent: number;
  threadsHandled: number;
  avgResponseMinutes: number | null;
  negativeSentimentCustomers: number;
}

export type PerformanceBand = 'excellent' | 'good' | 'needs_attention' | 'at_risk';

export type ManagerInsightLevel = 'ok' | 'warning' | 'critical';

export interface ManagerInsight {
  level: ManagerInsightLevel;
  title: string;
  description: string;
  memberId?: string;
  source?: 'rule' | 'ai';
}

export interface TeamMemberPerformance {
  userId: string;
  name: string;
  email: string;
  role: string;
  kpi: MemberKpiInput;
  score: number;
  band: PerformanceBand;
  wonLeadValue: number;
}

export interface TeamPerformanceOverview {
  members: TeamMemberPerformance[];
  insights: ManagerInsight[];
  coachingSuggestions?: CoachingSuggestion[];
  periodLabel: string;
  computedAt: string;
  conversationSummary?: {
    totalMessagesSent: number;
    negativeSentimentCustomers: number;
  };
}

export interface CoachingSuggestion {
  memberId: string;
  memberName: string;
  band: PerformanceBand;
  score: number;
  suggestion: string;
  source: 'rule' | 'ai';
}

export const PERFORMANCE_BAND_LABELS: Record<PerformanceBand, string> = {
  excellent: 'عالی',
  good: 'خوب',
  needs_attention: 'نیاز به توجه',
  at_risk: 'در معرض ریسک',
};

export const ACTIVITY_TYPE_LABELS: Record<string, string> = {
  CALL: 'تماس تلفنی',
  MEETING: 'جلسه',
  NOTE: 'یادداشت',
  EMAIL: 'ایمیل',
  MESSAGE: 'پیام',
};

function clampScore(value: number): number {
  return Math.max(0, Math.min(100, Math.round(value)));
}

export function computeMemberScore(kpi: MemberKpiInput): number {
  let score = 50;
  score += Math.min(kpi.tasksCompleted * 5, 25);
  score -= Math.min(kpi.tasksOverdue * 8, 40);
  score += Math.min((kpi.callsLogged + kpi.meetingsLogged) * 3, 15);
  score += Math.min(kpi.leadsWon * 8, 24);
  score += Math.min(kpi.messagesSent * 2, 10);
  if (kpi.avgResponseMinutes != null) {
    if (kpi.avgResponseMinutes <= 30) score += 5;
    else if (kpi.avgResponseMinutes >= 180) score -= 8;
  }
  score -= Math.min(kpi.negativeSentimentCustomers * 3, 12);
  if (kpi.tasksOpen > 20) {
    score -= 10;
  }
  return clampScore(score);
}

export function getPerformanceBand(score: number): PerformanceBand {
  if (score >= 80) return 'excellent';
  if (score >= 65) return 'good';
  if (score >= 45) return 'needs_attention';
  return 'at_risk';
}

export function buildManagerInsights(members: TeamMemberPerformance[]): ManagerInsight[] {
  const insights: ManagerInsight[] = [];
  const activeMembers = members.filter((m) => m.role !== 'VIEWER');

  const ranked = [...activeMembers].sort((a, b) => b.score - a.score);
  const top = ranked[0];
  if (top && top.kpi.tasksCompleted + top.kpi.leadsWon + top.kpi.callsLogged > 0) {
    insights.push({
      level: 'ok',
      title: 'بهترین عملکرد این ماه',
      description: `${top.name} — نمره ${top.score} از ۱۰۰`,
      memberId: top.userId,
    });
  }

  for (const member of activeMembers) {
    if (member.kpi.tasksOverdue >= 5) {
      insights.push({
        level: member.kpi.tasksOverdue >= 10 ? 'critical' : 'warning',
        title: 'وظایف معوق زیاد',
        description: `${member.name}: ${member.kpi.tasksOverdue} وظیفه سررسید گذشته`,
        memberId: member.userId,
      });
    }

    if (member.kpi.tasksOpen >= 15) {
      insights.push({
        level: 'warning',
        title: 'بار کاری بالا',
        description: `${member.name}: ${member.kpi.tasksOpen} وظیفه باز`,
        memberId: member.userId,
      });
    }

    const hasEngagement =
      member.kpi.tasksCompleted > 0 ||
      member.kpi.callsLogged > 0 ||
      member.kpi.meetingsLogged > 0 ||
      member.kpi.leadsWon > 0 ||
      member.kpi.messagesSent > 0;

    if (!hasEngagement && member.role !== 'OWNER') {
      insights.push({
        level: 'warning',
        title: 'فعالیت ثبت‌شده کم',
        description: `${member.name} در این ماه فعالیت عملیاتی ثبت نکرده است`,
        memberId: member.userId,
      });
    }

    if (member.kpi.avgResponseMinutes != null && member.kpi.avgResponseMinutes >= 180) {
      insights.push({
        level: 'warning',
        title: 'پاسخ‌گویی کند در مکالمات',
        description: `${member.name}: میانگین ${member.kpi.avgResponseMinutes} دقیقه تا پاسخ`,
        memberId: member.userId,
      });
    }

    if (
      member.kpi.messagesSent >= 20 &&
      member.kpi.leadsWon === 0 &&
      member.kpi.tasksCompleted < 3
    ) {
      insights.push({
        level: 'warning',
        title: 'حجم پیام بالا بدون نتیجه فروش',
        description: `${member.name}: ${member.kpi.messagesSent} پیام ارسال‌شده ولی سرنخ برنده ندارد`,
        memberId: member.userId,
      });
    }

    if (member.kpi.negativeSentimentCustomers >= 2) {
      insights.push({
        level: member.kpi.negativeSentimentCustomers >= 4 ? 'critical' : 'warning',
        title: 'مشتریان ناراضی در مکالمات',
        description: `${member.name}: ${member.kpi.negativeSentimentCustomers} مشتری با احساس منفی`,
        memberId: member.userId,
      });
    }
  }

  const atRisk = activeMembers.filter((m) => m.band === 'at_risk');
  if (atRisk.length >= 2) {
    insights.push({
      level: 'critical',
      title: 'چند عضو تیم در وضعیت پرریسک',
      description: `${atRisk.length} نفر نیاز به پیگیری مدیر دارند`,
    });
  }

  return insights;
}
