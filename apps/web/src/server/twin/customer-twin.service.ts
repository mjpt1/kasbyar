import { prisma } from '@/lib/prisma';
import { getLatestHealthScores } from '@/server/health/health-score.service';
import { buildOperationalContext } from '@/server/intelligence/operational-context';
import { getLatestForecastsByType } from '@/server/forecast/forecast.service';
import { getSentimentSummary } from '@/server/sentiment/sentiment.service';

export async function getCustomerTwin(organizationId: string, customerId: string) {
  const customer = await prisma.customer.findFirst({
    where: { id: customerId, organizationId, deletedAt: null },
    include: {
      invoices: { orderBy: { createdAt: 'desc' }, take: 10 },
      payments: { orderBy: { paidAt: 'desc' }, take: 10 },
      leads: { take: 5 },
      tasks: { orderBy: { createdAt: 'desc' }, take: 10 },
      messageThreads: {
        include: { messages: { take: 5, orderBy: { sentAt: 'desc' } } },
        take: 5,
      },
      customerSentiments: { orderBy: { createdAt: 'desc' }, take: 5 },
      activities: { orderBy: { createdAt: 'desc' }, take: 20 },
    },
  });

  if (!customer) return null;

  const memoryDocs = await prisma.memoryDocument.findMany({
    where: {
      organizationId,
      OR: [
        { sourceType: 'NOTE', sourceId: customerId },
        { metadata: { path: ['customerId'], equals: customerId } },
      ],
    },
    take: 10,
    orderBy: { createdAt: 'desc' },
  });

  const overdue = customer.invoices.filter((i) =>
    ['OVERDUE', 'PARTIAL', 'SENT'].includes(i.status),
  );
  const paidTotal = customer.payments.reduce((s, p) => s + Number(p.amount), 0);
  const lastSentiment = customer.customerSentiments[0];
  const healthScore = Math.max(
    5,
    Math.min(
      100,
      70 -
        overdue.length * 12 +
        (lastSentiment?.score ?? 0) * 20 -
        (lastSentiment?.churnRisk ?? 0) * 30,
    ),
  );

  return {
    customer,
    memoryDocs,
    insights: {
      healthScore: Math.round(healthScore),
      paidTotal,
      openInvoiceCount: overdue.length,
      nextBestActions: [
        overdue.length > 0 ? 'پیگیری مطالبات باز' : null,
        (lastSentiment?.churnRisk ?? 0) > 0.4 ? 'تماس حفظ مشتری' : null,
        customer.tasks.some((t) => t.status !== 'DONE') ? 'بستن وظایف باز مشتری' : null,
        'ثبت یادداشت در حافظه کسب‌وکار',
      ].filter(Boolean) as string[],
    },
  };
}

export async function getCompanyTwin(organizationId: string) {
  const [
    org,
    context,
    healthScores,
    forecasts,
    sentiment,
    customers,
    products,
    tasks,
    recentEvents,
  ] = await Promise.all([
    prisma.organization.findUnique({
      where: { id: organizationId },
      select: { id: true, name: true, industryPack: true },
    }),
    buildOperationalContext(organizationId),
    getLatestHealthScores(organizationId),
    getLatestForecastsByType(organizationId),
    getSentimentSummary(organizationId),
    prisma.customer.count({ where: { organizationId, deletedAt: null } }),
    prisma.product.count({ where: { organizationId } }),
    prisma.task.groupBy({
      by: ['status'],
      where: { organizationId },
      _count: true,
    }),
    prisma.domainEvent.findMany({
      where: { organizationId },
      orderBy: { occurredAt: 'desc' },
      take: 15,
    }),
  ]);

  const overallHealth =
    healthScores.length > 0
      ? Math.round(healthScores.reduce((s, h) => s + h.score, 0) / healthScores.length)
      : 50;

  return {
    organization: org,
    overallHealth,
    dimensions: healthScores,
    finance: {
      todaySales: context.today_sales,
      weekSales: context.week_sales,
      monthSales: context.month_sales,
      overdueReceivables: context.overdue_receivables,
      overdueInvoiceCount: context.overdue_invoice_count,
      cashRunwayDays: forecasts.cashRunway?.value ?? null,
      revenueForecast: forecasts.revenue?.value ?? null,
    },
    sales: {
      activeLeads: context.active_leads,
      staleLeads: context.stale_lead_count,
      topStaleLeads: context.top_stale_leads,
      weekSalesChangePct: context.week_sales_change_pct,
    },
    operations: {
      pendingTasks: context.pending_tasks,
      tasksDueToday: context.tasks_due_today,
      taskBreakdown: tasks,
      productCount: products,
      stockoutRisks: forecasts.stockouts,
    },
    customers: {
      count: customers,
      churnRisks: forecasts.churnRisks,
      sentiment,
    },
    recentEvents,
    generatedAt: new Date().toISOString(),
  };
}

export async function listTwinCustomers(organizationId: string) {
  return prisma.customer.findMany({
    where: { organizationId, deletedAt: null },
    select: { id: true, name: true, company: true, phone: true },
    orderBy: { updatedAt: 'desc' },
    take: 50,
  });
}
