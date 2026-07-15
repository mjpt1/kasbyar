import { AUDIT_ACTIONS, AUDIT_ENTITY_TYPES, slugify } from '@kesbyar/shared';
import type { IndustryPack } from '@prisma/client';

import {
  generateSessionToken,
  getSessionExpiry,
  hashPassword,
  verifyPassword,
} from '@/lib/auth/crypto';
import { prisma } from '@/lib/prisma';
import { logAudit } from '@/server/audit/audit.service';

export async function registerUser(input: {
  name: string;
  email: string;
  password: string;
  organizationName: string;
  industryPack?: IndustryPack;
}) {
  const existing = await prisma.user.findUnique({
    where: { email: input.email.toLowerCase() },
  });
  if (existing) {
    throw new Error('این ایمیل قبلاً ثبت شده است');
  }

  const passwordHash = await hashPassword(input.password);
  const orgSlug = slugify(input.organizationName) || `org-${Date.now()}`;

  const uniqueSlug = await ensureUniqueOrgSlug(orgSlug);

  const user = await prisma.user.create({
    data: {
      name: input.name,
      email: input.email.toLowerCase(),
      passwordHash,
      memberships: {
        create: {
          role: 'OWNER',
          organization: {
            create: {
              name: input.organizationName,
              slug: uniqueSlug,
              industryPack: input.industryPack ?? 'GENERAL',
              workspaces: {
                create: {
                  name: 'فضای کاری اصلی',
                  slug: 'main',
                  isDefault: true,
                },
              },
              pipelineStages: {
                createMany: {
                  data: [
                    { name: 'جدید', order: 0, color: '#6366f1' },
                    { name: 'در حال پیگیری', order: 1, color: '#0ea5e9' },
                    { name: 'پیشنهاد', order: 2, color: '#f59e0b' },
                    { name: 'موفق', order: 3, color: '#22c55e' },
                  ],
                },
              },
              subscription: {
                create: {
                  planCode: 'STARTER',
                  status: 'TRIALING',
                  trialEndsAt: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000),
                  currentPeriodStart: new Date(),
                  currentPeriodEnd: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000),
                  provider: 'manual',
                },
              },
            },
          },
        },
      },
    },
    include: {
      memberships: {
        include: { organization: true },
      },
    },
  });

  await logAudit({
    userId: user.id,
    action: AUDIT_ACTIONS.AUTH_REGISTER,
    entityType: AUDIT_ENTITY_TYPES.USER,
    entityId: user.id,
  });

  return user;
}

async function ensureUniqueOrgSlug(base: string): Promise<string> {
  let slug = base;
  let counter = 1;
  while (await prisma.organization.findUnique({ where: { slug } })) {
    slug = `${base}-${counter}`;
    counter += 1;
  }
  return slug;
}

export async function loginUser(email: string, password: string) {
  const user = await prisma.user.findUnique({
    where: { email: email.toLowerCase() },
  });

  if (!user || !user.isActive) {
    throw new Error('ایمیل یا رمز عبور نادرست است');
  }

  const valid = await verifyPassword(password, user.passwordHash);
  if (!valid) {
    throw new Error('ایمیل یا رمز عبور نادرست است');
  }

  const token = generateSessionToken();
  const session = await prisma.session.create({
    data: {
      userId: user.id,
      token,
      expiresAt: getSessionExpiry(),
    },
  });

  await logAudit({
    userId: user.id,
    action: AUDIT_ACTIONS.AUTH_LOGIN,
    entityType: AUDIT_ENTITY_TYPES.USER,
    entityId: user.id,
    metadata: { sessionId: session.id },
  });

  return { user, token, expiresAt: session.expiresAt };
}

export async function logoutUser(token: string) {
  await prisma.session.deleteMany({ where: { token } });
}

export async function getUserOrganizations(userId: string) {
  return prisma.membership.findMany({
    where: { userId, isActive: true },
    include: { organization: { include: { workspaces: true } } },
    orderBy: { joinedAt: 'asc' },
  });
}
