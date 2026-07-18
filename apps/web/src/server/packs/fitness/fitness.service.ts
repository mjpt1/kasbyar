import type { Prisma } from '@prisma/client';

import { prisma } from '@/lib/prisma';

export async function listGymMemberships(
  organizationId: string,
  params: { status?: string; page?: number; pageSize?: number },
) {
  const page = params.page ?? 1;
  const pageSize = params.pageSize ?? 20;
  const where: Prisma.GymMembershipWhereInput = {
    organizationId,
    ...(params.status
      ? { status: params.status as Prisma.EnumMembershipStatusFilter['equals'] }
      : {}),
  };

  const [items, total] = await Promise.all([
    prisma.gymMembership.findMany({
      where,
      orderBy: { endsAt: 'asc' },
      skip: (page - 1) * pageSize,
      take: pageSize,
      include: { customer: { select: { id: true, name: true, phone: true } } },
    }),
    prisma.gymMembership.count({ where }),
  ]);

  return { items, total, page, pageSize, totalPages: Math.ceil(total / pageSize) };
}

export async function createGymMembership(
  organizationId: string,
  data: Omit<Prisma.GymMembershipUncheckedCreateInput, 'organizationId'>,
) {
  return prisma.gymMembership.create({
    data: { ...data, organizationId },
    include: { customer: { select: { id: true, name: true, phone: true } } },
  });
}

export async function listGymClasses(
  organizationId: string,
  params: { page?: number; pageSize?: number },
) {
  const page = params.page ?? 1;
  const pageSize = params.pageSize ?? 20;

  const [items, total] = await Promise.all([
    prisma.gymClass.findMany({
      where: { organizationId },
      orderBy: { scheduledAt: 'asc' },
      skip: (page - 1) * pageSize,
      take: pageSize,
    }),
    prisma.gymClass.count({ where: { organizationId } }),
  ]);

  return { items, total, page, pageSize, totalPages: Math.ceil(total / pageSize) };
}

export async function createGymClass(
  organizationId: string,
  data: Omit<Prisma.GymClassUncheckedCreateInput, 'organizationId'>,
) {
  return prisma.gymClass.create({ data: { ...data, organizationId } });
}

export async function listUpcomingGymClasses(organizationId: string) {
  const in7Days = new Date();
  in7Days.setDate(in7Days.getDate() + 7);

  return prisma.gymClass.findMany({
    where: {
      organizationId,
      scheduledAt: { gte: new Date(), lte: in7Days },
    },
    orderBy: { scheduledAt: 'asc' },
    take: 10,
  });
}

export async function getFitnessDashboardSignals(organizationId: string) {
  const in30Days = new Date();
  in30Days.setDate(in30Days.getDate() + 30);
  const in7Days = new Date();
  in7Days.setDate(in7Days.getDate() + 7);

  const [activeCount, expiringCount, upcomingClassCount] = await Promise.all([
    prisma.gymMembership.count({
      where: { organizationId, status: 'ACTIVE' },
    }),
    prisma.gymMembership.count({
      where: {
        organizationId,
        status: 'ACTIVE',
        endsAt: { gte: new Date(), lte: in30Days },
      },
    }),
    prisma.gymClass.count({
      where: {
        organizationId,
        scheduledAt: { gte: new Date(), lte: in7Days },
      },
    }),
  ]);

  return { activeCount, expiringCount, upcomingClassCount };
}
