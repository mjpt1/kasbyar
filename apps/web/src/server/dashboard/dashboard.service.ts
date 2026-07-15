import type { DashboardStats } from '@kesbyar/shared';

import { sumReceivables } from '@/lib/business/receivables';
import { prisma } from '@/lib/prisma';
import { getOverdueInvoices } from '@/server/invoices/invoice.service';
import { getStaleLeads } from '@/server/leads/lead.service';

export async function getDashboardStats(
  organizationId: string,
): Promise<DashboardStats> {
  const startOfDay = new Date();
  startOfDay.setHours(0, 0, 0, 0);

  const startOfMonth = new Date();
  startOfMonth.setDate(1);
  startOfMonth.setHours(0, 0, 0, 0);

  const [
    todayPayments,
    openInvoices,
    overdueInvoices,
    activeLeads,
    pendingTasks,
    newCustomers,
  ] = await Promise.all([
    prisma.payment.aggregate({
      where: {
        organizationId,
        status: 'COMPLETED',
        paidAt: { gte: startOfDay },
      },
      _sum: { amount: true },
    }),
    prisma.invoice.count({
      where: {
        organizationId,
        status: { in: ['SENT', 'PARTIAL', 'OVERDUE'] },
      },
    }),
    prisma.invoice.findMany({
      where: {
        organizationId,
        status: { in: ['SENT', 'PARTIAL', 'OVERDUE'] },
        dueDate: { lt: new Date() },
      },
      select: { total: true, paidAmount: true },
    }),
    prisma.lead.count({
      where: {
        organizationId,
        status: { notIn: ['WON', 'LOST'] },
      },
    }),
    prisma.task.count({
      where: {
        organizationId,
        status: { in: ['TODO', 'IN_PROGRESS'] },
      },
    }),
    prisma.customer.count({
      where: {
        organizationId,
        createdAt: { gte: startOfMonth },
      },
    }),
  ]);

  const overdueReceivables = sumReceivables(
    overdueInvoices.map((inv) => ({
      total: Number(inv.total),
      paidAmount: Number(inv.paidAmount),
    })),
  );

  return {
    todaySales: Number(todayPayments._sum.amount ?? 0),
    openInvoices,
    overdueReceivables,
    activeLeads,
    pendingTasks,
    newCustomersThisMonth: newCustomers,
  };
}

export async function getDashboardDetails(organizationId: string) {
  const [stats, overdue, staleLeads, recentActivity, upcomingTasks] =
    await Promise.all([
      getDashboardStats(organizationId),
      getOverdueInvoices(organizationId),
      getStaleLeads(organizationId),
      prisma.activityLog.findMany({
        where: { organizationId },
        orderBy: { createdAt: 'desc' },
        take: 10,
        include: { user: true, customer: true },
      }),
      prisma.task.findMany({
        where: {
          organizationId,
          status: { in: ['TODO', 'IN_PROGRESS'] },
          dueDate: { lte: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000) },
        },
        orderBy: { dueDate: 'asc' },
        take: 8,
        include: { assignee: true },
      }),
    ]);

  return { stats, overdue, staleLeads, recentActivity, upcomingTasks };
}

export async function getSalesTrend(organizationId: string, days = 7) {
  const { formatJalali } = await import('@kesbyar/shared');
  const result: { label: string; amount: number }[] = [];

  for (let i = days - 1; i >= 0; i -= 1) {
    const dayStart = new Date();
    dayStart.setDate(dayStart.getDate() - i);
    dayStart.setHours(0, 0, 0, 0);

    const dayEnd = new Date(dayStart);
    dayEnd.setHours(23, 59, 59, 999);

    const aggregate = await prisma.payment.aggregate({
      where: {
        organizationId,
        status: 'COMPLETED',
        paidAt: { gte: dayStart, lte: dayEnd },
      },
      _sum: { amount: true },
    });

    result.push({
      label: formatJalali(dayStart, { persianDigits: true }),
      amount: Number(aggregate._sum.amount ?? 0),
    });
  }

  return result;
}
