import type { DomainEventType, Prisma } from '@prisma/client';

import { prisma } from '@/lib/prisma';

export async function publishDomainEvent(params: {
  organizationId: string;
  eventType: DomainEventType;
  entityType?: string;
  entityId?: string;
  payload?: Record<string, unknown>;
  occurredAt?: Date;
}) {
  return prisma.domainEvent.create({
    data: {
      organizationId: params.organizationId,
      eventType: params.eventType,
      entityType: params.entityType,
      entityId: params.entityId,
      payload: (params.payload ?? {}) as Prisma.InputJsonValue,
      occurredAt: params.occurredAt ?? new Date(),
    },
  });
}

export async function listDomainEvents(
  organizationId: string,
  params: { limit?: number; eventType?: DomainEventType } = {},
) {
  return prisma.domainEvent.findMany({
    where: {
      organizationId,
      ...(params.eventType ? { eventType: params.eventType } : {}),
    },
    orderBy: { occurredAt: 'desc' },
    take: params.limit ?? 50,
  });
}
