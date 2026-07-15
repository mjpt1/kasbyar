import { apiSuccess, jsonResponse } from '@/lib/api-response';
import { handleApiError, isApiError, requireApiRole, requireApiSession } from '@/lib/api-auth';
import { canResetDemoData, canShowDemoControls } from '@/lib/demo';
import { ForbiddenError } from '@/lib/errors';
import type { MembershipRole } from '@prisma/client';
import { resetDemoEnvironment } from '@/server/demo/demo-reset.service';

export async function POST() {
  try {
    if (!canShowDemoControls()) {
      throw new ForbiddenError('بازنشانی دمو غیرفعال است');
    }
    if (!canResetDemoData()) {
      throw new ForbiddenError(
        'بازنشانی داده نیاز به DEMO_MODE و ALLOW_SEED دارد — در production غیرفعال است',
      );
    }

    const session = await requireApiSession();
    if (isApiError(session)) return session;

    const denied = requireApiRole(session, 'ADMIN');
    if (denied) return denied;

    await resetDemoEnvironment(session.user.id, session.organizationId);

    return jsonResponse(
      apiSuccess({
        message: 'داده‌های دمو به حالت اولیه بازگردانده شد',
      }),
    );
  } catch (error) {
    return handleApiError(error, 'demo.reset');
  }
}
