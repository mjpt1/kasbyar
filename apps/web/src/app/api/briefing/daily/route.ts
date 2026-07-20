import { apiSuccess, jsonResponse } from '@/lib/api-response';
import { handleApiError, isApiError, requireApiSession } from '@/lib/api-auth';
import { buildDailyBriefing } from '@/server/briefing/briefing.service';

export async function GET() {
  try {
    const session = await requireApiSession();
    if (isApiError(session)) return session;

    const briefing = await buildDailyBriefing(
      session.organizationId,
      session.user.name,
    );

    return jsonResponse(apiSuccess(briefing));
  } catch (error) {
    return handleApiError(error, 'briefing.daily.GET');
  }
}
