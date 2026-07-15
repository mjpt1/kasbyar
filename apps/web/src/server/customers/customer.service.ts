import { ACTIVE_RECORD_FILTER, AUDIT_ACTIONS, AUDIT_ENTITY_TYPES, slugify } from '@kesbyar/shared';
import type { Prisma } from '@prisma/client';

import { prisma } from '@/lib/prisma';
import { logActivity, logAudit } from '@/server/audit/audit.service';

export async function listCustomers(
  organizationId: string,
  params: { search?: string; page?: number; pageSize?: number; includeArchived?: boolean },
) {
  const page = params.page ?? 1;
  const pageSize = params.pageSize ?? 20;
  const where: Prisma.CustomerWhereInput = {
    organizationId,
    ...(params.includeArchived ? {} : ACTIVE_RECORD_FILTER),
    ...(params.search
      ? {
          OR: [
            { name: { contains: params.search, mode: 'insensitive' } },
            { phone: { contains: params.search } },
            { email: { contains: params.search, mode: 'insensitive' } },
          ],
        }
      : {}),
  };

  const [items, total] = await Promise.all([
    prisma.customer.findMany({
      where,
      orderBy: { createdAt: 'desc' },
      skip: (page - 1) * pageSize,
      take: pageSize,
      include: { _count: { select: { invoices: true } } },
    }),
    prisma.customer.count({ where }),
  ]);

  return {
    items,
    total,
    page,
    pageSize,
    totalPages: Math.ceil(total / pageSize),
  };
}

export async function getCustomer(organizationId: string, id: string) {
  return prisma.customer.findFirst({
    where: { id, organizationId, ...ACTIVE_RECORD_FILTER },
    include: {
      contacts: true,
      invoices: { where: ACTIVE_RECORD_FILTER, orderBy: { createdAt: 'desc' }, take: 10 },
      activities: { orderBy: { createdAt: 'desc' }, take: 20 },
    },
  });
}

export async function createCustomer(
  organizationId: string,
  userId: string,
  data: Prisma.CustomerCreateWithoutOrganizationInput,
) {
  const customer = await prisma.customer.create({
    data: { ...data, organizationId },
  });

  await logActivity({
    organizationId,
    userId,
    type: 'SYSTEM',
    title: 'مشتری جدید ثبت شد',
    description: customer.name,
    customerId: customer.id,
  });

  return customer;
}

export async function updateCustomer(
  organizationId: string,
  id: string,
  data: Prisma.CustomerUpdateInput,
) {
  const existing = await prisma.customer.findFirst({
    where: { id, organizationId, ...ACTIVE_RECORD_FILTER },
  });
  if (!existing) return null;

  return prisma.customer.update({
    where: { id },
    data,
  });
}

/** بایگانی نرم — حذف سخت فقط از seed/reset */
export async function deleteCustomer(
  organizationId: string,
  id: string,
  userId?: string,
) {
  const existing = await prisma.customer.findFirst({
    where: { id, organizationId, ...ACTIVE_RECORD_FILTER },
  });
  if (!existing) return { count: 0 };

  await prisma.customer.update({
    where: { id },
    data: { deletedAt: new Date(), isActive: false },
  });

  if (userId) {
    await logAudit({
      organizationId,
      userId,
      action: AUDIT_ACTIONS.CUSTOMER_ARCHIVE,
      entityType: AUDIT_ENTITY_TYPES.CUSTOMER,
      entityId: id,
      metadata: { name: existing.name },
    });
  }

  return { count: 1 };
}

export { slugify };
