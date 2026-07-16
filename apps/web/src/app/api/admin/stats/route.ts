import { apiSuccess, errorResponse, jsonResponse } from '@/lib/api-response';
import { handleApiError, isApiError, requireApiPlatformAdmin } from '@/lib/api-auth';
import { getAdminStats } from '@/server/admin/admin.service';

export async function GET() {
  try {
    const session = await requireApiPlatformAdmin();
    if (isApiError(session)) return session;

    const stats = await getAdminStats();
    return jsonResponse(apiSuccess(stats));
  } catch (error) {
    return handleApiError(error, 'admin.stats');
  }
}
