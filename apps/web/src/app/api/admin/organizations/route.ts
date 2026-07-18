import type { IndustryPack } from '@prisma/client';
import { z } from 'zod';

import { apiSuccess, jsonResponse } from '@/lib/api-response';
import {
  handleApiError,
  isApiError,
  requireApiPlatformAdmin,
} from '@/lib/api-auth';
import {
  listAllOrganizations,
  updateOrganizationPackByAdmin,
} from '@/server/admin/admin.service';

const patchSchema = z.object({
  organizationId: z.string(),
  industryPack: z.enum([
    'GENERAL',
    'CLINIC',
    'TRAVEL_AGENCY',
    'RETAIL',
    'BEAUTY_SALON',
    'FOOD_SERVICE',
    'EDUCATION',
    'FITNESS',
    'REAL_ESTATE',
    'WORKSHOP',
  ]),
});

export async function GET(request: Request) {
  try {
    const session = await requireApiPlatformAdmin();
    if (isApiError(session)) return session;

    const { searchParams } = new URL(request.url);
    const search = searchParams.get('q') ?? undefined;
    const orgs = await listAllOrganizations(search);
    return jsonResponse(apiSuccess(orgs));
  } catch (error) {
    return handleApiError(error, 'admin.organizations.list');
  }
}

export async function PATCH(request: Request) {
  try {
    const session = await requireApiPlatformAdmin();
    if (isApiError(session)) return session;

    const body = patchSchema.parse(await request.json());
    const org = await updateOrganizationPackByAdmin({
      organizationId: body.organizationId,
      industryPack: body.industryPack as IndustryPack,
      actorUserId: session.user.id,
    });
    return jsonResponse(apiSuccess(org));
  } catch (error) {
    return handleApiError(error, 'admin.organizations.update');
  }
}
