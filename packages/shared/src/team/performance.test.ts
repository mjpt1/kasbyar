import { describe, expect, it } from 'vitest';

import {
  buildManagerInsights,
  computeMemberScore,
  getPerformanceBand,
  type TeamMemberPerformance,
} from './performance';

const emptyConversationKpi = {
  messagesSent: 0,
  threadsHandled: 0,
  avgResponseMinutes: null,
  negativeSentimentCustomers: 0,
};

describe('computeMemberScore', () => {
  it('rewards completions and penalizes overdue tasks', () => {
    const base = {
      tasksCompleted: 0,
      tasksOverdue: 0,
      tasksOpen: 0,
      callsLogged: 0,
      meetingsLogged: 0,
      leadsWon: 0,
      ...emptyConversationKpi,
    };
    expect(computeMemberScore(base)).toBe(50);
    expect(
      computeMemberScore({ ...base, tasksCompleted: 5, callsLogged: 2, leadsWon: 1 }),
    ).toBeGreaterThan(50);
    expect(computeMemberScore({ ...base, tasksOverdue: 5 })).toBeLessThan(50);
  });

  it('includes conversation signals in score', () => {
    const base = {
      tasksCompleted: 2,
      tasksOverdue: 0,
      tasksOpen: 0,
      callsLogged: 0,
      meetingsLogged: 0,
      leadsWon: 0,
      messagesSent: 5,
      threadsHandled: 3,
      avgResponseMinutes: 20,
      negativeSentimentCustomers: 0,
    };
    const withSlowResponse = { ...base, avgResponseMinutes: 240 };
    expect(computeMemberScore(base)).toBeGreaterThan(computeMemberScore(withSlowResponse));
  });
});

describe('getPerformanceBand', () => {
  it('maps score ranges to bands', () => {
    expect(getPerformanceBand(85)).toBe('excellent');
    expect(getPerformanceBand(70)).toBe('good');
    expect(getPerformanceBand(50)).toBe('needs_attention');
    expect(getPerformanceBand(30)).toBe('at_risk');
  });
});

describe('buildManagerInsights', () => {
  it('flags overdue workload and highlights top performer', () => {
    const members: TeamMemberPerformance[] = [
      {
        userId: '1',
        name: 'علی',
        email: 'a@test.ir',
        role: 'STAFF',
        kpi: {
          tasksCompleted: 8,
          tasksOverdue: 0,
          tasksOpen: 2,
          callsLogged: 3,
          meetingsLogged: 1,
          leadsWon: 2,
          messagesSent: 10,
          threadsHandled: 4,
          avgResponseMinutes: 25,
          negativeSentimentCustomers: 0,
        },
        score: 90,
        band: 'excellent',
        wonLeadValue: 0,
      },
      {
        userId: '2',
        name: 'رضا',
        email: 'b@test.ir',
        role: 'STAFF',
        kpi: {
          tasksCompleted: 0,
          tasksOverdue: 6,
          tasksOpen: 18,
          callsLogged: 0,
          meetingsLogged: 0,
          leadsWon: 0,
          messagesSent: 25,
          threadsHandled: 8,
          avgResponseMinutes: 240,
          negativeSentimentCustomers: 3,
        },
        score: 30,
        band: 'at_risk',
        wonLeadValue: 0,
      },
    ];

    const insights = buildManagerInsights(members);
    expect(insights.some((i) => i.title.includes('بهترین عملکرد'))).toBe(true);
    expect(insights.some((i) => i.title.includes('معوق'))).toBe(true);
    expect(insights.some((i) => i.title.includes('بار کاری'))).toBe(true);
    expect(insights.some((i) => i.title.includes('پاسخ'))).toBe(true);
    expect(insights.some((i) => i.title.includes('ناراضی'))).toBe(true);
  });
});
