import { apiSuccess, errorResponse, jsonResponse } from '@/lib/api-response';
import { handleApiError, isApiError, requireApiSession } from '@/lib/api-auth';
import { getCustomerTelegramThread } from '@/server/messaging/inbox.service';

export async function GET(
  _request: Request,
  context: { params: Promise<{ customerId: string }> },
) {
  try {
    const session = await requireApiSession();
    if (isApiError(session)) return session;

    const { customerId } = await context.params;
    const data = await getCustomerTelegramThread(session.organizationId, customerId);
    if (!data) {
      return errorResponse('مشتری یافت نشد', 404, 'NOT_FOUND');
    }

    return jsonResponse(apiSuccess(data));
  } catch (error) {
    return handleApiError(error, 'inbox.customer.telegram.GET');
  }
}
