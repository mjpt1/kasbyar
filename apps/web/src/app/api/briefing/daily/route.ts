import { apiSuccess, jsonResponse } from '@/lib/api-response';
import { handleApiError, isApiError, requireApiRole, requireApiSession } from '@/lib/api-auth';
import {
  buildDailyBriefing,
  notifyDailyBriefingAlerts,
} from '@/server/briefing/briefing.service';

/** Read-only: builds briefing without writing notifications. */
export async function GET() {
  try {
    const session = await requireApiSession();
    if (isApiError(session)) return session;
    const denied = requireApiRole(session, 'STAFF');
    if (denied) return denied;

    const briefing = await buildDailyBriefing(
      session.organizationId,
      session.user.name,
    );

    return jsonResponse(apiSuccess(briefing));
  } catch (error) {
    return handleApiError(error, 'briefing.daily.GET');
  }
}

/** Builds briefing and may notify admins (deduped once per day). Prefer this from the UI. */
export async function POST() {
  try {
    const session = await requireApiSession();
    if (isApiError(session)) return session;
    const denied = requireApiRole(session, 'STAFF');
    if (denied) return denied;

    const briefing = await buildDailyBriefing(
      session.organizationId,
      session.user.name,
    );

    // Fire-and-forget so the response is not blocked by notification writes.
    void notifyDailyBriefingAlerts(session.organizationId, briefing).catch(() => undefined);

    return jsonResponse(apiSuccess(briefing));
  } catch (error) {
    return handleApiError(error, 'briefing.daily.POST');
  }
}
