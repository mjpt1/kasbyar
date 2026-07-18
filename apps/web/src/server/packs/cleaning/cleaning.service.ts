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

export async function listCleaningJobs(
  organizationId: string,
  params: { status?: string; page?: number; pageSize?: number },
) {
  const page = params.page ?? 1;
  const pageSize = params.pageSize ?? 20;
  const where: Prisma.CleaningJobWhereInput = {
    organizationId,
    ...(params.status
      ? { status: params.status as Prisma.EnumServiceBookingStatusFilter['equals'] }
      : {}),
  };

  const [items, total] = await Promise.all([
    prisma.cleaningJob.findMany({
      where,
      orderBy: { scheduledAt: 'desc' },
      skip: (page - 1) * pageSize,
      take: pageSize,
      include: { customer: { select: { id: true, name: true, phone: true } } },
    }),
    prisma.cleaningJob.count({ where }),
  ]);

  return { items, total, page, pageSize, totalPages: Math.ceil(total / pageSize) };
}

export async function createCleaningJob(
  organizationId: string,
  data: Omit<Prisma.CleaningJobUncheckedCreateInput, 'organizationId'>,
) {
  return prisma.cleaningJob.create({
    data: { ...data, organizationId },
    include: { customer: { select: { id: true, name: true, phone: true } } },
  });
}

export async function listUpcomingCleaningJobs(organizationId: string) {
  return prisma.cleaningJob.findMany({
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

export async function getCleaningDashboardSignals(organizationId: string) {
  const weekLater = new Date(startOfToday().getTime() + 7 * 24 * 60 * 60 * 1000);

  const [todayCount, upcomingCount, confirmedCount] = await Promise.all([
    prisma.cleaningJob.count({
      where: {
        organizationId,
        status: { in: ['SCHEDULED', 'CONFIRMED'] },
        scheduledAt: { gte: startOfToday(), lte: endOfToday() },
      },
    }),
    prisma.cleaningJob.count({
      where: {
        organizationId,
        status: { in: ['SCHEDULED', 'CONFIRMED'] },
        scheduledAt: { gte: startOfToday(), lte: weekLater },
      },
    }),
    prisma.cleaningJob.count({
      where: { organizationId, status: 'CONFIRMED' },
    }),
  ]);

  return { todayCount, upcomingCount, confirmedCount };
}
