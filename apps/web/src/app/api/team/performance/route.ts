import { apiSuccess, jsonResponse } from '@/lib/api-response';
import { handleApiError, isApiError, requireApiSession, requireApiRole } from '@/lib/api-auth';
import { assertFeature } from '@/server/billing/entitlement.service';
import { getTeamPerformanceOverview } from '@/server/team/team-performance.service';

export async function GET() {
  try {
    const session = await requireApiSession();
    if (isApiError(session)) return session;

    const forbidden = requireApiRole(session, 'MANAGER');
    if (forbidden) return forbidden;

    await assertFeature(session.organizationId, 'reports');

    const overview = await getTeamPerformanceOverview(session.organizationId);
    return jsonResponse(apiSuccess(overview));
  } catch (error) {
    return handleApiError(error, 'team.performance.GET');
  }
}
