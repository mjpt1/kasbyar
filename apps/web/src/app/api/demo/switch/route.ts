import { z } from 'zod';

import { apiSuccess, jsonResponse } from '@/lib/api-response';
import { handleApiError, isApiError, requireApiSession } from '@/lib/api-auth';
import { canShowDemoControls } from '@/lib/demo';
import { ForbiddenError } from '@/lib/errors';
import { setActiveOrganizationCookie } from '@/lib/auth/session';
import { parseBody } from '@/lib/validators/parse';
import { getDemoStatus, resolveOrganizationByScenario } from '@/server/demo/demo.service';

const switchSchema = z.object({
  scenarioId: z.enum(['general', 'clinic', 'travel', 'retail']),
});

export async function POST(request: Request) {
  try {
    if (!canShowDemoControls()) {
      throw new ForbiddenError('تغییر سناریو فقط در حالت نمایش فعال است');
    }

    const session = await requireApiSession();
    if (isApiError(session)) return session;

    const body = await request.json();
    const parsed = parseBody(switchSchema, body);
    if (!parsed.ok) return parsed.response;

    const org = await resolveOrganizationByScenario(parsed.data.scenarioId);
    if (!org?.isDemo) {
      throw new ForbiddenError('سناریوی دمو یافت نشد');
    }

    const membership = await import('@/server/workspace/workspace.service').then((m) =>
      m.resolveMembership(session.user.id, org.id),
    );
    if (!membership) {
      throw new ForbiddenError('به این سناریو دسترسی ندارید — با demo@kesbyar.ir وارد شوید');
    }

    await setActiveOrganizationCookie(org.id);

    const status = await getDemoStatus(org.id);

    return jsonResponse(
      apiSuccess({
        organizationId: org.id,
        organizationName: org.name,
        scenarioId: parsed.data.scenarioId,
        redirectTo: status?.scenario?.firstStopHref ?? '/dashboard',
      }),
    );
  } catch (error) {
    return handleApiError(error, 'demo.switch');
  }
}
