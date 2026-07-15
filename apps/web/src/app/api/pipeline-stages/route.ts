import { apiSuccess, jsonResponse } from '@/lib/api-response';
import { isApiError, requireApiSession } from '@/lib/api-auth';
import { listPipelineStages } from '@/server/leads/lead.service';

export async function GET() {
  const session = await requireApiSession();
  if (isApiError(session)) return session;

  const stages = await listPipelineStages(session.organizationId);
  return jsonResponse(apiSuccess(stages));
}
