import type { MembershipRole } from '@prisma/client';
import { z } from 'zod';

import { apiSuccess, jsonResponse } from '@/lib/api-response';
import {
  handleApiError,
  isApiError,
  requireApiPlatformAdmin,
} from '@/lib/api-auth';
import {
  getOrCreatePlatformSettings,
  updatePlatformSettings,
} from '@/server/admin/admin.service';

const patchSchema = z.object({
  defaultSignupMembershipRole: z
    .enum(['OWNER', 'ADMIN', 'MANAGER', 'STAFF', 'VIEWER'])
    .optional(),
  allowSelfRegistration: z.boolean().optional(),
});

export async function GET() {
  try {
    const session = await requireApiPlatformAdmin();
    if (isApiError(session)) return session;

    const settings = await getOrCreatePlatformSettings();
    return jsonResponse(apiSuccess(settings));
  } catch (error) {
    return handleApiError(error, 'admin.settings.get');
  }
}

export async function PATCH(request: Request) {
  try {
    const session = await requireApiPlatformAdmin();
    if (isApiError(session)) return session;

    const body = patchSchema.parse(await request.json());
    const settings = await updatePlatformSettings({
      defaultSignupMembershipRole: body.defaultSignupMembershipRole as
        | MembershipRole
        | undefined,
      allowSelfRegistration: body.allowSelfRegistration,
    });
    return jsonResponse(apiSuccess(settings));
  } catch (error) {
    return handleApiError(error, 'admin.settings.update');
  }
}
