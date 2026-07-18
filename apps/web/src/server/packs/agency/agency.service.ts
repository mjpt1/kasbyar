import type { Prisma } from '@prisma/client';

import { prisma } from '@/lib/prisma';

export async function listMarketingCampaigns(
  organizationId: string,
  params: { status?: string; page?: number; pageSize?: number },
) {
  const page = params.page ?? 1;
  const pageSize = params.pageSize ?? 20;
  const where: Prisma.MarketingCampaignWhereInput = {
    organizationId,
    ...(params.status
      ? { status: params.status as Prisma.EnumProjectJobStatusFilter['equals'] }
      : {}),
  };

  const [items, total] = await Promise.all([
    prisma.marketingCampaign.findMany({
      where,
      orderBy: { createdAt: 'desc' },
      skip: (page - 1) * pageSize,
      take: pageSize,
      include: { customer: { select: { id: true, name: true, phone: true } } },
    }),
    prisma.marketingCampaign.count({ where }),
  ]);

  return { items, total, page, pageSize, totalPages: Math.ceil(total / pageSize) };
}

export async function createMarketingCampaign(
  organizationId: string,
  data: Omit<Prisma.MarketingCampaignUncheckedCreateInput, 'organizationId'>,
) {
  return prisma.marketingCampaign.create({
    data: { ...data, organizationId },
    include: { customer: { select: { id: true, name: true, phone: true } } },
  });
}

export async function listOpenMarketingCampaigns(organizationId: string) {
  return prisma.marketingCampaign.findMany({
    where: {
      organizationId,
      status: { notIn: ['DONE', 'CANCELLED'] },
    },
    orderBy: { createdAt: 'desc' },
    take: 10,
    include: { customer: { select: { id: true, name: true } } },
  });
}

export async function getAgencyDashboardSignals(organizationId: string) {
  const [activeCount, plannedCount, onHoldCount] = await Promise.all([
    prisma.marketingCampaign.count({
      where: { organizationId, status: 'ACTIVE' },
    }),
    prisma.marketingCampaign.count({
      where: { organizationId, status: 'PLANNED' },
    }),
    prisma.marketingCampaign.count({
      where: { organizationId, status: 'ON_HOLD' },
    }),
  ]);

  return { activeCount, plannedCount, onHoldCount };
}
