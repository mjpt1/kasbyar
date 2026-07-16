import type { MembershipRole } from '@prisma/client';
import { z } from 'zod';

import { apiSuccess, jsonResponse } from '@/lib/api-response';
import {
  handleApiError,
  isApiError,
  requireApiRole,
  requireApiSession,
} from '@/lib/api-auth';
import {
  deactivateMember,
  inviteMemberToOrganization,
  updateMemberRole,
} from '@/server/members/members.service';
import { listOrganizationMembers } from '@/server/settings/settings.service';

const inviteSchema = z.object({
  name: z.string().min(2),
  email: z.string().email(),
  password: z.string().min(8),
  role: z.enum(['ADMIN', 'MANAGER', 'STAFF', 'VIEWER']),
});

const updateSchema = z.object({
  membershipId: z.string(),
  role: z.enum(['OWNER', 'ADMIN', 'MANAGER', 'STAFF', 'VIEWER']),
});

export async function GET() {
  const session = await requireApiSession();
  if (isApiError(session)) return session;

  const members = await listOrganizationMembers(session.organizationId);
  return jsonResponse(apiSuccess(members));
}

export async function POST(request: Request) {
  try {
    const session = await requireApiSession();
    if (isApiError(session)) return session;

    const denied = requireApiRole(session, 'ADMIN');
    if (denied) return denied;

    const body = inviteSchema.parse(await request.json());
    const membership = await inviteMemberToOrganization({
      organizationId: session.organizationId,
      actorRole: session.role as MembershipRole,
      actorUserId: session.user.id,
      ...body,
      role: body.role as MembershipRole,
    });
    return jsonResponse(apiSuccess(membership), 201);
  } catch (error) {
    return handleApiError(error, 'members.invite');
  }
}

export async function PATCH(request: Request) {
  try {
    const session = await requireApiSession();
    if (isApiError(session)) return session;

    const denied = requireApiRole(session, 'ADMIN');
    if (denied) return denied;

    const body = updateSchema.parse(await request.json());
    const membership = await updateMemberRole({
      organizationId: session.organizationId,
      actorRole: session.role as MembershipRole,
      actorUserId: session.user.id,
      membershipId: body.membershipId,
      role: body.role as MembershipRole,
    });
    return jsonResponse(apiSuccess(membership));
  } catch (error) {
    return handleApiError(error, 'members.update');
  }
}

export async function DELETE(request: Request) {
  try {
    const session = await requireApiSession();
    if (isApiError(session)) return session;

    const denied = requireApiRole(session, 'ADMIN');
    if (denied) return denied;

    const body = z.object({ membershipId: z.string() }).parse(await request.json());
    const membership = await deactivateMember({
      organizationId: session.organizationId,
      actorRole: session.role as MembershipRole,
      actorUserId: session.user.id,
      membershipId: body.membershipId,
    });
    return jsonResponse(apiSuccess(membership));
  } catch (error) {
    return handleApiError(error, 'members.remove');
  }
}
