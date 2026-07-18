import type { SpecialtyDefinition } from '@kesbyar/shared';
import { getPackDefinition } from '@kesbyar/shared';

import { prisma } from '@/lib/prisma';
import { getDashboardStats } from '@/server/dashboard/dashboard.service';
import { getBasePackDashboardWidgets } from '@/server/packs/pack-dashboard.service';

export interface SpecialtyDashboardWidget {
  key: string;
  title: string;
  value: string | number;
  href?: string;
  variant?: 'default' | 'warning' | 'success';
}

interface SpecialtyMetrics {
  customers: number;
  openInvoices: number;
  activeLeads: number;
  pendingTasks: number;
  packA: number;
  packB: number;
  packC: number;
}

function metricHref(
  metric: SpecialtyDefinition['widgets'][number]['metric'],
  specialty: SpecialtyDefinition,
  packWidgets: Awaited<ReturnType<typeof getBasePackDashboardWidgets>>,
): string | undefined {
  switch (metric) {
    case 'customers':
      return '/customers';
    case 'openInvoices':
      return '/invoices';
    case 'activeLeads':
      return '/leads';
    case 'pendingTasks':
      return '/tasks';
    case 'packA':
    case 'packB':
    case 'packC': {
      const idx = metric === 'packA' ? 0 : metric === 'packB' ? 1 : 2;
      return packWidgets[idx]?.href ?? getPackDefinition(specialty.basePack).homeRoute ?? undefined;
    }
    default:
      return undefined;
  }
}

export async function getSpecialtyDashboardWidgets(
  organizationId: string,
  specialty: SpecialtyDefinition,
): Promise<SpecialtyDashboardWidget[]> {
  const [stats, customerCount, packWidgets] = await Promise.all([
    getDashboardStats(organizationId),
    prisma.customer.count({ where: { organizationId, isActive: true } }),
    getBasePackDashboardWidgets(organizationId, specialty.basePack),
  ]);

  const metrics: SpecialtyMetrics = {
    customers: customerCount,
    openInvoices: stats.openInvoices,
    activeLeads: stats.activeLeads,
    pendingTasks: stats.pendingTasks,
    packA: Number(packWidgets[0]?.value ?? 0),
    packB: Number(packWidgets[1]?.value ?? 0),
    packC: Number(packWidgets[2]?.value ?? 0),
  };

  return specialty.widgets.map((widget) => {
    const value = metrics[widget.metric];
    const variant =
      (widget.metric === 'openInvoices' || widget.metric === 'pendingTasks') && value > 0
        ? ('warning' as const)
        : ('default' as const);

    return {
      key: widget.key,
      title: widget.title,
      value,
      href: metricHref(widget.metric, specialty, packWidgets),
      variant,
    };
  });
}
