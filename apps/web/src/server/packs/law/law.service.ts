import type { Prisma } from '@prisma/client';

import { prisma } from '@/lib/prisma';

export async function listLegalCases(
  organizationId: string,
  params: { status?: string; page?: number; pageSize?: number },
) {
  const page = params.page ?? 1;
  const pageSize = params.pageSize ?? 20;
  const where: Prisma.LegalCaseWhereInput = {
    organizationId,
    ...(params.status
      ? { status: params.status as Prisma.EnumCaseStatusFilter['equals'] }
      : {}),
  };

  const [items, total] = await Promise.all([
    prisma.legalCase.findMany({
      where,
      orderBy: { createdAt: 'desc' },
      skip: (page - 1) * pageSize,
      take: pageSize,
      include: { customer: { select: { id: true, name: true, phone: true } } },
    }),
    prisma.legalCase.count({ where }),
  ]);

  return { items, total, page, pageSize, totalPages: Math.ceil(total / pageSize) };
}

export async function createLegalCase(
  organizationId: string,
  data: Omit<Prisma.LegalCaseUncheckedCreateInput, 'organizationId'>,
) {
  return prisma.legalCase.create({
    data: { ...data, organizationId },
    include: { customer: { select: { id: true, name: true, phone: true } } },
  });
}

export async function listOpenLegalCases(organizationId: string) {
  return prisma.legalCase.findMany({
    where: {
      organizationId,
      status: { not: 'CLOSED' },
    },
    orderBy: { createdAt: 'desc' },
    take: 10,
    include: { customer: { select: { id: true, name: true } } },
  });
}

export async function getLawDashboardSignals(organizationId: string) {
  const [openCount, activeCount, waitingCount] = await Promise.all([
    prisma.legalCase.count({
      where: { organizationId, status: { not: 'CLOSED' } },
    }),
    prisma.legalCase.count({
      where: { organizationId, status: 'ACTIVE' },
    }),
    prisma.legalCase.count({
      where: { organizationId, status: 'WAITING' },
    }),
  ]);

  return { openCount, activeCount, waitingCount };
}
