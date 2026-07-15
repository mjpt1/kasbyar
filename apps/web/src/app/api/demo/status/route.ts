import { apiSuccess, jsonResponse } from '@/lib/api-response';
import { handleApiError, isApiError, requireApiSession } from '@/lib/api-auth';
import { getDemoStatus } from '@/server/demo/demo.service';

export async function GET() {
  try {
    const session = await requireApiSession();
    if (isApiError(session)) return session;

    const status = await getDemoStatus(session.organizationId);
    return jsonResponse(apiSuccess(status));
  } catch (error) {
    return handleApiError(error, 'demo.status');
  }
}
