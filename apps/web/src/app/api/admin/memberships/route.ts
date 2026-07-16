import type { MembershipRole } from '@prisma/client';
import { z } from 'zod';

import { apiSuccess, jsonResponse } from '@/lib/api-response';
import {
  handleApiError,
  isApiError,
  requireApiPlatformAdmin,
} from '@/lib/api-auth';
import {
  removeMembershipByAdmin,
  upsertMembershipByAdmin,
} from '@/server/admin/admin.service';

const upsertSchema = z.object({
  userId: z.string(),
  organizationId: z.string(),
  role: z.enum(['OWNER', 'ADMIN', 'MANAGER', 'STAFF', 'VIEWER']),
});

const removeSchema = z.object({
  userId: z.string(),
  organizationId: z.string(),
});

export async function POST(request: Request) {
  try {
    const session = await requireApiPlatformAdmin();
    if (isApiError(session)) return session;

    const body = upsertSchema.parse(await request.json());
    const membership = await upsertMembershipByAdmin({
      ...body,
      role: body.role as MembershipRole,
      actorUserId: session.user.id,
    });
    return jsonResponse(apiSuccess(membership), 201);
  } catch (error) {
    return handleApiError(error, 'admin.memberships.upsert');
  }
}

export async function DELETE(request: Request) {
  try {
    const session = await requireApiPlatformAdmin();
    if (isApiError(session)) return session;

    const body = removeSchema.parse(await request.json());
    const membership = await removeMembershipByAdmin({
      ...body,
      actorUserId: session.user.id,
    });
    return jsonResponse(apiSuccess(membership));
  } catch (error) {
    return handleApiError(error, 'admin.memberships.remove');
  }
}
