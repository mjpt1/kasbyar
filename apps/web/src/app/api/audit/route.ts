import { apiSuccess, jsonResponse } from '@/lib/api-response';
import { handleApiError, isApiError, requireApiRole, requireApiSession } from '@/lib/api-auth';
import { listAuditEvents } from '@/server/audit/audit.service';

export async function GET(request: Request) {
  try {
    const session = await requireApiSession();
    if (isApiError(session)) return session;

    const denied = requireApiRole(session, 'ADMIN');
    if (denied) return denied;

    const { searchParams } = new URL(request.url);
    const page = Number(searchParams.get('page') ?? '1');
    const action = searchParams.get('action') ?? undefined;

    const data = await listAuditEvents(session.organizationId, { page, action });
    return jsonResponse(apiSuccess(data));
  } catch (error) {
    return handleApiError(error, 'audit.GET');
  }
}
