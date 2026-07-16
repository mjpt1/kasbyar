import { AUDIT_ACTIONS, AUDIT_ENTITY_TYPES } from '@kesbyar/shared';
import type { IndustryPack, MembershipRole, PlatformRole, Prisma } from '@prisma/client';

import { hashPassword } from '@/lib/auth/crypto';
import { prisma } from '@/lib/prisma';
import { logAudit } from '@/server/audit/audit.service';

const PLATFORM_SETTINGS_ID = 'platform';

export async function getOrCreatePlatformSettings() {
  return prisma.platformSettings.upsert({
    where: { id: PLATFORM_SETTINGS_ID },
    create: { id: PLATFORM_SETTINGS_ID },
    update: {},
  });
}

export async function updatePlatformSettings(data: {
  defaultSignupMembershipRole?: MembershipRole;
  allowSelfRegistration?: boolean;
}) {
  return prisma.platformSettings.upsert({
    where: { id: PLATFORM_SETTINGS_ID },
    create: { id: PLATFORM_SETTINGS_ID, ...data },
    update: data,
  });
}

export async function listAllUsers(search?: string) {
  return prisma.user.findMany({
    where: search
      ? {
          OR: [
            { email: { contains: search, mode: 'insensitive' } },
            { name: { contains: search, mode: 'insensitive' } },
          ],
        }
      : undefined,
    include: {
      memberships: {
        where: { isActive: true },
        include: {
          organization: {
            select: {
              id: true,
              name: true,
              industryPack: true,
              slug: true,
            },
          },
        },
      },
    },
    orderBy: { createdAt: 'desc' },
    take: 200,
  });
}

export async function listAllOrganizations(search?: string) {
  return prisma.organization.findMany({
    where: search
      ? {
          OR: [
            { name: { contains: search, mode: 'insensitive' } },
            { slug: { contains: search, mode: 'insensitive' } },
          ],
        }
      : undefined,
    include: {
      _count: { select: { memberships: true, customers: true } },
      subscription: { select: { planCode: true, status: true } },
    },
    orderBy: { createdAt: 'desc' },
    take: 200,
  });
}

export async function createUserByAdmin(input: {
  name: string;
  email: string;
  password: string;
  platformRole?: PlatformRole;
  organizationId?: string;
  membershipRole?: MembershipRole;
  actorUserId: string;
}) {
  const existing = await prisma.user.findUnique({
    where: { email: input.email.toLowerCase() },
  });
  if (existing) {
    throw new Error('این ایمیل قبلاً ثبت شده است');
  }

  const passwordHash = await hashPassword(input.password);

  const user = await prisma.user.create({
    data: {
      name: input.name,
      email: input.email.toLowerCase(),
      passwordHash,
      platformRole: input.platformRole ?? 'USER',
      ...(input.organizationId
        ? {
            memberships: {
              create: {
                organizationId: input.organizationId,
                role: input.membershipRole ?? 'STAFF',
              },
            },
          }
        : {}),
    },
    include: {
      memberships: { include: { organization: true } },
    },
  });

  await logAudit({
    userId: input.actorUserId,
    action: AUDIT_ACTIONS.ADMIN_USER_CREATE,
    entityType: AUDIT_ENTITY_TYPES.USER,
    entityId: user.id,
    metadata: {
      email: user.email,
      organizationId: input.organizationId,
      membershipRole: input.membershipRole,
    },
  });

  return user;
}

export async function updateUserByAdmin(
  userId: string,
  data: {
    name?: string;
    isActive?: boolean;
    platformRole?: PlatformRole;
    actorUserId: string;
  },
) {
  const { actorUserId, ...update } = data;
  const user = await prisma.user.update({
    where: { id: userId },
    data: update,
  });

  await logAudit({
    userId: actorUserId,
    action: AUDIT_ACTIONS.ADMIN_USER_UPDATE,
    entityType: AUDIT_ENTITY_TYPES.USER,
    entityId: userId,
    metadata: update as Prisma.JsonObject,
  });

  return user;
}

export async function upsertMembershipByAdmin(input: {
  userId: string;
  organizationId: string;
  role: MembershipRole;
  actorUserId: string;
}) {
  const membership = await prisma.membership.upsert({
    where: {
      userId_organizationId: {
        userId: input.userId,
        organizationId: input.organizationId,
      },
    },
    create: {
      userId: input.userId,
      organizationId: input.organizationId,
      role: input.role,
    },
    update: {
      role: input.role,
      isActive: true,
    },
    include: {
      user: { select: { id: true, name: true, email: true } },
      organization: { select: { id: true, name: true, industryPack: true } },
    },
  });

  await logAudit({
    organizationId: input.organizationId,
    userId: input.actorUserId,
    action: AUDIT_ACTIONS.ADMIN_MEMBERSHIP_UPSERT,
    entityType: AUDIT_ENTITY_TYPES.MEMBERSHIP,
    entityId: membership.id,
    metadata: {
      userId: input.userId,
      role: input.role,
    },
  });

  return membership;
}

export async function removeMembershipByAdmin(input: {
  userId: string;
  organizationId: string;
  actorUserId: string;
}) {
  const membership = await prisma.membership.update({
    where: {
      userId_organizationId: {
        userId: input.userId,
        organizationId: input.organizationId,
      },
    },
    data: { isActive: false },
  });

  await logAudit({
    organizationId: input.organizationId,
    userId: input.actorUserId,
    action: AUDIT_ACTIONS.ADMIN_MEMBERSHIP_REMOVE,
    entityType: AUDIT_ENTITY_TYPES.MEMBERSHIP,
    entityId: membership.id,
  });

  return membership;
}

export async function updateOrganizationPackByAdmin(input: {
  organizationId: string;
  industryPack: IndustryPack;
  actorUserId: string;
}) {
  const org = await prisma.organization.update({
    where: { id: input.organizationId },
    data: { industryPack: input.industryPack },
  });

  await logAudit({
    organizationId: input.organizationId,
    userId: input.actorUserId,
    action: AUDIT_ACTIONS.ADMIN_ORG_UPDATE,
    entityType: AUDIT_ENTITY_TYPES.ORGANIZATION,
    entityId: org.id,
    metadata: { industryPack: input.industryPack },
  });

  return org;
}

export async function getAdminStats() {
  const [users, organizations, activeMemberships, signupsToday] = await Promise.all([
    prisma.user.count(),
    prisma.organization.count(),
    prisma.membership.count({ where: { isActive: true } }),
    prisma.user.count({
      where: {
        createdAt: { gte: new Date(new Date().setHours(0, 0, 0, 0)) },
      },
    }),
  ]);

  return { users, organizations, activeMemberships, signupsToday };
}
