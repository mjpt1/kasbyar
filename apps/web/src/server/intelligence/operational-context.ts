import type { OperationalContextSnapshot } from '@kesbyar/shared/ai';

import { sumReceivables } from '@/lib/business/receivables';
import { startOfDay, endOfDay } from '@/lib/business/tasks';
import { prisma } from '@/lib/prisma';
import { getStaleLeads } from '@/server/leads/lead.service';

export async function buildOperationalContext(
  organizationId: string,
): Promise<OperationalContextSnapshot> {
  const dayStart = startOfDay(new Date());
  const dayEnd = endOfDay(new Date());

  const [
    todayPayments,
    openInvoices,
    overdueInvoices,
    activeLeads,
    pendingTasks,
    tasksDueToday,
    staleLeads,
    overdueWithCustomer,
    tasksDueTodayRows,
  ] = await Promise.all([
    prisma.payment.aggregate({
      where: {
        organizationId,
        status: 'COMPLETED',
        paidAt: { gte: dayStart },
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
      select: { total: true, paidAmount: true, customer: { select: { name: true } } },
      orderBy: { dueDate: 'asc' },
      take: 10,
    }),
    prisma.lead.count({
      where: { organizationId, status: { notIn: ['WON', 'LOST'] } },
    }),
    prisma.task.count({
      where: { organizationId, status: { in: ['TODO', 'IN_PROGRESS'] } },
    }),
    prisma.task.count({
      where: {
        organizationId,
        status: { in: ['TODO', 'IN_PROGRESS'] },
        dueDate: { gte: dayStart, lte: dayEnd },
      },
    }),
    getStaleLeads(organizationId, 7),
    prisma.invoice.findMany({
      where: {
        organizationId,
        status: { in: ['SENT', 'PARTIAL', 'OVERDUE'] },
        dueDate: { lt: new Date() },
      },
      include: { customer: true },
      orderBy: { dueDate: 'asc' },
      take: 5,
    }),
    prisma.task.findMany({
      where: {
        organizationId,
        status: { in: ['TODO', 'IN_PROGRESS'] },
        dueDate: { gte: dayStart, lte: dayEnd },
      },
      orderBy: { dueDate: 'asc' },
      take: 5,
      select: { title: true },
    }),
  ]);

  const overdueReceivables = sumReceivables(
    overdueInvoices.map((inv) => ({
      total: Number(inv.total),
      paidAmount: Number(inv.paidAmount),
    })),
  );

  return {
    today_sales: Number(todayPayments._sum.amount ?? 0),
    open_invoices: openInvoices,
    overdue_receivables: overdueReceivables,
    active_leads: activeLeads,
    pending_tasks: pendingTasks,
    tasks_due_today: tasksDueToday,
    stale_lead_count: staleLeads.length,
    overdue_invoice_count: overdueWithCustomer.length,
    top_overdue_customers: overdueWithCustomer.map((i) => i.customer.name),
    top_stale_leads: staleLeads.slice(0, 5).map((l) => l.title),
    tasks_due_today_titles: tasksDueTodayRows.map((t) => t.title),
  };
}
