import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';

import type { SessionContext } from '@kesbyar/shared';
import type { MembershipRole } from '@prisma/client';

import { ORG_COOKIE, SESSION_COOKIE } from '@/lib/auth/crypto';
import { prisma } from '@/lib/prisma';
import { listUserWorkspaces } from '@/server/workspace/workspace.service';

export async function getSession(): Promise<SessionContext | null> {
  const cookieStore = await cookies();
  const token = cookieStore.get(SESSION_COOKIE)?.value;
  if (!token) return null;

  const session = await prisma.session.findUnique({
    where: { token },
    include: { user: true },
  });

  if (!session || session.expiresAt < new Date() || !session.user.isActive) {
    return null;
  }

  const workspaces = await listUserWorkspaces(session.user.id);
  if (workspaces.length === 0) return null;

  const preferredOrgId = cookieStore.get(ORG_COOKIE)?.value;
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
    platformRole: session.user.platformRole,
    isSuperAdmin: session.user.platformRole === 'SUPER_ADMIN',
  };
}

export async function requireSession(): Promise<SessionContext> {
  const session = await getSession();
  if (!session) {
    redirect('/login');
  }
  return session;
}

export async function requireActiveWorkspace(): Promise<SessionContext> {
  const cookieStore = await cookies();
  const token = cookieStore.get(SESSION_COOKIE)?.value;
  if (!token) redirect('/login');

  const sessionRecord = await prisma.session.findUnique({
    where: { token },
    include: { user: true },
  });
  if (!sessionRecord || sessionRecord.expiresAt < new Date()) {
    redirect('/login');
  }

  const workspaces = await listUserWorkspaces(sessionRecord.user.id);
  if (workspaces.length === 0) redirect('/login');

  const preferredOrgId = cookieStore.get(ORG_COOKIE)?.value;
  if (!preferredOrgId && workspaces.length > 1) {
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
  cookieStore.set(ORG_COOKIE, organizationId, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    path: '/',
    maxAge: 60 * 60 * 24 * 365,
  });
}
