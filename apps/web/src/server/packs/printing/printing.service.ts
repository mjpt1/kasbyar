import type { Prisma } from '@prisma/client';

import { prisma } from '@/lib/prisma';

export async function listPrintOrders(
  organizationId: string,
  params: { status?: string; page?: number; pageSize?: number },
) {
  const page = params.page ?? 1;
  const pageSize = params.pageSize ?? 20;
  const where: Prisma.PrintOrderWhereInput = {
    organizationId,
    ...(params.status
      ? { status: params.status as Prisma.EnumProjectJobStatusFilter['equals'] }
      : {}),
  };

  const [items, total] = await Promise.all([
    prisma.printOrder.findMany({
      where,
      orderBy: { createdAt: 'desc' },
      skip: (page - 1) * pageSize,
      take: pageSize,
      include: { customer: { select: { id: true, name: true, phone: true } } },
    }),
    prisma.printOrder.count({ where }),
  ]);

  return { items, total, page, pageSize, totalPages: Math.ceil(total / pageSize) };
}

export async function createPrintOrder(
  organizationId: string,
  data: Omit<Prisma.PrintOrderUncheckedCreateInput, 'organizationId'>,
) {
  return prisma.printOrder.create({
    data: { ...data, organizationId },
    include: { customer: { select: { id: true, name: true, phone: true } } },
  });
}

export async function listOpenPrintOrders(organizationId: string) {
  return prisma.printOrder.findMany({
    where: {
      organizationId,
      status: { notIn: ['DONE', 'CANCELLED'] },
    },
    orderBy: { dueAt: 'asc' },
    take: 10,
    include: { customer: { select: { id: true, name: true } } },
  });
}

export async function getPrintingDashboardSignals(organizationId: string) {
  const now = new Date();
  const weekLater = new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000);

  const [activeCount, plannedCount, dueSoonCount] = await Promise.all([
    prisma.printOrder.count({
      where: { organizationId, status: 'ACTIVE' },
    }),
    prisma.printOrder.count({
      where: { organizationId, status: 'PLANNED' },
    }),
    prisma.printOrder.count({
      where: {
        organizationId,
        status: { notIn: ['DONE', 'CANCELLED'] },
        dueAt: { gte: now, lte: weekLater },
      },
    }),
  ]);

  return { activeCount, plannedCount, dueSoonCount };
}
