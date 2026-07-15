import { Prisma } from '@prisma/client';

import { sumReceivables } from '@/lib/business/receivables';
import { prisma } from '@/lib/prisma';
import { getStaleLeads } from '@/server/leads/lead.service';

export async function listActivities(
  organizationId: string,
  params: { page?: number; pageSize?: number; type?: string },
) {
  const page = params.page ?? 1;
  const pageSize = params.pageSize ?? 30;

  const [items, total] = await Promise.all([
    prisma.activityLog.findMany({
      where: {
        organizationId,
        ...(params.type
          ? { type: params.type as Prisma.EnumActivityTypeFilter['equals'] }
          : {}),
      },
      orderBy: { createdAt: 'desc' },
      skip: (page - 1) * pageSize,
      take: pageSize,
      include: {
        user: true,
        customer: true,
        lead: true,
        invoice: true,
      },
    }),
    prisma.activityLog.count({
      where: {
        organizationId,
        ...(params.type
          ? { type: params.type as Prisma.EnumActivityTypeFilter['equals'] }
          : {}),
      },
    }),
  ]);

  return { items, total, page, pageSize, totalPages: Math.ceil(total / pageSize) };
}

export async function listAutomationRules(organizationId: string) {
  return prisma.automationRule.findMany({
    where: { organizationId },
    orderBy: { createdAt: 'desc' },
  });
}

export async function createAutomationRule(
  organizationId: string,
  data: {
    name: string;
    description?: string;
    trigger: Parameters<typeof prisma.automationRule.create>[0]['data']['trigger'];
    action: Parameters<typeof prisma.automationRule.create>[0]['data']['action'];
    conditions?: Record<string, unknown>;
    config?: Record<string, unknown>;
  },
) {
  return prisma.automationRule.create({
    data: {
      organizationId,
      name: data.name,
      description: data.description,
      trigger: data.trigger,
      action: data.action,
      conditions: (data.conditions ?? {}) as Prisma.InputJsonValue,
      config: (data.config ?? {}) as Prisma.InputJsonValue,
    },
  });
}

export async function toggleAutomationRule(
  organizationId: string,
  id: string,
  isActive: boolean,
) {
  const result = await prisma.automationRule.updateMany({
    where: { id, organizationId },
    data: { isActive },
  });
  if (result.count === 0) return null;
  return prisma.automationRule.findFirst({ where: { id, organizationId } });
}

export async function getReportsOverview(organizationId: string) {
  const startOfMonth = new Date();
  startOfMonth.setDate(1);
  startOfMonth.setHours(0, 0, 0, 0);

  const startOfDay = new Date();
  startOfDay.setHours(0, 0, 0, 0);

  const endOfDay = new Date();
  endOfDay.setHours(23, 59, 59, 999);

  const [
    totalCustomers,
    activeLeads,
    monthlyPaymentsAgg,
    unpaidInvoicesAgg,
    overdueReceivablesAgg,
    tasksDueToday,
    tasksCompletedThisMonth,
    invoiceByStatus,
    topCustomers,
    staleLeads,
  ] = await Promise.all([
    prisma.customer.count({ where: { organizationId, isActive: true } }),
    prisma.lead.count({
      where: { organizationId, status: { notIn: ['WON', 'LOST'] } },
    }),
    prisma.payment.aggregate({
      where: {
        organizationId,
        status: 'COMPLETED',
        paidAt: { gte: startOfMonth },
      },
      _sum: { amount: true },
      _count: true,
    }),
    prisma.invoice.aggregate({
      where: {
        organizationId,
        status: { in: ['SENT', 'PARTIAL', 'OVERDUE'] },
      },
      _sum: { total: true, paidAmount: true },
      _count: true,
    }),
    prisma.invoice.findMany({
      where: {
        organizationId,
        status: { in: ['SENT', 'PARTIAL', 'OVERDUE'] },
        dueDate: { lt: new Date() },
      },
      select: { total: true, paidAmount: true },
    }),
    prisma.task.count({
      where: {
        organizationId,
        status: { in: ['TODO', 'IN_PROGRESS'] },
        dueDate: { gte: startOfDay, lte: endOfDay },
      },
    }),
    prisma.task.count({
      where: {
        organizationId,
        status: 'DONE',
        completedAt: { gte: startOfMonth },
      },
    }),
    prisma.invoice.groupBy({
      by: ['status'],
      where: { organizationId },
      _count: true,
      _sum: { total: true },
    }),
    prisma.invoice.groupBy({
      by: ['customerId'],
      where: {
        organizationId,
        issueDate: { gte: startOfMonth },
      },
      _sum: { total: true },
      orderBy: { _sum: { total: 'desc' } },
      take: 5,
    }),
    getStaleLeads(organizationId, 7),
  ]);

  const customerIds = topCustomers.map((c) => c.customerId);
  const customers = await prisma.customer.findMany({
    where: { id: { in: customerIds } },
    select: { id: true, name: true },
  });
  const customerMap = Object.fromEntries(customers.map((c) => [c.id, c.name]));

  const overdueReceivables = sumReceivables(
    overdueReceivablesAgg.map((inv) => ({
      total: Number(inv.total),
      paidAmount: Number(inv.paidAmount),
    })),
  );

  const unpaidTotal =
    Number(unpaidInvoicesAgg._sum.total ?? 0) -
    Number(unpaidInvoicesAgg._sum.paidAmount ?? 0);

  return {
    totalCustomers,
    activeLeads,
    monthlyPaymentTotal: Number(monthlyPaymentsAgg._sum.amount ?? 0),
    monthlyPaymentCount: monthlyPaymentsAgg._count,
    unpaidInvoiceCount: unpaidInvoicesAgg._count,
    unpaidInvoiceTotal: unpaidTotal,
    overdueReceivables,
    tasksDueToday,
    tasksCompletedThisMonth,
    staleLeadCount: staleLeads.length,
    invoiceByStatus,
    topCustomers: topCustomers.map((c) => ({
      customerId: c.customerId,
      customerName: customerMap[c.customerId] ?? '—',
      total: Number(c._sum.total ?? 0),
    })),
  };
}

export { listFileAttachments } from '@/server/files/file.service';
