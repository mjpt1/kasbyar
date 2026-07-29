import type { Prisma } from '@prisma/client';

import { prisma } from '@/lib/prisma';

const CONTACT_ACTIVITY_TYPES = new Set(['CALL', 'MEETING', 'MESSAGE', 'EMAIL']);

export async function createManualActivity(
  organizationId: string,
  userId: string,
  data: {
    type: Prisma.ActivityLogCreateInput['type'];
    title: string;
    description?: string;
    customerId?: string;
    leadId?: string;
    metadata?: Record<string, unknown>;
  },
) {
  if (data.customerId) {
    const customer = await prisma.customer.findFirst({
      where: { id: data.customerId, organizationId },
      select: { id: true },
    });
    if (!customer) return null;
  }

  if (data.leadId) {
    const lead = await prisma.lead.findFirst({
      where: { id: data.leadId, organizationId },
      select: { id: true },
    });
    if (!lead) return null;
  }

  return prisma.$transaction(async (tx) => {
    const created = await tx.activityLog.create({
      data: {
        organizationId,
        userId,
        type: data.type,
        title: data.title,
        description: data.description,
        customerId: data.customerId,
        leadId: data.leadId,
        metadata: (data.metadata ?? {}) as Prisma.InputJsonValue,
      },
      include: {
        user: { select: { id: true, name: true } },
        customer: { select: { id: true, name: true } },
        lead: { select: { id: true, title: true } },
      },
    });

    if (data.leadId && data.type && CONTACT_ACTIVITY_TYPES.has(data.type)) {
      await tx.lead.update({
        where: { id: data.leadId },
        data: { lastContactAt: new Date() },
      });
    }

    return created;
  });
}

export async function listRecentActivities(
  organizationId: string,
  params: { page?: number; pageSize?: number; type?: string; userId?: string },
) {
  const page = params.page ?? 1;
  const pageSize = Math.min(params.pageSize ?? 30, 100);

  const where: Prisma.ActivityLogWhereInput = {
    organizationId,
    ...(params.type
      ? { type: params.type as Prisma.EnumActivityTypeFilter['equals'] }
      : {}),
    ...(params.userId ? { userId: params.userId } : {}),
  };

  const [items, total] = await Promise.all([
    prisma.activityLog.findMany({
      where,
      orderBy: { createdAt: 'desc' },
      skip: (page - 1) * pageSize,
      take: pageSize,
      include: {
        user: { select: { id: true, name: true } },
        customer: { select: { id: true, name: true } },
        lead: { select: { id: true, title: true } },
      },
    }),
    prisma.activityLog.count({ where }),
  ]);

  return { items, total, page, pageSize, totalPages: Math.ceil(total / pageSize) };
}
