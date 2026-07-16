import type { MembershipRole } from '@prisma/client';
import type { SessionContext } from '@kesbyar/shared';

import { fromAppError } from '@/lib/api-response';
import { jsonResponse } from '@/lib/api-response';
import { APP_LOG_EVENTS } from '@/lib/logger';
import { getSession } from '@/lib/auth/session';
import { ForbiddenError, isAppError, getErrorMessage, PlanUpgradeRequiredError, UnauthorizedError } from '@/lib/errors';
import { logger } from '@/lib/logger';
import { captureException } from '@/lib/monitoring';
import { hasMinRole } from '@/lib/permissions';

export async function requireApiSession(): Promise<SessionContext | Response> {
  const session = await getSession();
  if (!session) {
    return fromAppError(new UnauthorizedError());
  }
  return session;
}

export function isApiError(
  result: SessionContext | Response,
): result is Response {
  return result instanceof Response;
}

export function requireApiRole(
  session: SessionContext,
  minRole: MembershipRole,
): Response | null {
  if (!hasMinRole(session.role as MembershipRole, minRole)) {
    return fromAppError(new ForbiddenError());
  }
  return null;
}

export async function requireApiPlatformAdmin(): Promise<SessionContext | Response> {
  const session = await requireApiSession();
  if (isApiError(session)) return session;
  if (!session.isSuperAdmin) {
    return fromAppError(new ForbiddenError('فقط سوپرادمین'));
  }
  return session;
}

export function handleApiError(error: unknown, context?: string): Response {
  if (isAppError(error)) {
    if (error instanceof PlanUpgradeRequiredError) {
      logger.warn(APP_LOG_EVENTS.API_PLAN_UPGRADE_REQUIRED, {
        reason: error.reason,
        detail: error.detail,
        suggestedPlan: error.suggestedPlan,
        context,
      });
      return jsonResponse(
        {
          success: false,
          error: {
            code: error.code,
            message: error.message,
            details: {
              reason: [error.reason],
              ...(error.suggestedPlan ? { suggestedPlan: [error.suggestedPlan] } : {}),
            },
          },
        },
        error.status,
      );
    }
    logger.warn(APP_LOG_EVENTS.API_APP_ERROR, {
      code: error.code,
      message: error.message,
      context,
    });
    return fromAppError(error);
  }

  logger.error(APP_LOG_EVENTS.API_UNHANDLED, {
    message: getErrorMessage(error),
    context,
  });
  captureException(error, { context, layer: 'api' });
  return fromAppError({
    message: 'خطای داخلی سرور. لطفاً دوباره تلاش کنید.',
    code: 'INTERNAL_ERROR',
    status: 500,
  });
}
