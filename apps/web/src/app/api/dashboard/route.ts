import { apiSuccess, jsonResponse } from '@/lib/api-response';
import { handleApiError, isApiError, requireApiSession } from '@/lib/api-auth';
import { getDashboardDetails } from '@/server/dashboard/dashboard.service';

export async function GET() {
  try {
    const session = await requireApiSession();
    if (isApiError(session)) return session;

    const data = await getDashboardDetails(session.organizationId);
    return jsonResponse(apiSuccess(data));
  } catch (error) {
    return handleApiError(error, 'dashboard.GET');
  }
}
