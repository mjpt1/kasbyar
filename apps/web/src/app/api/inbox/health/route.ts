import { apiSuccess, jsonResponse } from '@/lib/api-response';
import { handleApiError, isApiError, requireApiSession } from '@/lib/api-auth';
import { getInboxChannelHealth } from '@/server/messaging/inbox.service';

export async function GET() {
  try {
    const session = await requireApiSession();
    if (isApiError(session)) return session;

    const health = await getInboxChannelHealth(session.organizationId);
    return jsonResponse(apiSuccess(health));
  } catch (error) {
    return handleApiError(error, 'inbox.health.GET');
  }
}
