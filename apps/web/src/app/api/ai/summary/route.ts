import { apiSuccess, jsonResponse } from '@/lib/api-response';
import { handleApiError, isApiError, requireApiSession } from '@/lib/api-auth';
import { assertFeature } from '@/server/billing/entitlement.service';
import { getOperationalInsight } from '@/server/intelligence/intelligence.service';

export async function GET() {
  try {
    const session = await requireApiSession();
    if (isApiError(session)) return session;

    await assertFeature(session.organizationId, 'aiAssistant');

    const insight = await getOperationalInsight(session.organizationId);
    return jsonResponse(apiSuccess(insight));
  } catch (error) {
    return handleApiError(error, 'ai.summary.GET');
  }
}
