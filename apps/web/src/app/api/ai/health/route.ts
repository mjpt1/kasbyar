import { apiSuccess, jsonResponse } from '@/lib/api-response';
import { handleApiError, isApiError, requireApiSession } from '@/lib/api-auth';
import { getIntelligenceServiceStatus } from '@/server/intelligence/intelligence.service';

export async function GET() {
  try {
    const session = await requireApiSession();
    if (isApiError(session)) return session;

    const status = await getIntelligenceServiceStatus();
    return jsonResponse(apiSuccess(status));
  } catch (error) {
    return handleApiError(error, 'ai.health.GET');
  }
}
