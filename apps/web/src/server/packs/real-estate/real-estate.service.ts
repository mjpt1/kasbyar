import type { Prisma } from '@prisma/client';

import { prisma } from '@/lib/prisma';

export async function listPropertyListings(
  organizationId: string,
  params: { status?: string; page?: number; pageSize?: number },
) {
  const page = params.page ?? 1;
  const pageSize = params.pageSize ?? 20;
  const where: Prisma.PropertyListingWhereInput = {
    organizationId,
    ...(params.status
      ? { status: params.status as Prisma.EnumListingStatusFilter['equals'] }
      : {}),
  };

  const [items, total] = await Promise.all([
    prisma.propertyListing.findMany({
      where,
      orderBy: { createdAt: 'desc' },
      skip: (page - 1) * pageSize,
      take: pageSize,
      include: { _count: { select: { showings: true } } },
    }),
    prisma.propertyListing.count({ where }),
  ]);

  return { items, total, page, pageSize, totalPages: Math.ceil(total / pageSize) };
}

export async function createPropertyListing(
  organizationId: string,
  data: Omit<Prisma.PropertyListingUncheckedCreateInput, 'organizationId'>,
) {
  return prisma.propertyListing.create({ data: { ...data, organizationId } });
}

export async function listPropertyShowings(
  organizationId: string,
  params: { page?: number; pageSize?: number },
) {
  const page = params.page ?? 1;
  const pageSize = params.pageSize ?? 20;

  const [items, total] = await Promise.all([
    prisma.propertyShowing.findMany({
      where: { organizationId },
      orderBy: { scheduledAt: 'asc' },
      skip: (page - 1) * pageSize,
      take: pageSize,
      include: {
        customer: { select: { id: true, name: true, phone: true } },
        listing: { select: { id: true, title: true, address: true } },
      },
    }),
    prisma.propertyShowing.count({ where: { organizationId } }),
  ]);

  return { items, total, page, pageSize, totalPages: Math.ceil(total / pageSize) };
}

export async function createPropertyShowing(
  organizationId: string,
  data: Omit<Prisma.PropertyShowingUncheckedCreateInput, 'organizationId'>,
) {
  return prisma.propertyShowing.create({
    data: { ...data, organizationId },
    include: {
      customer: { select: { id: true, name: true } },
      listing: { select: { id: true, title: true } },
    },
  });
}

export async function listUpcomingShowings(organizationId: string) {
  const in7Days = new Date();
  in7Days.setDate(in7Days.getDate() + 7);

  return prisma.propertyShowing.findMany({
    where: {
      organizationId,
      scheduledAt: { gte: new Date(), lte: in7Days },
    },
    orderBy: { scheduledAt: 'asc' },
    take: 10,
    include: {
      customer: { select: { id: true, name: true } },
      listing: { select: { title: true, address: true } },
    },
  });
}

export async function getRealEstateDashboardSignals(organizationId: string) {
  const in7Days = new Date();
  in7Days.setDate(in7Days.getDate() + 7);

  const [availableCount, reservedCount, upcomingShowingCount] = await Promise.all([
    prisma.propertyListing.count({
      where: { organizationId, status: 'AVAILABLE' },
    }),
    prisma.propertyListing.count({
      where: { organizationId, status: 'RESERVED' },
    }),
    prisma.propertyShowing.count({
      where: {
        organizationId,
        scheduledAt: { gte: new Date(), lte: in7Days },
      },
    }),
  ]);

  return { availableCount, reservedCount, upcomingShowingCount };
}
