import { apiSuccess, errorResponse, jsonResponse } from '@/lib/api-response';
import { handleApiError, isApiError, requireApiSession } from '@/lib/api-auth';
import { getLeadPhoneThread } from '@/server/messaging/calls.service';

export async function GET(
  _request: Request,
  context: { params: Promise<{ leadId: string }> },
) {
  try {
    const session = await requireApiSession();
    if (isApiError(session)) return session;

    const { leadId } = await context.params;
    const data = await getLeadPhoneThread(session.organizationId, leadId);
    if (!data) {
      return errorResponse('شماره تماس سرنخ معتبر نیست', 400, 'INVALID_PHONE');
    }

    return jsonResponse(apiSuccess(data));
  } catch (error) {
    return handleApiError(error, 'inbox.lead.phone.GET');
  }
}
