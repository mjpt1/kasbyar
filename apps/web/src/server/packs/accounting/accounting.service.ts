import type { Prisma } from '@prisma/client';

import { prisma } from '@/lib/prisma';

export async function listAccountingMatters(
  organizationId: string,
  params: { status?: string; page?: number; pageSize?: number },
) {
  const page = params.page ?? 1;
  const pageSize = params.pageSize ?? 20;
  const where: Prisma.AccountingMatterWhereInput = {
    organizationId,
    ...(params.status
      ? { status: params.status as Prisma.EnumCaseStatusFilter['equals'] }
      : {}),
  };

  const [items, total] = await Promise.all([
    prisma.accountingMatter.findMany({
      where,
      orderBy: { createdAt: 'desc' },
      skip: (page - 1) * pageSize,
      take: pageSize,
      include: { customer: { select: { id: true, name: true, phone: true } } },
    }),
    prisma.accountingMatter.count({ where }),
  ]);

  return { items, total, page, pageSize, totalPages: Math.ceil(total / pageSize) };
}

export async function createAccountingMatter(
  organizationId: string,
  data: Omit<Prisma.AccountingMatterUncheckedCreateInput, 'organizationId'>,
) {
  return prisma.accountingMatter.create({
    data: { ...data, organizationId },
    include: { customer: { select: { id: true, name: true, phone: true } } },
  });
}

export async function listOpenAccountingMatters(organizationId: string) {
  return prisma.accountingMatter.findMany({
    where: {
      organizationId,
      status: { not: 'CLOSED' },
    },
    orderBy: { createdAt: 'desc' },
    take: 10,
    include: { customer: { select: { id: true, name: true } } },
  });
}

export async function getAccountingDashboardSignals(organizationId: string) {
  const now = new Date();
  const weekLater = new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000);

  const [openCount, activeCount, dueSoonCount] = await Promise.all([
    prisma.accountingMatter.count({
      where: { organizationId, status: { not: 'CLOSED' } },
    }),
    prisma.accountingMatter.count({
      where: { organizationId, status: 'ACTIVE' },
    }),
    prisma.accountingMatter.count({
      where: {
        organizationId,
        status: { not: 'CLOSED' },
        dueDate: { gte: now, lte: weekLater },
      },
    }),
  ]);

  return { openCount, activeCount, dueSoonCount };
}
