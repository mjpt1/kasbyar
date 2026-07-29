import type {
  CoachingSuggestion,
  ManagerInsight,
  TeamMemberPerformance,
} from '@kesbyar/shared';

import { chatWithLlm } from '@/lib/ai';

type ConversationSummary = {
  totalMessagesSent: number;
  negativeSentimentCustomers: number;
};

function buildRuleCoachingSuggestions(
  members: TeamMemberPerformance[],
): CoachingSuggestion[] {
  const suggestions: CoachingSuggestion[] = [];

  for (const member of members) {
    if (member.band !== 'needs_attention' && member.band !== 'at_risk') continue;

    const parts: string[] = [];
    if (member.kpi.tasksOverdue >= 3) {
      parts.push(`اولویت با بستن ${member.kpi.tasksOverdue} وظیفه معوق`);
    }
    if (member.kpi.avgResponseMinutes != null && member.kpi.avgResponseMinutes >= 120) {
      parts.push('زمان پاسخ در مکالمات را زیر ۲ ساعت نگه دارید');
    }
    if (member.kpi.messagesSent >= 15 && member.kpi.leadsWon === 0) {
      parts.push('پیام‌ها را به پیگیری تماس/جلسه و پیشنهاد قیمت متصل کنید');
    }
    if (member.kpi.negativeSentimentCustomers >= 1) {
      parts.push('با مشتریان ناراضی تماس بگیرید و علت را ثبت کنید');
    }
    if (member.kpi.tasksCompleted === 0 && member.kpi.callsLogged === 0) {
      parts.push('حداقل یک فعالیت (تماس یا وظیفه) در CRM ثبت کنید');
    }
    if (parts.length === 0) {
      parts.push('با مدیر یک جلسه کوتاه برای اولویت‌بندی هفتگی بگذارید');
    }

    suggestions.push({
      memberId: member.userId,
      memberName: member.name,
      band: member.band,
      score: member.score,
      suggestion: parts.join('؛ '),
      source: 'rule',
    });
  }

  return suggestions;
}

export async function buildAiCoachingSuggestions(
  members: TeamMemberPerformance[],
): Promise<CoachingSuggestion[]> {
  const underperformers = members.filter(
    (m) => m.band === 'needs_attention' || m.band === 'at_risk',
  );
  if (underperformers.length === 0) return [];

  const snapshot = underperformers.slice(0, 5).map((m) => ({
    name: m.name,
    score: m.score,
    band: m.band,
    tasksOverdue: m.kpi.tasksOverdue,
    messagesSent: m.kpi.messagesSent,
    avgResponseMinutes: m.kpi.avgResponseMinutes,
    leadsWon: m.kpi.leadsWon,
    negativeSentimentCustomers: m.kpi.negativeSentimentCustomers,
  }));

  const llm = await chatWithLlm({
    systemPrompt:
      'تو مربی فروش هستی. برای هر عضو ضعیف، یک پیشنهاد کوچک و عملی (یک جمله) به فارسی بده. فقط JSON array: [{"name":"...","suggestion":"..."}]',
    userContent: JSON.stringify(snapshot),
    temperature: 0.3,
    maxTokens: 500,
  });

  if (!llm) return [];

  try {
    const parsed = JSON.parse(llm) as Array<{ name?: string; suggestion?: string }>;
    if (!Array.isArray(parsed)) return [];

    const results: CoachingSuggestion[] = [];
    for (const row of parsed) {
      if (!row.name || !row.suggestion) continue;
      const member = underperformers.find((m) => m.name === row.name);
      if (!member) continue;
      results.push({
        memberId: member.userId,
        memberName: member.name,
        band: member.band,
        score: member.score,
        suggestion: row.suggestion,
        source: 'ai',
      });
    }
    return results;
  } catch {
    return [];
  }
}

export async function buildCoachingSuggestions(
  members: TeamMemberPerformance[],
): Promise<CoachingSuggestion[]> {
  const ruleSuggestions = buildRuleCoachingSuggestions(members);
  const aiSuggestions = await buildAiCoachingSuggestions(members);

  const byMember = new Map<string, CoachingSuggestion>();
  for (const s of ruleSuggestions) {
    byMember.set(s.memberId, s);
  }
  for (const s of aiSuggestions) {
    if (!byMember.has(s.memberId)) {
      byMember.set(s.memberId, s);
    }
  }
  return Array.from(byMember.values());
}

export async function buildAiManagerInsights(
  members: TeamMemberPerformance[],
  conversationSummary: ConversationSummary,
): Promise<ManagerInsight[]> {
  if (members.length === 0) return [];

  const snapshot = {
    period: 'ماه جاری',
    teamSize: members.length,
    avgScore: Math.round(members.reduce((s, m) => s + m.score, 0) / members.length),
    totalMessagesSent: conversationSummary.totalMessagesSent,
    negativeSentimentCustomers: conversationSummary.negativeSentimentCustomers,
    members: members.slice(0, 8).map((m) => ({
      name: m.name,
      score: m.score,
      band: m.band,
      tasksCompleted: m.kpi.tasksCompleted,
      tasksOverdue: m.kpi.tasksOverdue,
      messagesSent: m.kpi.messagesSent,
      avgResponseMinutes: m.kpi.avgResponseMinutes,
      negativeSentimentCustomers: m.kpi.negativeSentimentCustomers,
      leadsWon: m.kpi.leadsWon,
    })),
  };

  const llm = await chatWithLlm({
    systemPrompt:
      'تو یک مشاور عملیات فروش هستی. بر اساس داده تیم، حداکثر ۳ insight عملی برای مدیر به فارسی بده. فقط JSON array برگردان: [{"level":"ok|warning|critical","title":"...","description":"..."}]',
    userContent: JSON.stringify(snapshot),
    temperature: 0.2,
    maxTokens: 600,
  });

  if (!llm) return [];

  try {
    const parsed = JSON.parse(llm) as Array<{
      level?: ManagerInsight['level'];
      title?: string;
      description?: string;
      memberId?: string;
    }>;
    if (!Array.isArray(parsed)) return [];

    return parsed
      .filter((row) => row.title && row.description)
      .slice(0, 3)
      .map((row) => ({
        level:
          row.level === 'critical' || row.level === 'warning' || row.level === 'ok'
            ? row.level
            : 'warning',
        title: row.title!,
        description: row.description!,
        memberId: row.memberId,
        source: 'ai' as const,
      }));
  } catch {
    return [];
  }
}
