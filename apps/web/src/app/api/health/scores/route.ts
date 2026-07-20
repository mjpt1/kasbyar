import { apiSuccess, jsonResponse } from '@/lib/api-response';
import { handleApiError, isApiError, requireApiSession } from '@/lib/api-auth';
import {
  computeHealthScores,
  getHealthScoreTrend,
  getLatestHealthScores,
} from '@/server/health/health-score.service';
import type { HealthDimension } from '@prisma/client';

export async function GET(request: Request) {
  try {
    const session = await requireApiSession();
    if (isApiError(session)) return session;

    const { searchParams } = new URL(request.url);
    const refresh = searchParams.get('refresh') === 'true';
    const dimension = searchParams.get('dimension') as HealthDimension | null;
    const trendDays = Number(searchParams.get('trendDays') ?? 0);

    if (dimension && trendDays > 0) {
      const trend = await getHealthScoreTrend(
        session.organizationId,
        dimension,
        trendDays,
      );
      return jsonResponse(apiSuccess({ trend }));
    }

    const scores = refresh
      ? await computeHealthScores(session.organizationId)
      : await getLatestHealthScores(session.organizationId);

    return jsonResponse(apiSuccess({ scores }));
  } catch (error) {
    return handleApiError(error, 'health.scores.GET');
  }
}
