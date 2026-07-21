import { z } from 'zod';
import { IndustryPack } from '@prisma/client';

import { apiSuccess, errorResponse, jsonResponse } from '@/lib/api-response';
import {
  handleApiError,
  isApiError,
  requireApiRole,
  requireApiSession,
} from '@/lib/api-auth';
import {
  completeOnboarding,
  listOnboardingOptions,
} from '@/server/onboarding/onboarding.service';

export async function GET() {
  try {
    const session = await requireApiSession();
    if (isApiError(session)) return session;
    const denied = requireApiRole(session, 'ADMIN');
    if (denied) return denied;

    return jsonResponse(
      apiSuccess({
        ...listOnboardingOptions(),
        current: {
          name: session.organizationName,
          industryPack: session.industryPack,
          industrySpecialty: session.industrySpecialty,
        },
      }),
    );
  } catch (error) {
    return handleApiError(error, 'onboarding.GET');
  }
}

const bodySchema = z.object({
  name: z.string().min(2, 'نام کسب‌وکار الزامی است'),
  industryPack: z.nativeEnum(IndustryPack),
  industrySpecialty: z.string().min(2, 'تخصص را انتخاب کنید'),
});

export async function POST(request: Request) {
  try {
    const session = await requireApiSession();
    if (isApiError(session)) return session;
    const denied = requireApiRole(session, 'ADMIN');
    if (denied) return denied;

    const parsed = bodySchema.safeParse(await request.json());
    if (!parsed.success) {
      return errorResponse(parsed.error.errors[0]?.message ?? 'داده نامعتبر', 400);
    }

    const result = await completeOnboarding(
      session.organizationId,
      session.role,
      parsed.data,
    );

    return jsonResponse(
      apiSuccess({
        homePath: result.homePath,
        organization: {
          name: result.organization.name,
          industryPack: result.organization.industryPack,
          industrySpecialty: result.organization.industrySpecialty,
        },
      }),
    );
  } catch (error) {
    return handleApiError(error, 'onboarding.POST');
  }
}
