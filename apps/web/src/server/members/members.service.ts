import { AUDIT_ACTIONS, AUDIT_ENTITY_TYPES } from '@kesbyar/shared';
import type { MembershipRole } from '@prisma/client';

import { canManageMembers } from '@/lib/permissions';
import { prisma } from '@/lib/prisma';
import { logAudit } from '@/server/audit/audit.service';

export async function inviteMemberToOrganization(input: {
  organizationId: string;
  actorRole: MembershipRole;
  actorUserId: string;
  email: string;
  name: string;
  password: string;
  role: MembershipRole;
}) {
  if (!canManageMembers(input.actorRole)) {
    throw new Error('دسترسی کافی برای مدیریت اعضا ندارید');
  }

  const email = input.email.toLowerCase();
  let user = await prisma.user.findUnique({ where: { email } });

  if (!user) {
    const { hashPassword } = await import('@/lib/auth/crypto');
    user = await prisma.user.create({
      data: {
        name: input.name,
        email,
        passwordHash: await hashPassword(input.password),
      },
    });
  }

  const membership = await prisma.membership.upsert({
    where: {
      userId_organizationId: {
        userId: user.id,
        organizationId: input.organizationId,
      },
    },
    create: {
      userId: user.id,
      organizationId: input.organizationId,
      role: input.role,
    },
    update: {
      role: input.role,
      isActive: true,
    },
    include: {
      user: { select: { id: true, name: true, email: true } },
    },
  });

  await logAudit({
    organizationId: input.organizationId,
    userId: input.actorUserId,
    action: AUDIT_ACTIONS.MEMBER_INVITE,
    entityType: AUDIT_ENTITY_TYPES.MEMBERSHIP,
    entityId: membership.id,
    metadata: { email, role: input.role },
  });

  return membership;
}

export async function updateMemberRole(input: {
  organizationId: string;
  membershipId: string;
  actorRole: MembershipRole;
  actorUserId: string;
  role: MembershipRole;
}) {
  if (!canManageMembers(input.actorRole)) {
    throw new Error('دسترسی کافی برای مدیریت اعضا ندارید');
  }

  const existing = await prisma.membership.findFirst({
    where: { id: input.membershipId, organizationId: input.organizationId },
  });
  if (!existing) {
    throw new Error('عضو یافت نشد');
  }

  const membership = await prisma.membership.update({
    where: { id: input.membershipId },
    data: { role: input.role },
    include: { user: { select: { id: true, name: true, email: true } } },
  });

  await logAudit({
    organizationId: input.organizationId,
    userId: input.actorUserId,
    action: AUDIT_ACTIONS.MEMBER_ROLE_UPDATE,
    entityType: AUDIT_ENTITY_TYPES.MEMBERSHIP,
    entityId: membership.id,
    metadata: { role: input.role },
  });

  return membership;
}

export async function deactivateMember(input: {
  organizationId: string;
  membershipId: string;
  actorRole: MembershipRole;
  actorUserId: string;
}) {
  if (!canManageMembers(input.actorRole)) {
    throw new Error('دسترسی کافی برای مدیریت اعضا ندارید');
  }

  const existing = await prisma.membership.findFirst({
    where: { id: input.membershipId, organizationId: input.organizationId },
  });
  if (!existing) {
    throw new Error('عضو یافت نشد');
  }

  if (existing.role === 'OWNER') {
    const ownerCount = await prisma.membership.count({
      where: {
        organizationId: input.organizationId,
        role: 'OWNER',
        isActive: true,
      },
    });
    if (ownerCount <= 1) {
      throw new Error('حداقل یک مالک برای سازمان لازم است');
    }
  }

  const membership = await prisma.membership.update({
    where: { id: input.membershipId },
    data: { isActive: false },
  });

  await logAudit({
    organizationId: input.organizationId,
    userId: input.actorUserId,
    action: AUDIT_ACTIONS.MEMBER_REMOVE,
    entityType: AUDIT_ENTITY_TYPES.MEMBERSHIP,
    entityId: membership.id,
  });

  return membership;
}
