import { apiSuccess, errorResponse, jsonResponse } from '@/lib/api-response';
import { handleApiError, isApiError, requireApiSession } from '@/lib/api-auth';
import { getCustomerEmailThread } from '@/server/messaging/inbox.service';

export async function GET(
  _request: Request,
  context: { params: Promise<{ customerId: string }> },
) {
  try {
    const session = await requireApiSession();
    if (isApiError(session)) return session;

    const { customerId } = await context.params;
    const data = await getCustomerEmailThread(session.organizationId, customerId);
    if (!data) {
      return errorResponse('ایمیل مشتری ثبت نشده است', 400, 'INVALID_EMAIL');
    }

    return jsonResponse(apiSuccess(data));
  } catch (error) {
    return handleApiError(error, 'inbox.customer.email.GET');
  }
}
