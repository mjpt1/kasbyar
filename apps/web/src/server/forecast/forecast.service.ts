import { prisma } from '@/lib/prisma';
import { publishDomainEvent } from '@/server/events/domain-event.service';

export async function computeForecasts(organizationId: string) {
  const now = new Date();
  const monthAgo = new Date(now);
  monthAgo.setDate(monthAgo.getDate() - 30);
  const twoMonthsAgo = new Date(now);
  twoMonthsAgo.setDate(twoMonthsAgo.getDate() - 60);
  const weekAgo = new Date(now);
  weekAgo.setDate(weekAgo.getDate() - 7);

  const [
    paymentsMonth,
    paymentsPrevMonth,
    openPayables,
    products,
    customers,
    stockMovements,
    weekPayments,
  ] = await Promise.all([
    prisma.payment.aggregate({
      where: { organizationId, status: 'COMPLETED', paidAt: { gte: monthAgo } },
      _sum: { amount: true },
    }),
    prisma.payment.aggregate({
      where: {
        organizationId,
        status: 'COMPLETED',
        paidAt: { gte: twoMonthsAgo, lt: monthAgo },
      },
      _sum: { amount: true },
    }),
    prisma.invoice.aggregate({
      where: { organizationId, status: { in: ['SENT', 'PARTIAL', 'OVERDUE'] } },
      _sum: { total: true, paidAmount: true },
    }),
    prisma.product.findMany({
      where: { organizationId },
      take: 100,
    }),
    prisma.customer.findMany({
      where: { organizationId, deletedAt: null },
      include: {
        invoices: { where: { status: { in: ['OVERDUE', 'PARTIAL'] } }, take: 5 },
        customerSentiments: { orderBy: { createdAt: 'desc' }, take: 1 },
        payments: { orderBy: { paidAt: 'desc' }, take: 1 },
      },
      take: 80,
    }),
    prisma.stockMovement.findMany({
      where: { organizationId, createdAt: { gte: monthAgo }, type: 'OUT' },
      take: 500,
    }),
    prisma.payment.aggregate({
      where: { organizationId, status: 'COMPLETED', paidAt: { gte: weekAgo } },
      _sum: { amount: true },
    }),
  ]);

  const monthlyCash = Number(paymentsMonth._sum.amount ?? 0);
  const prevMonthlyCash = Number(paymentsPrevMonth._sum.amount ?? 0);
  const weeklyCash = Number(weekPayments._sum.amount ?? 0);
  const receivablesOpen =
    Number(openPayables._sum.total ?? 0) - Number(openPayables._sum.paidAmount ?? 0);

  // Burn ≈ outflow proxy: if cash declined, use decline; else use 40% of inflow as operating burn
  const cashDecline = Math.max(0, prevMonthlyCash - monthlyCash);
  const estimatedBurn = cashDecline > 0 ? cashDecline : monthlyCash * 0.4;
  const dailyBurn = estimatedBurn > 0 ? estimatedBurn / 30 : weeklyCash / 7;
  const liquidBuffer = Math.max(monthlyCash * 0.35 + Math.max(0, receivablesOpen) * 0.15, weeklyCash);
  const cashRunwayDays =
    dailyBurn > 0 ? Math.round(liquidBuffer / dailyBurn) : monthlyCash > 0 ? 90 : 14;

  const revenueGrowth =
    prevMonthlyCash > 0 ? ((monthlyCash - prevMonthlyCash) / prevMonthlyCash) * 100 : 0;
  const projectedRevenue30 = Math.round(monthlyCash * (1 + Math.max(-0.2, Math.min(0.3, revenueGrowth / 100))));

  const outflowByProduct = new Map<string, number>();
  for (const m of stockMovements) {
    const qty = Number(m.quantity ?? 0);
    outflowByProduct.set(m.productId, (outflowByProduct.get(m.productId) ?? 0) + qty);
  }

  const snapshots = [];

  snapshots.push(
    await prisma.forecastSnapshot.create({
      data: {
        organizationId,
        forecastType: 'CASH_RUNWAY',
        value: cashRunwayDays,
        confidence: monthlyCash > 0 ? 0.78 : 0.45,
        horizonDays: 90,
        factors: {
          monthlyCash,
          prevMonthlyCash,
          weeklyCash,
          dailyBurn: Math.round(dailyBurn),
          liquidBuffer: Math.round(liquidBuffer),
          receivablesOpen: Math.round(receivablesOpen),
        },
      },
    }),
  );

  snapshots.push(
    await prisma.forecastSnapshot.create({
      data: {
        organizationId,
        forecastType: 'REVENUE',
        value: projectedRevenue30,
        confidence: prevMonthlyCash > 0 ? 0.72 : 0.5,
        horizonDays: 30,
        factors: {
          monthlyCash,
          prevMonthlyCash,
          revenueGrowthPct: Number(revenueGrowth.toFixed(1)),
        },
      },
    }),
  );

  const lowStock = products.filter((p) => {
    const stock = Number(p.stockQty);
    const reorder = p.reorderLevel != null ? Number(p.reorderLevel) : 10;
    return stock <= reorder;
  });

  for (const product of lowStock.slice(0, 15)) {
    const stockQty = Number(product.stockQty);
    const monthlyOut = outflowByProduct.get(product.id) ?? 0;
    const dailyOut = monthlyOut > 0 ? monthlyOut / 30 : stockQty > 0 ? stockQty / 20 : 0.5;
    const daysToStockout = dailyOut > 0 ? Math.round(stockQty / dailyOut) : stockQty <= 0 ? 0 : 60;

    snapshots.push(
      await prisma.forecastSnapshot.create({
        data: {
          organizationId,
          forecastType: 'STOCKOUT',
          entityType: 'Product',
          entityId: product.id,
          value: daysToStockout,
          confidence: monthlyOut > 0 ? 0.85 : 0.55,
          horizonDays: 60,
          factors: {
            name: product.name,
            stockQty,
            monthlyOutflow: monthlyOut,
            reorderLevel: product.reorderLevel != null ? Number(product.reorderLevel) : null,
          },
        },
      }),
    );
  }

  for (const customer of customers) {
    const overdueCount = customer.invoices.length;
    const sentiment = customer.customerSentiments[0];
    const lastPay = customer.payments[0]?.paidAt;
    const daysSincePay = lastPay
      ? Math.floor((now.getTime() - lastPay.getTime()) / (1000 * 60 * 60 * 24))
      : 120;

    const churnRisk = Math.min(
      0.95,
      (overdueCount > 0 ? 0.35 : 0) +
        (overdueCount >= 2 ? 0.15 : 0) +
        (sentiment?.churnRisk ?? (sentiment?.score != null && sentiment.score < 0 ? 0.25 : 0)) +
        (daysSincePay > 60 ? 0.2 : daysSincePay > 30 ? 0.1 : 0),
    );

    if (churnRisk > 0.3) {
      snapshots.push(
        await prisma.forecastSnapshot.create({
          data: {
            organizationId,
            forecastType: 'CHURN_RISK',
            entityType: 'Customer',
            entityId: customer.id,
            value: Math.round(churnRisk * 100),
            confidence: 0.74,
            horizonDays: 30,
            factors: {
              name: customer.name,
              overdueCount,
              daysSincePay,
              sentimentLabel: sentiment?.label ?? null,
            },
          },
        }),
      );
    }
  }

  await publishDomainEvent({
    organizationId,
    eventType: 'FORECAST_GENERATED',
    payload: { count: snapshots.length },
  });

  return snapshots;
}

export async function listForecasts(organizationId: string) {
  return prisma.forecastSnapshot.findMany({
    where: { organizationId },
    orderBy: { computedAt: 'desc' },
    take: 80,
  });
}

export async function getLatestForecastsByType(organizationId: string) {
  const rows = await listForecasts(organizationId);
  const latest = {
    cashRunway: rows.find((r) => r.forecastType === 'CASH_RUNWAY') ?? null,
    revenue: rows.find((r) => r.forecastType === 'REVENUE') ?? null,
    stockouts: rows.filter((r) => r.forecastType === 'STOCKOUT').slice(0, 15),
    churnRisks: rows.filter((r) => r.forecastType === 'CHURN_RISK').slice(0, 15),
  };
  return latest;
}
