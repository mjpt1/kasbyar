import type { Prisma } from '@prisma/client';

import { prisma } from '@/lib/prisma';

export async function listTravelBookings(
  organizationId: string,
  params: { status?: string; page?: number; pageSize?: number },
) {
  const page = params.page ?? 1;
  const pageSize = params.pageSize ?? 20;
  const where: Prisma.TravelBookingWhereInput = {
    organizationId,
    ...(params.status
      ? { status: params.status as Prisma.EnumBookingRequestStatusFilter['equals'] }
      : {}),
  };

  const [items, total] = await Promise.all([
    prisma.travelBooking.findMany({
      where,
      orderBy: { departureDate: 'asc' },
      skip: (page - 1) * pageSize,
      take: pageSize,
      include: {
        customer: { select: { id: true, name: true, phone: true } },
      },
    }),
    prisma.travelBooking.count({ where }),
  ]);

  return { items, total, page, pageSize, totalPages: Math.ceil(total / pageSize) };
}

export async function createTravelBooking(
  organizationId: string,
  data: Omit<Prisma.TravelBookingUncheckedCreateInput, 'organizationId'>,
) {
  return prisma.travelBooking.create({
    data: { ...data, organizationId },
    include: { customer: true },
  });
}

export async function updateTravelBooking(
  organizationId: string,
  id: string,
  data: Prisma.TravelBookingUpdateInput,
) {
  const existing = await prisma.travelBooking.findFirst({ where: { id, organizationId } });
  if (!existing) return null;
  return prisma.travelBooking.update({
    where: { id },
    data,
    include: { customer: true },
  });
}

export async function listUpcomingDepartures(organizationId: string, days = 30) {
  const until = new Date();
  until.setDate(until.getDate() + days);

  return prisma.travelBooking.findMany({
    where: {
      organizationId,
      departureDate: { gte: new Date(), lte: until },
      status: { in: ['CONFIRMED', 'QUOTED', 'DEPARTED'] },
    },
    orderBy: { departureDate: 'asc' },
    take: 10,
    include: { customer: { select: { name: true, phone: true } } },
  });
}

export async function ensureTravelerProfile(
  organizationId: string,
  customerId: string,
  profile?: { passportNo?: string; notes?: string },
) {
  const customer = await prisma.customer.findFirst({
    where: { id: customerId, organizationId },
  });
  if (!customer) return null;

  return prisma.travelerProfile.upsert({
    where: { customerId },
    create: { organizationId, customerId, ...profile },
    update: profile ?? {},
    include: { customer: true },
  });
}

export async function getTravelDashboardSignals(organizationId: string) {
  const in30Days = new Date();
  in30Days.setDate(in30Days.getDate() + 30);

  const [pendingCount, upcomingCount, unpaidCount] = await Promise.all([
    prisma.travelBooking.count({
      where: {
        organizationId,
        status: { in: ['INQUIRY', 'QUOTED'] },
      },
    }),
    prisma.travelBooking.count({
      where: {
        organizationId,
        departureDate: { gte: new Date(), lte: in30Days },
        status: { in: ['CONFIRMED', 'QUOTED'] },
      },
    }),
    prisma.invoice.count({
      where: {
        organizationId,
        status: { in: ['SENT', 'PARTIAL', 'OVERDUE'] },
        customer: { travelBookings: { some: {} } },
      },
    }),
  ]);

  return { pendingCount, upcomingCount, unpaidCount };
}
