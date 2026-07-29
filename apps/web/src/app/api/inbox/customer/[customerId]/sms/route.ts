import { apiSuccess, errorResponse, jsonResponse } from '@/lib/api-response';
import { handleApiError, isApiError, requireApiSession } from '@/lib/api-auth';
import { getCustomerSmsThread } from '@/server/messaging/inbox.service';

export async function GET(
  _request: Request,
  context: { params: Promise<{ customerId: string }> },
) {
  try {
    const session = await requireApiSession();
    if (isApiError(session)) return session;

    const { customerId } = await context.params;
    const data = await getCustomerSmsThread(session.organizationId, customerId);
    if (!data) {
      return errorResponse('شماره موبایل مشتری برای پیامک معتبر نیست', 400, 'INVALID_PHONE');
    }

    return jsonResponse(apiSuccess(data));
  } catch (error) {
    return handleApiError(error, 'inbox.customer.sms.GET');
  }
}
