import type { MembershipRole, PlatformRole } from '@prisma/client';
import { z } from 'zod';

import { apiSuccess, jsonResponse } from '@/lib/api-response';
import {
  handleApiError,
  isApiError,
  requireApiPlatformAdmin,
} from '@/lib/api-auth';
import {
  createUserByAdmin,
  listAllUsers,
  updateUserByAdmin,
} from '@/server/admin/admin.service';

const createSchema = z.object({
  name: z.string().min(2),
  email: z.string().email(),
  password: z.string().min(8),
  platformRole: z.enum(['USER', 'SUPER_ADMIN']).optional(),
  organizationId: z.string().optional(),
  membershipRole: z
    .enum(['OWNER', 'ADMIN', 'MANAGER', 'STAFF', 'VIEWER'])
    .optional(),
});

const updateSchema = z.object({
  userId: z.string(),
  name: z.string().min(2).optional(),
  isActive: z.boolean().optional(),
  platformRole: z.enum(['USER', 'SUPER_ADMIN']).optional(),
});

export async function GET(request: Request) {
  try {
    const session = await requireApiPlatformAdmin();
    if (isApiError(session)) return session;

    const { searchParams } = new URL(request.url);
    const search = searchParams.get('q') ?? undefined;
    const users = await listAllUsers(search);
    return jsonResponse(apiSuccess(users));
  } catch (error) {
    return handleApiError(error, 'admin.users.list');
  }
}

export async function POST(request: Request) {
  try {
    const session = await requireApiPlatformAdmin();
    if (isApiError(session)) return session;

    const body = createSchema.parse(await request.json());
    const user = await createUserByAdmin({
      ...body,
      platformRole: body.platformRole as PlatformRole | undefined,
      membershipRole: body.membershipRole as MembershipRole | undefined,
      actorUserId: session.user.id,
    });
    return jsonResponse(apiSuccess(user), 201);
  } catch (error) {
    return handleApiError(error, 'admin.users.create');
  }
}

export async function PATCH(request: Request) {
  try {
    const session = await requireApiPlatformAdmin();
    if (isApiError(session)) return session;

    const body = updateSchema.parse(await request.json());
    const { userId, ...data } = body;
    const user = await updateUserByAdmin(userId, {
      ...data,
      platformRole: data.platformRole as PlatformRole | undefined,
      actorUserId: session.user.id,
    });
    return jsonResponse(apiSuccess(user));
  } catch (error) {
    return handleApiError(error, 'admin.users.update');
  }
}
