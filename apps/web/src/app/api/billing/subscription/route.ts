import { apiSuccess, jsonResponse } from '@/lib/api-response';
import { handleApiError, isApiError, requireApiSession } from '@/lib/api-auth';
import { canManageBilling } from '@/lib/permissions';
import type { MembershipRole } from '@prisma/client';
import { ForbiddenError } from '@/lib/errors';
import { getSubscriptionSummary } from '@/server/billing/entitlement.service';
import { listSubscriptionEvents } from '@/server/billing/subscription.service';

export async function GET() {
  try {
    const session = await requireApiSession();
    if (isApiError(session)) return session;

    if (!canManageBilling(session.role as MembershipRole)) {
      throw new ForbiddenError('مشاهده اشتراک فقط برای مدیران و بالاتر مجاز است');
    }

    const [summary, events] = await Promise.all([
      getSubscriptionSummary(session.organizationId),
      listSubscriptionEvents(session.organizationId),
    ]);

    return jsonResponse(apiSuccess({ summary, events }));
  } catch (error) {
    return handleApiError(error, 'billing.subscription.GET');
  }
}
