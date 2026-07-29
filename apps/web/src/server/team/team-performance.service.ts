import type { TeamPerformanceOverview, TeamMemberPerformance } from '@kesbyar/shared';
import {
  buildManagerInsights,
  computeMemberScore,
  getPerformanceBand,
} from '@kesbyar/shared';

import { prisma } from '@/lib/prisma';
import { buildAiManagerInsights, buildCoachingSuggestions } from '@/server/team/team-ai-insights';
import {
  getConversationMetricsByMember,
  getOrganizationConversationSummary,
} from '@/server/team/team-conversation-metrics';

function startOfMonth(): Date {
  const date = new Date();
  date.setDate(1);
  date.setHours(0, 0, 0, 0);
  return date;
}

function attributeWonLeads(
  memberIds: string[],
  wonLeads: Array<{
    id: string;
    value: unknown;
    activities: Array<{ userId: string | null }>;
    tasks: Array<{ assigneeId: string | null }>;
  }>,
): Map<string, { count: number; value: number }> {
  const map = new Map<string, { count: number; value: number }>();
  for (const userId of memberIds) {
    map.set(userId, { count: 0, value: 0 });
  }

  for (const lead of wonLeads) {
    const contributors = new Set<string>();
    for (const activity of lead.activities) {
      if (activity.userId && memberIds.includes(activity.userId)) {
        contributors.add(activity.userId);
      }
    }
    for (const task of lead.tasks) {
      if (task.assigneeId && memberIds.includes(task.assigneeId)) {
        contributors.add(task.assigneeId);
      }
    }

    for (const userId of contributors) {
      const current = map.get(userId)!;
      current.count += 1;
      current.value += Number(lead.value ?? 0);
    }
  }

  return map;
}

export async function getTeamPerformanceOverview(
  organizationId: string,
): Promise<TeamPerformanceOverview> {
  const since = startOfMonth();
  const now = new Date();

  const memberships = await prisma.membership.findMany({
    where: { organizationId, isActive: true },
    include: {
      user: { select: { id: true, name: true, email: true } },
    },
    orderBy: { joinedAt: 'asc' },
  });

  const memberIds = memberships.map((m) => m.userId);

  if (memberIds.length === 0) {
    return {
      members: [],
      insights: [],
      periodLabel: 'ماه جاری',
      computedAt: now.toISOString(),
    };
  }

  const [
    tasksCompleted,
    tasksOverdue,
    tasksOpen,
    callsLogged,
    meetingsLogged,
    wonLeads,
    conversationMetrics,
    conversationSummary,
  ] = await Promise.all([
    prisma.task.groupBy({
      by: ['assigneeId'],
      where: {
        organizationId,
        assigneeId: { in: memberIds },
        status: 'DONE',
        completedAt: { gte: since },
      },
      _count: true,
    }),
    prisma.task.groupBy({
      by: ['assigneeId'],
      where: {
        organizationId,
        assigneeId: { in: memberIds },
        status: { in: ['TODO', 'IN_PROGRESS'] },
        dueDate: { lt: now },
      },
      _count: true,
    }),
    prisma.task.groupBy({
      by: ['assigneeId'],
      where: {
        organizationId,
        assigneeId: { in: memberIds },
        status: { in: ['TODO', 'IN_PROGRESS'] },
      },
      _count: true,
    }),
    prisma.activityLog.groupBy({
      by: ['userId'],
      where: {
        organizationId,
        userId: { in: memberIds },
        type: 'CALL',
        createdAt: { gte: since },
      },
      _count: true,
    }),
    prisma.activityLog.groupBy({
      by: ['userId'],
      where: {
        organizationId,
        userId: { in: memberIds },
        type: 'MEETING',
        createdAt: { gte: since },
      },
      _count: true,
    }),
    prisma.lead.findMany({
      where: {
        organizationId,
        status: 'WON',
        wonAt: { gte: since },
      },
      select: {
        id: true,
        value: true,
        activities: { select: { userId: true } },
        tasks: {
          where: { status: 'DONE' },
          select: { assigneeId: true },
        },
      },
    }),
    getConversationMetricsByMember(organizationId, memberIds, since),
    getOrganizationConversationSummary(organizationId, since),
  ]);

  const countBy = <T extends string>(
    rows: Array<Record<T, string | null> & { _count: number }>,
    key: T,
  ): Map<string, number> => {
    const map = new Map<string, number>();
    for (const row of rows) {
      const id = row[key];
      if (id) map.set(id, row._count);
    }
    return map;
  };

  const completedMap = countBy(tasksCompleted, 'assigneeId');
  const overdueMap = countBy(tasksOverdue, 'assigneeId');
  const openMap = countBy(tasksOpen, 'assigneeId');
  const callsMap = countBy(callsLogged, 'userId');
  const meetingsMap = countBy(meetingsLogged, 'userId');
  const wonMap = attributeWonLeads(memberIds, wonLeads);

  const members: TeamMemberPerformance[] = memberships.map((membership) => {
    const userId = membership.userId;
    const conv = conversationMetrics.get(userId);
    const kpi = {
      tasksCompleted: completedMap.get(userId) ?? 0,
      tasksOverdue: overdueMap.get(userId) ?? 0,
      tasksOpen: openMap.get(userId) ?? 0,
      callsLogged: callsMap.get(userId) ?? 0,
      meetingsLogged: meetingsMap.get(userId) ?? 0,
      leadsWon: wonMap.get(userId)?.count ?? 0,
      messagesSent: conv?.messagesSent ?? 0,
      threadsHandled: conv?.threadsHandled ?? 0,
      avgResponseMinutes: conv?.avgResponseMinutes ?? null,
      negativeSentimentCustomers: conv?.negativeSentimentCustomers ?? 0,
    };
    const score = computeMemberScore(kpi);

    return {
      userId,
      name: membership.user.name,
      email: membership.user.email,
      role: membership.role,
      kpi,
      score,
      band: getPerformanceBand(score),
      wonLeadValue: wonMap.get(userId)?.value ?? 0,
    };
  });

  members.sort((a, b) => b.score - a.score);

  const ruleInsights = buildManagerInsights(members).map((insight) => ({
    ...insight,
    source: 'rule' as const,
  }));
  const aiInsights = await buildAiManagerInsights(members, conversationSummary);
  const coachingSuggestions = await buildCoachingSuggestions(members);

  return {
    members,
    insights: [...ruleInsights, ...aiInsights],
    coachingSuggestions,
    periodLabel: 'ماه جاری',
    computedAt: now.toISOString(),
    conversationSummary,
  };
}
