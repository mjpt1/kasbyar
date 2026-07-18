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

export async function listBeautyAppointments(
  organizationId: string,
  params: { status?: string; page?: number; pageSize?: number },
) {
  const page = params.page ?? 1;
  const pageSize = params.pageSize ?? 20;
  const where: Prisma.BeautyAppointmentWhereInput = {
    organizationId,
    ...(params.status
      ? { status: params.status as Prisma.EnumServiceBookingStatusFilter['equals'] }
      : {}),
  };

  const [items, total] = await Promise.all([
    prisma.beautyAppointment.findMany({
      where,
      orderBy: { scheduledAt: 'asc' },
      skip: (page - 1) * pageSize,
      take: pageSize,
      include: { customer: { select: { id: true, name: true, phone: true } } },
    }),
    prisma.beautyAppointment.count({ where }),
  ]);

  return { items, total, page, pageSize, totalPages: Math.ceil(total / pageSize) };
}

export async function createBeautyAppointment(
  organizationId: string,
  data: Omit<Prisma.BeautyAppointmentUncheckedCreateInput, 'organizationId'>,
) {
  return prisma.beautyAppointment.create({
    data: { ...data, organizationId },
    include: { customer: { select: { id: true, name: true, phone: true } } },
  });
}

export async function listTodayBeautyAppointments(organizationId: string) {
  return prisma.beautyAppointment.findMany({
    where: {
      organizationId,
      scheduledAt: { gte: startOfToday(), lte: endOfToday() },
      status: { notIn: ['CANCELLED'] },
    },
    orderBy: { scheduledAt: 'asc' },
    take: 10,
    include: { customer: { select: { id: true, name: true, phone: true } } },
  });
}

export async function getBeautyDashboardSignals(organizationId: string) {
  const in7Days = new Date();
  in7Days.setDate(in7Days.getDate() + 7);

  const [todayCount, openCount, upcomingCount] = await Promise.all([
    prisma.beautyAppointment.count({
      where: {
        organizationId,
        scheduledAt: { gte: startOfToday(), lte: endOfToday() },
        status: { notIn: ['CANCELLED'] },
      },
    }),
    prisma.beautyAppointment.count({
      where: {
        organizationId,
        status: { in: ['SCHEDULED', 'CONFIRMED'] },
      },
    }),
    prisma.beautyAppointment.count({
      where: {
        organizationId,
        scheduledAt: { gte: new Date(), lte: in7Days },
        status: { in: ['SCHEDULED', 'CONFIRMED'] },
      },
    }),
  ]);

  return { todayCount, openCount, upcomingCount };
}
