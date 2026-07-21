import { apiSuccess, jsonResponse } from '@/lib/api-response';
import { handleApiError, isApiError, requireApiRole, requireApiSession } from '@/lib/api-auth';
import { conversationConfirmSchema } from '@/lib/validators';
import { parseBody } from '@/lib/validators/parse';
import { confirmAgentAction } from '@/server/intelligence/tools/create-task';

export async function POST(request: Request) {
  try {
    const session = await requireApiSession();
    if (isApiError(session)) return session;
    const denied = requireApiRole(session, 'STAFF');
    if (denied) return denied;

    const body = await request.json();
    const parsed = parseBody(conversationConfirmSchema, body);
    if (!parsed.ok) return parsed.response;

    const result = await confirmAgentAction({
      organizationId: session.organizationId,
      userId: session.user.id,
      actionId: parsed.data.actionId,
      approved: parsed.data.approved,
      payload: parsed.data.payload,
    });

    return jsonResponse(apiSuccess(result));
  } catch (error) {
    return handleApiError(error, 'conversation.confirm.POST');
  }
}
