import type { Prisma } from '@prisma/client';
import type { HealthDimension } from '@prisma/client';
import type { HealthDimensionName, HealthScore } from '@kesbyar/shared';

import { sumReceivables } from '@/lib/business/receivables';
import { prisma } from '@/lib/prisma';
import { getStaleLeads } from '@/server/leads/lead.service';
import { publishDomainEvent } from '@/server/events/domain-event.service';

function clampScore(value: number): number {
  return Math.max(0, Math.min(100, Math.round(value)));
}

export async function computeHealthScores(organizationId: string): Promise<HealthScore[]> {
  const now = new Date();
  const weekAgo = new Date(now);
  weekAgo.setDate(weekAgo.getDate() - 7);
  const monthAgo = new Date(now);
  monthAgo.setDate(monthAgo.getDate() - 30);

  const [
    overdueInvoices,
    weekPayments,
    prevWeekPayments,
    activeLeads,
    staleLeads,
    pendingTasks,
    overdueTasks,
    newCustomers,
    repeatCustomers,
    openTasks,
  ] = await Promise.all([
    prisma.invoice.findMany({
      where: {
        organizationId,
        status: { in: ['SENT', 'PARTIAL', 'OVERDUE'] },
        dueDate: { lt: now },
      },
      select: { total: true, paidAmount: true },
    }),
    prisma.payment.aggregate({
      where: { organizationId, status: 'COMPLETED', paidAt: { gte: weekAgo } },
      _sum: { amount: true },
    }),
    prisma.payment.aggregate({
      where: {
        organizationId,
        status: 'COMPLETED',
        paidAt: { gte: new Date(weekAgo.getTime() - 7 * 86400000), lt: weekAgo },
      },
      _sum: { amount: true },
    }),
    prisma.lead.count({ where: { organizationId, status: { notIn: ['WON', 'LOST'] } } }),
    getStaleLeads(organizationId, 7),
    prisma.task.count({
      where: { organizationId, status: { in: ['TODO', 'IN_PROGRESS'] } },
    }),
    prisma.task.count({
      where: {
        organizationId,
        status: { in: ['TODO', 'IN_PROGRESS'] },
        dueDate: { lt: now },
      },
    }),
    prisma.customer.count({
      where: { organizationId, createdAt: { gte: monthAgo }, deletedAt: null },
    }),
    prisma.customer.count({
      where: {
        organizationId,
        invoices: { some: {} },
        deletedAt: null,
      },
    }),
    prisma.task.groupBy({
      by: ['assigneeId'],
      where: { organizationId, status: { in: ['TODO', 'IN_PROGRESS'] } },
      _count: true,
    }),
  ]);

  const overdueAmount = sumReceivables(
    overdueInvoices.map((i) => ({
      total: Number(i.total),
      paidAmount: Number(i.paidAmount),
    })),
  );
  const weekSales = Number(weekPayments._sum.amount ?? 0);
  const prevWeekSales = Number(prevWeekPayments._sum.amount ?? 0);
  const salesChange =
    prevWeekSales > 0 ? ((weekSales - prevWeekSales) / prevWeekSales) * 100 : weekSales > 0 ? 20 : 0;

  const financial = clampScore(100 - Math.min(overdueAmount / 1_000_000, 50));
  const sales = clampScore(50 + salesChange);
  const operations = clampScore(
    100 - (pendingTasks > 0 ? (overdueTasks / pendingTasks) * 60 : 0) - staleLeads.length * 3,
  );
  const growth = clampScore(40 + newCustomers * 4 + Math.min(repeatCustomers, 20));
  const maxWorkload = openTasks.reduce((max, row) => Math.max(max, row._count), 0);
  const hr = clampScore(100 - maxWorkload * 8);

  const dimensions: Array<{ dimension: HealthDimension; score: number; factors: Record<string, unknown> }> = [
    { dimension: 'FINANCIAL', score: financial, factors: { overdueAmount, overdueCount: overdueInvoices.length } },
    { dimension: 'SALES', score: sales, factors: { weekSales, salesChangePct: salesChange, activeLeads } },
    { dimension: 'OPERATIONS', score: operations, factors: { pendingTasks, overdueTasks, staleLeads: staleLeads.length } },
    { dimension: 'GROWTH', score: growth, factors: { newCustomers, repeatCustomers } },
    { dimension: 'HR', score: hr, factors: { maxWorkload } },
  ];

  const computedAt = new Date();
  await prisma.healthScoreSnapshot.createMany({
    data: dimensions.map((d) => ({
      organizationId,
      dimension: d.dimension,
      score: d.score,
      factors: d.factors as Prisma.InputJsonValue,
      computedAt,
    })),
  });

  await publishDomainEvent({
    organizationId,
    eventType: 'HEALTH_COMPUTED',
    payload: { scores: dimensions.map((d) => ({ dimension: d.dimension, score: d.score })) },
  });

  return dimensions.map((d) => ({
    dimension: d.dimension as HealthDimensionName,
    score: d.score,
    factors: d.factors,
    computedAt: computedAt.toISOString(),
  }));
}

export async function getLatestHealthScores(organizationId: string): Promise<HealthScore[]> {
  const dimensions: HealthDimension[] = ['FINANCIAL', 'SALES', 'OPERATIONS', 'GROWTH', 'HR'];
  const results: HealthScore[] = [];

  for (const dimension of dimensions) {
    const snap = await prisma.healthScoreSnapshot.findFirst({
      where: { organizationId, dimension },
      orderBy: { computedAt: 'desc' },
    });
    if (snap) {
      results.push({
        dimension: snap.dimension as HealthDimensionName,
        score: snap.score,
        factors: snap.factors as Record<string, unknown>,
        computedAt: snap.computedAt.toISOString(),
      });
    }
  }

  if (results.length === 0) {
    return computeHealthScores(organizationId);
  }

  return results;
}

export async function getHealthScoreTrend(
  organizationId: string,
  dimension: HealthDimension,
  days = 7,
): Promise<HealthScore[]> {
  const since = new Date();
  since.setDate(since.getDate() - days);

  const snaps = await prisma.healthScoreSnapshot.findMany({
    where: { organizationId, dimension, computedAt: { gte: since } },
    orderBy: { computedAt: 'asc' },
  });

  return snaps.map((s) => ({
    dimension: s.dimension as HealthDimensionName,
    score: s.score,
    factors: s.factors as Record<string, unknown>,
    computedAt: s.computedAt.toISOString(),
  }));
}
