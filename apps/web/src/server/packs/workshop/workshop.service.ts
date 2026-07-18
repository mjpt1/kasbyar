import type { Prisma } from '@prisma/client';

import { prisma } from '@/lib/prisma';

export async function listRepairJobs(
  organizationId: string,
  params: { status?: string; page?: number; pageSize?: number },
) {
  const page = params.page ?? 1;
  const pageSize = params.pageSize ?? 20;
  const where: Prisma.RepairJobWhereInput = {
    organizationId,
    ...(params.status
      ? { status: params.status as Prisma.EnumRepairJobStatusFilter['equals'] }
      : {}),
  };

  const [items, total] = await Promise.all([
    prisma.repairJob.findMany({
      where,
      orderBy: { intakeAt: 'desc' },
      skip: (page - 1) * pageSize,
      take: pageSize,
      include: { customer: { select: { id: true, name: true, phone: true } } },
    }),
    prisma.repairJob.count({ where }),
  ]);

  return { items, total, page, pageSize, totalPages: Math.ceil(total / pageSize) };
}

export async function createRepairJob(
  organizationId: string,
  data: Omit<Prisma.RepairJobUncheckedCreateInput, 'organizationId'>,
) {
  return prisma.repairJob.create({
    data: { ...data, organizationId },
    include: { customer: { select: { id: true, name: true, phone: true } } },
  });
}

export async function listOpenRepairJobs(organizationId: string) {
  return prisma.repairJob.findMany({
    where: {
      organizationId,
      status: { notIn: ['DELIVERED', 'CANCELLED'] },
    },
    orderBy: { intakeAt: 'desc' },
    take: 10,
    include: { customer: { select: { id: true, name: true } } },
  });
}

export async function getWorkshopDashboardSignals(organizationId: string) {
  const [openCount, readyCount, inProgressCount] = await Promise.all([
    prisma.repairJob.count({
      where: {
        organizationId,
        status: { notIn: ['DELIVERED', 'CANCELLED'] },
      },
    }),
    prisma.repairJob.count({
      where: { organizationId, status: 'READY' },
    }),
    prisma.repairJob.count({
      where: {
        organizationId,
        status: { in: ['DIAGNOSING', 'WAITING_PARTS', 'IN_PROGRESS'] },
      },
    }),
  ]);

  return { openCount, readyCount, inProgressCount };
}
