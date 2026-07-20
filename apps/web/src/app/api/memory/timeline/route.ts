import { apiSuccess, jsonResponse } from '@/lib/api-response';
import { handleApiError, isApiError, requireApiSession } from '@/lib/api-auth';
import { getMemoryTimeline } from '@/server/memory/memory.search';

export async function GET(request: Request) {
  try {
    const session = await requireApiSession();
    if (isApiError(session)) return session;

    const { searchParams } = new URL(request.url);
    const entityType = searchParams.get('entityType') ?? undefined;
    const entityId = searchParams.get('entityId') ?? undefined;
    const limit = Number(searchParams.get('limit') ?? 30);

    const timeline = await getMemoryTimeline(session.organizationId, {
      entityType,
      entityId,
      limit,
    });

    return jsonResponse(apiSuccess(timeline));
  } catch (error) {
    return handleApiError(error, 'memory.timeline.GET');
  }
}
