import { apiSuccess, errorResponse, jsonResponse } from '@/lib/api-response';
import { handleApiError, isApiError, requireApiSession } from '@/lib/api-auth';
import { createCustomerPortalToken } from '@/server/portal/customer-portal.service';

export async function POST(
  _request: Request,
  context: { params: Promise<{ id: string }> },
) {
  try {
    const session = await requireApiSession();
    if (isApiError(session)) return session;

    const { id } = await context.params;
    const result = await createCustomerPortalToken(session.organizationId, id);
    return jsonResponse(apiSuccess(result));
  } catch (error) {
    if (error instanceof Error) return errorResponse(error.message, 400);
    return handleApiError(error, 'customers.portal.POST');
  }
}
