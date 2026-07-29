import { apiSuccess, errorResponse, jsonResponse } from '@/lib/api-response';
import { handleApiError, isApiError, requireApiSession } from '@/lib/api-auth';
import { getLeadInstagramThread } from '@/server/messaging/inbox.service';

export async function GET(
  _request: Request,
  context: { params: Promise<{ leadId: string }> },
) {
  try {
    const session = await requireApiSession();
    if (isApiError(session)) return session;

    const { leadId } = await context.params;
    const data = await getLeadInstagramThread(session.organizationId, leadId);
    if (!data) {
      return errorResponse('سرنخ یافت نشد', 404, 'NOT_FOUND');
    }

    return jsonResponse(apiSuccess(data));
  } catch (error) {
    return handleApiError(error, 'inbox.lead.instagram.GET');
  }
}
