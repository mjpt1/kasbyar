import type { Prisma } from '@prisma/client';

import { prisma } from '@/lib/prisma';

export async function listInsurancePolicies(
  organizationId: string,
  params: { status?: string; page?: number; pageSize?: number },
) {
  const page = params.page ?? 1;
  const pageSize = params.pageSize ?? 20;
  const where: Prisma.InsurancePolicyWhereInput = {
    organizationId,
    ...(params.status
      ? { status: params.status as Prisma.EnumPolicyStatusFilter['equals'] }
      : {}),
  };

  const [items, total] = await Promise.all([
    prisma.insurancePolicy.findMany({
      where,
      orderBy: { createdAt: 'desc' },
      skip: (page - 1) * pageSize,
      take: pageSize,
      include: { customer: { select: { id: true, name: true, phone: true } } },
    }),
    prisma.insurancePolicy.count({ where }),
  ]);

  return { items, total, page, pageSize, totalPages: Math.ceil(total / pageSize) };
}

export async function createInsurancePolicy(
  organizationId: string,
  data: Omit<Prisma.InsurancePolicyUncheckedCreateInput, 'organizationId'>,
) {
  return prisma.insurancePolicy.create({
    data: { ...data, organizationId },
    include: { customer: { select: { id: true, name: true, phone: true } } },
  });
}

export async function listActiveInsurancePolicies(organizationId: string) {
  return prisma.insurancePolicy.findMany({
    where: {
      organizationId,
      status: { in: ['ACTIVE', 'PENDING'] },
    },
    orderBy: { expiresAt: 'asc' },
    take: 10,
    include: { customer: { select: { id: true, name: true } } },
  });
}

export async function getInsuranceDashboardSignals(organizationId: string) {
  const now = new Date();
  const monthLater = new Date(now.getTime() + 30 * 24 * 60 * 60 * 1000);

  const [activeCount, pendingCount, expiringCount] = await Promise.all([
    prisma.insurancePolicy.count({
      where: { organizationId, status: 'ACTIVE' },
    }),
    prisma.insurancePolicy.count({
      where: { organizationId, status: 'PENDING' },
    }),
    prisma.insurancePolicy.count({
      where: {
        organizationId,
        status: 'ACTIVE',
        expiresAt: { gte: now, lte: monthLater },
      },
    }),
  ]);

  return { activeCount, pendingCount, expiringCount };
}
