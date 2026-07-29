import { apiSuccess, jsonResponse } from '@/lib/api-response';
import { handleApiError, isApiError, requireApiSession } from '@/lib/api-auth';
import { activityLogSchema } from '@/lib/validators';
import { parseBody } from '@/lib/validators/parse';
import {
  createManualActivity,
  listRecentActivities,
} from '@/server/activities/activity.service';

export async function GET(request: Request) {
  try {
    const session = await requireApiSession();
    if (isApiError(session)) return session;

    const { searchParams } = new URL(request.url);
    const page = Number(searchParams.get('page') ?? 1);
    const type = searchParams.get('type') ?? undefined;
    const userId = searchParams.get('userId') ?? undefined;

    const data = await listRecentActivities(session.organizationId, {
      page,
      type,
      userId,
    });
    return jsonResponse(apiSuccess(data));
  } catch (error) {
    return handleApiError(error, 'activities.GET');
  }
}

export async function POST(request: Request) {
  try {
    const session = await requireApiSession();
    if (isApiError(session)) return session;

    const body = await request.json();
    const parsed = parseBody(activityLogSchema, body);
    if (!parsed.ok) return parsed.response;

    const { durationMinutes, outcome, ...rest } = parsed.data;
    const metadata: Record<string, unknown> = {};
    if (durationMinutes != null) metadata.durationMinutes = durationMinutes;
    if (outcome) metadata.outcome = outcome;

    const activity = await createManualActivity(session.organizationId, session.user.id, {
      ...rest,
      metadata: Object.keys(metadata).length > 0 ? metadata : undefined,
    });

    if (!activity) {
      return jsonResponse(
        {
          success: false,
          error: { code: 'NOT_FOUND', message: 'مشتری یا سرنخ یافت نشد' },
        },
        404,
      );
    }

    return jsonResponse(apiSuccess(activity), 201);
  } catch (error) {
    return handleApiError(error, 'activities.POST');
  }
}
