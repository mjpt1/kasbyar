import { apiSuccess, jsonResponse } from '@/lib/api-response';
import { handleApiError, isApiError, requireApiSession } from '@/lib/api-auth';
import { getCustomerTwin } from '@/server/twin/customer-twin.service';

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const session = await requireApiSession();
    if (isApiError(session)) return session;
    const { id } = await params;
    const twin = await getCustomerTwin(session.organizationId, id);
    if (!twin) {
      return jsonResponse(
        { success: false, error: { code: 'NOT_FOUND', message: 'مشتری یافت نشد' } },
        404,
      );
    }
    return jsonResponse(apiSuccess(twin));
  } catch (error) {
    return handleApiError(error, 'twin.customer.GET');
  }
}
