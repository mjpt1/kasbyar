import { apiSuccess, errorResponse, jsonResponse } from '@/lib/api-response';
import { handleApiError, isApiError, requireApiSession } from '@/lib/api-auth';
import { getCustomerPhoneThread } from '@/server/messaging/calls.service';

export async function GET(
  _request: Request,
  context: { params: Promise<{ customerId: string }> },
) {
  try {
    const session = await requireApiSession();
    if (isApiError(session)) return session;

    const { customerId } = await context.params;
    const data = await getCustomerPhoneThread(session.organizationId, customerId);
    if (!data) {
      return errorResponse('شماره موبایل مشتری برای تماس معتبر نیست', 400, 'INVALID_PHONE');
    }

    return jsonResponse(apiSuccess(data));
  } catch (error) {
    return handleApiError(error, 'inbox.customer.phone.GET');
  }
}
