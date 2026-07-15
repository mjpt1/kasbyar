import { apiSuccess, errorResponse, jsonResponse } from '@/lib/api-response';
import { isApiError, requireApiSession } from '@/lib/api-auth';
import { listOrganizationMembers } from '@/server/settings/settings.service';

export async function GET() {
  const session = await requireApiSession();
  if (isApiError(session)) return session;

  const members = await listOrganizationMembers(session.organizationId);
  return jsonResponse(apiSuccess(members));
}
