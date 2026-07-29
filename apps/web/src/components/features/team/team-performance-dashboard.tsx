import {
  formatCurrency,
  MEMBERSHIP_ROLE_LABELS,
  PERFORMANCE_BAND_LABELS,
  type CoachingSuggestion,
  type ManagerInsight,
  type TeamMemberPerformance,
} from '@kesbyar/shared';
import { AlertTriangle, CheckCircle2, MessageSquare, Sparkles, TrendingUp, Users } from 'lucide-react';

import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

function bandVariant(band: TeamMemberPerformance['band']) {
  switch (band) {
    case 'excellent':
      return 'success' as const;
    case 'good':
      return 'default' as const;
    case 'needs_attention':
      return 'secondary' as const;
    case 'at_risk':
      return 'destructive' as const;
  }
}

function insightIcon(level: ManagerInsight['level']) {
  if (level === 'ok') return CheckCircle2;
  if (level === 'critical') return AlertTriangle;
  return TrendingUp;
}

function insightClass(level: ManagerInsight['level']) {
  if (level === 'ok') return 'border-emerald-200 bg-emerald-50/60';
  if (level === 'critical') return 'border-destructive/30 bg-destructive/5';
  return 'border-amber-200 bg-amber-50/60';
}

function formatResponseMinutes(minutes: number | null): string {
  if (minutes == null) return '—';
  if (minutes < 60) return `${minutes} دقیقه`;
  const hours = Math.floor(minutes / 60);
  const rest = minutes % 60;
  return rest > 0 ? `${hours} ساعت ${rest} دقیقه` : `${hours} ساعت`;
}

export function TeamPerformanceDashboard({
  members,
  insights,
  coachingSuggestions = [],
  periodLabel,
  conversationSummary,
}: {
  members: TeamMemberPerformance[];
  insights: ManagerInsight[];
  coachingSuggestions?: CoachingSuggestion[];
  periodLabel: string;
  conversationSummary?: {
    totalMessagesSent: number;
    negativeSentimentCustomers: number;
  };
}) {
  const avgScore =
    members.length > 0
      ? Math.round(members.reduce((sum, m) => sum + m.score, 0) / members.length)
      : 0;
  const totalCompleted = members.reduce((sum, m) => sum + m.kpi.tasksCompleted, 0);
  const totalOverdue = members.reduce((sum, m) => sum + m.kpi.tasksOverdue, 0);
  const totalMessages = members.reduce((sum, m) => sum + m.kpi.messagesSent, 0);

  return (
    <div className="space-y-6">
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        <Card>
          <CardContent className="p-4">
            <div className="text-sm text-muted-foreground">اعضای تیم</div>
            <div className="mt-1 flex items-center gap-2 text-2xl font-bold">
              <Users className="h-5 w-5 text-primary" />
              {members.length}
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="text-sm text-muted-foreground">میانگین نمره ({periodLabel})</div>
            <div className="mt-1 text-2xl font-bold">{avgScore}</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="text-sm text-muted-foreground">وظایف انجام‌شده</div>
            <div className="mt-1 text-2xl font-bold">{totalCompleted}</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="text-sm text-muted-foreground">وظایف معوق</div>
            <div className="mt-1 text-2xl font-bold text-destructive">{totalOverdue}</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="text-sm text-muted-foreground">پیام‌های ارسالی</div>
            <div className="mt-1 flex items-center gap-2 text-2xl font-bold">
              <MessageSquare className="h-5 w-5 text-primary" />
              {conversationSummary?.totalMessagesSent ?? totalMessages}
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="text-sm text-muted-foreground">مشتریان ناراضی</div>
            <div className="mt-1 text-2xl font-bold text-destructive">
              {conversationSummary?.negativeSentimentCustomers ?? 0}
            </div>
          </CardContent>
        </Card>
      </div>

      {insights.length > 0 ? (
        <Card>
          <CardHeader>
            <CardTitle className="text-base">راهنمای مدیر</CardTitle>
          </CardHeader>
          <CardContent className="grid gap-3 md:grid-cols-2">
            {insights.map((insight, index) => {
              const Icon = insightIcon(insight.level);
              return (
                <div
                  key={`${insight.title}-${index}`}
                  className={`rounded-lg border p-4 ${insightClass(insight.level)}`}
                >
                  <div className="flex items-start gap-3">
                    <Icon className="mt-0.5 h-5 w-5 shrink-0" />
                    <div className="space-y-2">
                      <div className="flex flex-wrap items-center gap-2">
                        <div className="font-medium">{insight.title}</div>
                        {insight.source === 'ai' ? (
                          <Badge variant="outline" className="gap-1 text-xs">
                            <Sparkles className="size-3" />
                            تحلیل هوشمند
                          </Badge>
                        ) : null}
                      </div>
                      <div className="text-sm text-muted-foreground">{insight.description}</div>
                    </div>
                  </div>
                </div>
              );
            })}
          </CardContent>
        </Card>
      ) : null}

      {coachingSuggestions.length > 0 ? (
        <Card>
          <CardHeader>
            <CardTitle className="text-base">پیشنهاد مربیگری (اعضای نیازمند توجه)</CardTitle>
          </CardHeader>
          <CardContent className="grid gap-3 md:grid-cols-2">
            {coachingSuggestions.map((item) => (
              <div
                key={item.memberId}
                className="rounded-lg border border-amber-200 bg-amber-50/60 p-4 dark:border-amber-900/40 dark:bg-amber-950/20"
              >
                <div className="flex flex-wrap items-center gap-2">
                  <span className="font-medium">{item.memberName}</span>
                  <Badge variant={item.band === 'at_risk' ? 'destructive' : 'secondary'}>
                    {PERFORMANCE_BAND_LABELS[item.band]} — {item.score}
                  </Badge>
                  {item.source === 'ai' ? (
                    <Badge variant="outline" className="gap-1 text-xs">
                      <Sparkles className="size-3" />
                      هوشمند
                    </Badge>
                  ) : null}
                </div>
                <p className="mt-2 text-sm text-muted-foreground">{item.suggestion}</p>
              </div>
            ))}
          </CardContent>
        </Card>
      ) : null}

      <Card>
        <CardHeader>
          <CardTitle className="text-base">عملکرد اعضا ({periodLabel})</CardTitle>
        </CardHeader>
        <CardContent className="overflow-x-auto">
          <table className="w-full min-w-[960px] text-sm">
            <thead>
              <tr className="border-b text-right text-muted-foreground">
                <th className="px-3 py-2 font-medium">عضو</th>
                <th className="px-3 py-2 font-medium">نقش</th>
                <th className="px-3 py-2 font-medium">نمره</th>
                <th className="px-3 py-2 font-medium">وضعیت</th>
                <th className="px-3 py-2 font-medium">انجام‌شده</th>
                <th className="px-3 py-2 font-medium">معوق</th>
                <th className="px-3 py-2 font-medium">پیام</th>
                <th className="px-3 py-2 font-medium">میانگین پاسخ</th>
                <th className="px-3 py-2 font-medium">تماس/جلسه</th>
                <th className="px-3 py-2 font-medium">سرنخ برنده</th>
                <th className="px-3 py-2 font-medium">ارزش سرنخ</th>
              </tr>
            </thead>
            <tbody>
              {members.map((member) => (
                <tr key={member.userId} className="border-b last:border-0">
                  <td className="px-3 py-3">
                    <div className="font-medium">{member.name}</div>
                    <div className="text-xs text-muted-foreground">{member.email}</div>
                    {member.kpi.negativeSentimentCustomers > 0 ? (
                      <div className="mt-1 text-xs text-destructive">
                        {member.kpi.negativeSentimentCustomers} مشتری ناراضی
                      </div>
                    ) : null}
                  </td>
                  <td className="px-3 py-3">
                    {MEMBERSHIP_ROLE_LABELS[member.role] ?? member.role}
                  </td>
                  <td className="px-3 py-3 font-bold">{member.score}</td>
                  <td className="px-3 py-3">
                    <Badge variant={bandVariant(member.band)}>
                      {PERFORMANCE_BAND_LABELS[member.band]}
                    </Badge>
                  </td>
                  <td className="px-3 py-3">{member.kpi.tasksCompleted}</td>
                  <td className="px-3 py-3">{member.kpi.tasksOverdue}</td>
                  <td className="px-3 py-3">{member.kpi.messagesSent}</td>
                  <td className="px-3 py-3">{formatResponseMinutes(member.kpi.avgResponseMinutes)}</td>
                  <td className="px-3 py-3">
                    {member.kpi.callsLogged + member.kpi.meetingsLogged}
                  </td>
                  <td className="px-3 py-3">{member.kpi.leadsWon}</td>
                  <td className="px-3 py-3">{formatCurrency(member.wonLeadValue)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </CardContent>
      </Card>
    </div>
  );
}
