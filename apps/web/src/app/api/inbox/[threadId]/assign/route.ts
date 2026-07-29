import { apiSuccess, errorResponse, jsonResponse } from '@/lib/api-response';
import { handleApiError, isApiError, requireApiRole, requireApiSession } from '@/lib/api-auth';
import { inboxAssignSchema } from '@/lib/validators';
import { parseBody } from '@/lib/validators/parse';
import { assignThread } from '@/server/messaging/inbox.service';

export async function PATCH(
  request: Request,
  context: { params: Promise<{ threadId: string }> },
) {
  try {
    const session = await requireApiSession();
    if (isApiError(session)) return session;

    const denied = requireApiRole(session, 'MANAGER');
    if (denied) return denied;

    const { threadId } = await context.params;
    const body = await request.json();
    const parsed = parseBody(inboxAssignSchema, body);
    if (!parsed.ok) return parsed.response;

    const updated = await assignThread(
      session.organizationId,
      threadId,
      parsed.data.assigneeId,
    );
    if (!updated) {
      return errorResponse('مکالمه یافت نشد', 404, 'NOT_FOUND');
    }

    return jsonResponse(
      apiSuccess({
        id: updated.id,
        assigneeId: updated.assignee?.id ?? null,
        assigneeName: updated.assignee?.name ?? null,
      }),
    );
  } catch (error) {
    return handleApiError(error, 'inbox.thread.assign.PATCH');
  }
}
