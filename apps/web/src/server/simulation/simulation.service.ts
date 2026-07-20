import { prisma } from '@/lib/prisma';
import { buildOperationalContext } from '@/server/intelligence/operational-context';

export async function runSimulation(
  organizationId: string,
  scenario: string,
  variables: Record<string, number>,
) {
  const run = await prisma.simulationRun.create({
    data: {
      organizationId,
      scenario,
      variables,
      status: 'RUNNING',
    },
  });

  try {
    const ctx = await buildOperationalContext(organizationId);
    const priceChange = variables.priceChangePct ?? 0;
    const headcount = variables.headcountDelta ?? 0;
    const adSpendChange = variables.adSpendChangePct ?? 0;

    const baseWeekly = Math.max(ctx.week_sales ?? ctx.today_sales * 7, 1);
    const baseMonthly = Math.max(ctx.month_sales ?? baseWeekly * 4, baseWeekly * 4);

    // Soften elasticity with open demand (leads) — more leads → less price sensitivity
    const demandBuffer = Math.min(0.4, (ctx.active_leads ?? 0) / 100);
    const elasticity = -1.2 + demandBuffer;
    const priceFactor = 1 + (priceChange * elasticity) / 100;
    const volumeFactor = Math.max(0.4, priceFactor);
    const revenueAfterPrice = baseWeekly * volumeFactor * (1 + priceChange / 100);

    // Ad ROI declines if receivables pressure is high (cash constrained campaigns)
    const cashStress = ctx.overdue_invoice_count > 3 ? 0.35 : 0.6;
    const adImpact = baseWeekly * (adSpendChange / 100) * cashStress;

    const avgSalary = 25_000_000;
    const supportLoad = Math.max(1, ctx.pending_tasks / 15);
    const headcountProductivity = headcount * (baseWeekly * 0.08) * Math.min(1.2, supportLoad);
    const headcountCost = headcount * avgSalary;

    const projectedWeeklyRevenue = Math.round(revenueAfterPrice + adImpact + headcountProductivity);
    const projectedMonthlyRevenue = Math.round(projectedWeeklyRevenue * 4.3);
    const revenueChangePct =
      ((projectedWeeklyRevenue - baseWeekly) / Math.max(baseWeekly, 1)) * 100;
    const netMonthly =
      projectedMonthlyRevenue - baseMonthly - headcountCost - Math.abs(adSpendChange) * (baseMonthly * 0.01);

    const results = {
      projectedWeeklyRevenue,
      projectedMonthlyRevenue,
      revenueChangePct: Number(revenueChangePct.toFixed(1)),
      additionalMonthlyCost: headcountCost,
      estimatedNetMonthlyDelta: Math.round(netMonthly - (baseMonthly - headcountCost)),
      breakEvenWeeks:
        headcountCost > 0 && headcountProductivity > 0
          ? Math.ceil(headcountCost / Math.max(headcountProductivity * 4.3, 1))
          : null,
      confidenceBand: {
        low: Math.round(projectedWeeklyRevenue * 0.85),
        high: Math.round(projectedWeeklyRevenue * 1.12),
      },
      assumptions: {
        priceElasticity: Number(elasticity.toFixed(2)),
        adRoi: cashStress,
        avgHeadcountCost: avgSalary,
        baseWeekly,
        baseMonthly,
        scenario,
      },
    };

    return prisma.simulationRun.update({
      where: { id: run.id },
      data: {
        results,
        status: 'COMPLETED',
        completedAt: new Date(),
      },
    });
  } catch (error) {
    await prisma.simulationRun.update({
      where: { id: run.id },
      data: { status: 'FAILED', results: { error: String(error) } },
    });
    throw error;
  }
}

export async function listSimulations(organizationId: string) {
  return prisma.simulationRun.findMany({
    where: { organizationId },
    orderBy: { createdAt: 'desc' },
    take: 20,
  });
}
