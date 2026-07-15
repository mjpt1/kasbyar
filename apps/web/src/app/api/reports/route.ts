import { apiSuccess, jsonResponse } from '@/lib/api-response';
import { handleApiError, isApiError, requireApiSession } from '@/lib/api-auth';
import { assertFeature } from '@/server/billing/entitlement.service';
import { getReportsOverview } from '@/server/reports/reports.service';

export async function GET() {
  try {
    const session = await requireApiSession();
    if (isApiError(session)) return session;

    await assertFeature(session.organizationId, 'reports');

    const overview = await getReportsOverview(session.organizationId);
    return jsonResponse(apiSuccess(overview));
  } catch (error) {
    return handleApiError(error, 'reports.GET');
  }
}
