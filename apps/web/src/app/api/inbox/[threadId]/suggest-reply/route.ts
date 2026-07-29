import { apiSuccess, errorResponse, jsonResponse } from '@/lib/api-response';
import { handleApiError, isApiError, requireApiSession } from '@/lib/api-auth';
import { suggestInboxReply } from '@/server/messaging/inbox-insights.service';

export async function POST(
  _request: Request,
  context: { params: Promise<{ threadId: string }> },
) {
  try {
    const session = await requireApiSession();
    if (isApiError(session)) return session;

    const { threadId } = await context.params;
    const result = await suggestInboxReply(session.organizationId, threadId);
    if (!result) {
      return errorResponse('مکالمه یافت نشد', 404, 'NOT_FOUND');
    }

    return jsonResponse(apiSuccess(result));
  } catch (error) {
    return handleApiError(error, 'inbox.suggest-reply.POST');
  }
}
