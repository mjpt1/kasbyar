import type { IndustryPack, Prisma } from '@prisma/client';

import { prisma } from '@/lib/prisma';

export async function listPackWorkItems(
  organizationId: string,
  pack: IndustryPack,
  params: { status?: string; page?: number; pageSize?: number } = {},
) {
  const page = params.page ?? 1;
  const pageSize = params.pageSize ?? 20;
  const where: Prisma.PackWorkItemWhereInput = {
    organizationId,
    pack,
    ...(params.status
      ? { status: params.status as Prisma.EnumProjectJobStatusFilter['equals'] }
      : {}),
  };

  const [items, total] = await Promise.all([
    prisma.packWorkItem.findMany({
      where,
      orderBy: { createdAt: 'desc' },
      skip: (page - 1) * pageSize,
      take: pageSize,
      include: { customer: { select: { id: true, name: true, phone: true } } },
    }),
    prisma.packWorkItem.count({ where }),
  ]);

  return { items, total, page, pageSize, totalPages: Math.ceil(total / pageSize) };
}

export async function createPackWorkItem(
  organizationId: string,
  pack: IndustryPack,
  data: {
    customerId: string;
    title: string;
    status?: Prisma.PackWorkItemCreateInput['status'];
    scheduledAt?: Date;
    dueAt?: Date;
    amount?: number;
    location?: string;
    notes?: string;
    meta?: Prisma.InputJsonValue;
  },
) {
  return prisma.packWorkItem.create({
    data: {
      organizationId,
      pack,
      customerId: data.customerId,
      title: data.title,
      status: data.status ?? 'PLANNED',
      scheduledAt: data.scheduledAt,
      dueAt: data.dueAt,
      amount: data.amount,
      location: data.location,
      notes: data.notes,
      meta: data.meta ?? {},
    },
    include: { customer: { select: { id: true, name: true, phone: true } } },
  });
}

export async function listOpenPackWorkItems(organizationId: string, pack: IndustryPack) {
  return prisma.packWorkItem.findMany({
    where: {
      organizationId,
      pack,
      status: { notIn: ['DONE', 'CANCELLED'] },
    },
    orderBy: [{ dueAt: 'asc' }, { createdAt: 'desc' }],
    take: 10,
    include: { customer: { select: { id: true, name: true } } },
  });
}

export async function getPackWorkItemDashboardSignals(
  organizationId: string,
  pack: IndustryPack,
) {
  const now = new Date();
  const weekLater = new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000);

  const [activeCount, plannedCount, dueSoonCount] = await Promise.all([
    prisma.packWorkItem.count({
      where: { organizationId, pack, status: 'ACTIVE' },
    }),
    prisma.packWorkItem.count({
      where: { organizationId, pack, status: 'PLANNED' },
    }),
    prisma.packWorkItem.count({
      where: {
        organizationId,
        pack,
        status: { notIn: ['DONE', 'CANCELLED'] },
        dueAt: { gte: now, lte: weekLater },
      },
    }),
  ]);

  return { activeCount, plannedCount, dueSoonCount };
}
