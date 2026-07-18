import type { Prisma } from '@prisma/client';

import { prisma } from '@/lib/prisma';

export async function listContractProjects(
  organizationId: string,
  params: { status?: string; page?: number; pageSize?: number },
) {
  const page = params.page ?? 1;
  const pageSize = params.pageSize ?? 20;
  const where: Prisma.ContractProjectWhereInput = {
    organizationId,
    ...(params.status
      ? { status: params.status as Prisma.EnumProjectJobStatusFilter['equals'] }
      : {}),
  };

  const [items, total] = await Promise.all([
    prisma.contractProject.findMany({
      where,
      orderBy: { createdAt: 'desc' },
      skip: (page - 1) * pageSize,
      take: pageSize,
      include: { customer: { select: { id: true, name: true, phone: true } } },
    }),
    prisma.contractProject.count({ where }),
  ]);

  return { items, total, page, pageSize, totalPages: Math.ceil(total / pageSize) };
}

export async function createContractProject(
  organizationId: string,
  data: Omit<Prisma.ContractProjectUncheckedCreateInput, 'organizationId'>,
) {
  return prisma.contractProject.create({
    data: { ...data, organizationId },
    include: { customer: { select: { id: true, name: true, phone: true } } },
  });
}

export async function listOpenContractProjects(organizationId: string) {
  return prisma.contractProject.findMany({
    where: {
      organizationId,
      status: { notIn: ['DONE', 'CANCELLED'] },
    },
    orderBy: { createdAt: 'desc' },
    take: 10,
    include: { customer: { select: { id: true, name: true } } },
  });
}

export async function getContractingDashboardSignals(organizationId: string) {
  const [activeCount, plannedCount, onHoldCount] = await Promise.all([
    prisma.contractProject.count({
      where: { organizationId, status: 'ACTIVE' },
    }),
    prisma.contractProject.count({
      where: { organizationId, status: 'PLANNED' },
    }),
    prisma.contractProject.count({
      where: { organizationId, status: 'ON_HOLD' },
    }),
  ]);

  return { activeCount, plannedCount, onHoldCount };
}
