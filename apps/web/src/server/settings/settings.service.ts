import { AUDIT_ACTIONS, AUDIT_ENTITY_TYPES } from '@kesbyar/shared';
import type { Prisma } from '@prisma/client';

import { canManageSettings } from '@/lib/permissions';
import { prisma } from '@/lib/prisma';
import { logAudit } from '@/server/audit/audit.service';

export async function getOrganizationSettings(organizationId: string) {
  return prisma.organization.findUnique({
    where: { id: organizationId },
    include: {
      memberships: {
        where: { isActive: true },
        include: { user: { select: { id: true, name: true, email: true } } },
      },
    },
  });
}

export async function updateOrganizationSettings(
  organizationId: string,
  role: Parameters<typeof canManageSettings>[0],
  userId: string,
  data: Prisma.OrganizationUpdateInput,
) {
  if (!canManageSettings(role)) {
    throw new Error('دسترسی کافی برای ویرایش تنظیمات ندارید');
  }

  const updated = await prisma.organization.update({
    where: { id: organizationId },
    data,
  });

  await logAudit({
    organizationId,
    userId,
    action: AUDIT_ACTIONS.SETTINGS_UPDATE,
    entityType: AUDIT_ENTITY_TYPES.ORGANIZATION,
    entityId: organizationId,
    metadata: {
      fields: Object.keys(data as object),
    },
  });

  return updated;
}

export async function listOrganizationMembers(organizationId: string) {
  return prisma.membership.findMany({
    where: { organizationId, isActive: true },
    include: { user: { select: { id: true, name: true, email: true } } },
    orderBy: { joinedAt: 'asc' },
  });
}
