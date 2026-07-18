import type { Prisma } from '@prisma/client';

import { prisma } from '@/lib/prisma';

function startOfToday() {
  const d = new Date();
  d.setHours(0, 0, 0, 0);
  return d;
}

export async function listFoodOrders(
  organizationId: string,
  params: { status?: string; page?: number; pageSize?: number },
) {
  const page = params.page ?? 1;
  const pageSize = params.pageSize ?? 20;
  const where: Prisma.FoodOrderWhereInput = {
    organizationId,
    ...(params.status
      ? { status: params.status as Prisma.EnumFoodOrderStatusFilter['equals'] }
      : {}),
  };

  const [items, total] = await Promise.all([
    prisma.foodOrder.findMany({
      where,
      orderBy: { orderedAt: 'desc' },
      skip: (page - 1) * pageSize,
      take: pageSize,
      include: { customer: { select: { id: true, name: true, phone: true } } },
    }),
    prisma.foodOrder.count({ where }),
  ]);

  return { items, total, page, pageSize, totalPages: Math.ceil(total / pageSize) };
}

export async function createFoodOrder(
  organizationId: string,
  data: Omit<Prisma.FoodOrderUncheckedCreateInput, 'organizationId'>,
) {
  return prisma.foodOrder.create({
    data: { ...data, organizationId },
    include: { customer: { select: { id: true, name: true, phone: true } } },
  });
}

export async function listMenuItems(
  organizationId: string,
  params: { page?: number; pageSize?: number; availableOnly?: boolean },
) {
  const page = params.page ?? 1;
  const pageSize = params.pageSize ?? 20;
  const where: Prisma.MenuItemWhereInput = {
    organizationId,
    ...(params.availableOnly ? { isAvailable: true } : {}),
  };

  const [items, total] = await Promise.all([
    prisma.menuItem.findMany({
      where,
      orderBy: { name: 'asc' },
      skip: (page - 1) * pageSize,
      take: pageSize,
    }),
    prisma.menuItem.count({ where }),
  ]);

  return { items, total, page, pageSize, totalPages: Math.ceil(total / pageSize) };
}

export async function createMenuItem(
  organizationId: string,
  data: Omit<Prisma.MenuItemUncheckedCreateInput, 'organizationId'>,
) {
  return prisma.menuItem.create({ data: { ...data, organizationId } });
}

export async function listRecentFoodOrders(organizationId: string) {
  return prisma.foodOrder.findMany({
    where: { organizationId },
    orderBy: { orderedAt: 'desc' },
    take: 10,
    include: { customer: { select: { id: true, name: true } } },
  });
}

export async function getFoodDashboardSignals(organizationId: string) {
  const [openCount, todayCount, menuCount] = await Promise.all([
    prisma.foodOrder.count({
      where: { organizationId, status: { in: ['OPEN', 'PREPARING'] } },
    }),
    prisma.foodOrder.count({
      where: { organizationId, orderedAt: { gte: startOfToday() } },
    }),
    prisma.menuItem.count({
      where: { organizationId, isAvailable: true },
    }),
  ]);

  return { openCount, todayCount, menuCount };
}
