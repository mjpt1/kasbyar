import { apiSuccess, jsonResponse } from '@/lib/api-response';
import { handleApiError, isApiError, requireApiRole, requireApiSession } from '@/lib/api-auth';
import { getCompanyTwin, listTwinCustomers } from '@/server/twin/customer-twin.service';

export async function GET(request: Request) {
  try {
    const session = await requireApiSession();
    if (isApiError(session)) return session;
    const denied = requireApiRole(session, 'STAFF');
    if (denied) return denied;
    const include = new URL(request.url).searchParams.get('include');
    const twin = await getCompanyTwin(session.organizationId);
    if (include === 'customers') {
      const customers = await listTwinCustomers(session.organizationId);
      return jsonResponse(apiSuccess({ ...twin, customerList: customers }));
    }
    return jsonResponse(apiSuccess(twin));
  } catch (error) {
    return handleApiError(error, 'twin.company.GET');
  }
}
