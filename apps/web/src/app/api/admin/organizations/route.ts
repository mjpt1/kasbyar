import type { IndustryPack } from '@prisma/client';
import { z } from 'zod';

import { listSpecialties } from '@kesbyar/shared';

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

const industryPackSchema = z.enum([
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
  'LAW_FIRM',
  'ACCOUNTING_FIRM',
  'INSURANCE_AGENCY',
  'MARKETING_AGENCY',
  'CONTRACTING',
  'PHOTOGRAPHY',
  'CLEANING',
  'PRINTING',
]);

const specialtyIds = new Set(listSpecialties().map((s) => s.id));

const patchSchema = z
  .object({
    organizationId: z.string(),
    industryPack: industryPackSchema,
    industrySpecialty: z
      .string()
      .nullable()
      .optional()
      .refine((value) => value == null || specialtyIds.has(value), 'تخصص نامعتبر است'),
  })
  .superRefine((data, ctx) => {
    if (!data.industrySpecialty) return;
    const specialty = listSpecialties().find((s) => s.id === data.industrySpecialty);
    if (specialty && specialty.basePack !== data.industryPack) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: 'تخصص با بسته صنعتی انتخاب‌شده هم‌خوان نیست',
        path: ['industrySpecialty'],
      });
    }
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
      industrySpecialty: body.industrySpecialty ?? null,
      actorUserId: session.user.id,
    });
    return jsonResponse(apiSuccess(org));
  } catch (error) {
    return handleApiError(error, 'admin.organizations.update');
  }
}
