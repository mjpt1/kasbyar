import type { Prisma } from '@prisma/client';

import { prisma } from '@/lib/prisma';

function startOfToday() {
  const d = new Date();
  d.setHours(0, 0, 0, 0);
  return d;
}

function endOfToday() {
  const d = new Date();
  d.setHours(23, 59, 59, 999);
  return d;
}

export async function listPhotoSessions(
  organizationId: string,
  params: { status?: string; page?: number; pageSize?: number },
) {
  const page = params.page ?? 1;
  const pageSize = params.pageSize ?? 20;
  const where: Prisma.PhotoSessionWhereInput = {
    organizationId,
    ...(params.status
      ? { status: params.status as Prisma.EnumServiceBookingStatusFilter['equals'] }
      : {}),
  };

  const [items, total] = await Promise.all([
    prisma.photoSession.findMany({
      where,
      orderBy: { scheduledAt: 'desc' },
      skip: (page - 1) * pageSize,
      take: pageSize,
      include: { customer: { select: { id: true, name: true, phone: true } } },
    }),
    prisma.photoSession.count({ where }),
  ]);

  return { items, total, page, pageSize, totalPages: Math.ceil(total / pageSize) };
}

export async function createPhotoSession(
  organizationId: string,
  data: Omit<Prisma.PhotoSessionUncheckedCreateInput, 'organizationId'>,
) {
  return prisma.photoSession.create({
    data: { ...data, organizationId },
    include: { customer: { select: { id: true, name: true, phone: true } } },
  });
}

export async function listUpcomingPhotoSessions(organizationId: string) {
  return prisma.photoSession.findMany({
    where: {
      organizationId,
      status: { in: ['SCHEDULED', 'CONFIRMED'] },
      scheduledAt: { gte: startOfToday() },
    },
    orderBy: { scheduledAt: 'asc' },
    take: 10,
    include: { customer: { select: { id: true, name: true } } },
  });
}

export async function getPhotographyDashboardSignals(organizationId: string) {
  const weekLater = new Date(startOfToday().getTime() + 7 * 24 * 60 * 60 * 1000);

  const [todayCount, upcomingCount, confirmedCount] = await Promise.all([
    prisma.photoSession.count({
      where: {
        organizationId,
        status: { in: ['SCHEDULED', 'CONFIRMED'] },
        scheduledAt: { gte: startOfToday(), lte: endOfToday() },
      },
    }),
    prisma.photoSession.count({
      where: {
        organizationId,
        status: { in: ['SCHEDULED', 'CONFIRMED'] },
        scheduledAt: { gte: startOfToday(), lte: weekLater },
      },
    }),
    prisma.photoSession.count({
      where: { organizationId, status: 'CONFIRMED' },
    }),
  ]);

  return { todayCount, upcomingCount, confirmedCount };
}
