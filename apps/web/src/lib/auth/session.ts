import { cookies, headers } from 'next/headers';
import { redirect } from 'next/navigation';

import type { SessionContext } from '@kesbyar/shared';
import type { MembershipRole } from '@prisma/client';

import {
  AUTH_BEARER_PREFIX,
  ORG_COOKIE,
  ORG_ID_HEADER,
  SESSION_COOKIE,
} from '@/lib/auth/constants';
import { orgCookieOptions } from '@/lib/auth/cookie-options';
import { prisma } from '@/lib/prisma';
import { listUserWorkspaces } from '@/server/workspace/workspace.service';

const LOGIN_EXPIRED = '/login?expired=1';

export async function getSessionCredentials(): Promise<{
  token: string | null;
  organizationId: string | null;
}> {
  const headerStore = await headers();
  const authorization = headerStore.get('authorization');
  if (authorization?.startsWith(AUTH_BEARER_PREFIX)) {
    return {
      token: authorization.slice(AUTH_BEARER_PREFIX.length).trim(),
      organizationId: headerStore.get(ORG_ID_HEADER),
    };
  }

  const cookieStore = await cookies();
  return {
    token: cookieStore.get(SESSION_COOKIE)?.value ?? null,
    organizationId: cookieStore.get(ORG_COOKIE)?.value ?? null,
  };
}

async function buildSessionContext(
  token: string,
  preferredOrgId: string | null,
): Promise<SessionContext | null> {
  const session = await prisma.session.findUnique({
    where: { token },
    include: { user: true },
  });

  if (!session || session.expiresAt < new Date() || !session.user.isActive) {
    return null;
  }

  const isSuperAdmin = session.user.platformRole === 'SUPER_ADMIN';
  const workspaces = await listUserWorkspaces(session.user.id);

  if (workspaces.length === 0) {
    if (!isSuperAdmin) return null;
    return {
      user: {
        id: session.user.id,
        email: session.user.email,
        name: session.user.name,
      },
      organizationId: '',
      organizationName: 'پلتفرم',
      role: 'OWNER',
      workspaceId: '',
      industryPack: 'GENERAL',
      industrySpecialty: null,
      platformRole: 'SUPER_ADMIN',
      isSuperAdmin: true,
    };
  }

  const active =
    workspaces.find((w) => w.organizationId === preferredOrgId) ?? workspaces[0];

  if (!active) return null;

  return {
    user: {
      id: session.user.id,
      email: session.user.email,
      name: session.user.name,
    },
    organizationId: active.organizationId,
    organizationName: active.organizationName,
    role: active.role,
    workspaceId: active.workspaceId,
    industryPack: active.industryPack,
    industrySpecialty: active.industrySpecialty,
    platformRole: session.user.platformRole,
    isSuperAdmin,
  };
}

export async function getSession(): Promise<SessionContext | null> {
  const { token, organizationId } = await getSessionCredentials();
  if (!token) return null;
  return buildSessionContext(token, organizationId);
}

export async function requireSession(): Promise<SessionContext> {
  const session = await getSession();
  if (!session) {
    redirect(LOGIN_EXPIRED);
  }
  return session;
}

export async function requireActiveWorkspace(): Promise<SessionContext> {
  const { token, organizationId } = await getSessionCredentials();
  if (!token) redirect(LOGIN_EXPIRED);

  const sessionRecord = await prisma.session.findUnique({
    where: { token },
    include: { user: true },
  });
  if (
    !sessionRecord ||
    sessionRecord.expiresAt < new Date() ||
    !sessionRecord.user.isActive
  ) {
    redirect(LOGIN_EXPIRED);
  }

  const workspaces = await listUserWorkspaces(sessionRecord.user.id);
  if (workspaces.length === 0) redirect(LOGIN_EXPIRED);

  if (!organizationId && workspaces.length > 1) {
    redirect('/workspace/select');
  }

  return requireSession();
}

export async function requireRole(
  minRole: MembershipRole,
): Promise<SessionContext> {
  const session = await requireSession();
  const { hasMinRole } = await import('@/lib/permissions');
  if (!hasMinRole(session.role as MembershipRole, minRole)) {
    redirect('/dashboard');
  }
  return session;
}

export async function requirePlatformAdmin(): Promise<SessionContext> {
  const session = await requireSession();
  if (!session.isSuperAdmin) {
    redirect('/dashboard');
  }
  return session;
}

export async function setActiveOrganizationCookie(organizationId: string) {
  const cookieStore = await cookies();
  cookieStore.set(ORG_COOKIE, organizationId, orgCookieOptions());
}
