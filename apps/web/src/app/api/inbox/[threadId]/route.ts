import { apiSuccess, errorResponse, jsonResponse } from '@/lib/api-response';
import { handleApiError, isApiError, requireApiSession } from '@/lib/api-auth';
import { inboxSendSchema } from '@/lib/validators';
import { parseBody } from '@/lib/validators/parse';
import { listThreadMessages, sendThreadMessage } from '@/server/messaging/inbox.service';

export async function GET(
  _request: Request,
  context: { params: Promise<{ threadId: string }> },
) {
  try {
    const session = await requireApiSession();
    if (isApiError(session)) return session;

    const { threadId } = await context.params;
    const data = await listThreadMessages(session.organizationId, threadId, { pageSize: 100 });
    if (!data) {
      return errorResponse('مکالمه یافت نشد', 404, 'NOT_FOUND');
    }

    return jsonResponse(apiSuccess(data));
  } catch (error) {
    return handleApiError(error, 'inbox.thread.GET');
  }
}

export async function POST(
  request: Request,
  context: { params: Promise<{ threadId: string }> },
) {
  try {
    const session = await requireApiSession();
    if (isApiError(session)) return session;

    const { threadId } = await context.params;
    const body = await request.json();
    const parsed = parseBody(inboxSendSchema, body);
    if (!parsed.ok) return parsed.response;

    const result = await sendThreadMessage(
      session.organizationId,
      session.user.id,
      threadId,
      parsed.data.content,
      { subject: parsed.data.subject },
    );

    if ('error' in result && result.error === 'THREAD_NOT_FOUND') {
      return errorResponse('مکالمه یافت نشد', 404, 'NOT_FOUND');
    }

    return jsonResponse(apiSuccess(result), 201);
  } catch (error) {
    return handleApiError(error, 'inbox.thread.POST');
  }
}
