import { apiSuccess, jsonResponse } from '@/lib/api-response';
import { isApiError, requireApiSession } from '@/lib/api-auth';
import { getCatalog } from '@/server/catalog/catalog.service';

export async function GET() {
  const session = await requireApiSession();
  if (isApiError(session)) return session;

  const catalog = await getCatalog(session.organizationId);
  return jsonResponse(apiSuccess(catalog));
}
