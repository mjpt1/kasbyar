import { apiSuccess, jsonResponse } from '@/lib/api-response';
import { handleApiError, isApiError, requireApiSession } from '@/lib/api-auth';
import {
  computeForecasts,
  getLatestForecastsByType,
  listForecasts,
} from '@/server/forecast/forecast.service';

export async function GET(request: Request) {
  try {
    const session = await requireApiSession();
    if (isApiError(session)) return session;
    const grouped = new URL(request.url).searchParams.get('grouped');
    if (grouped === '1') {
      return jsonResponse(apiSuccess(await getLatestForecastsByType(session.organizationId)));
    }
    const forecasts = await listForecasts(session.organizationId);
    return jsonResponse(apiSuccess(forecasts));
  } catch (error) {
    return handleApiError(error, 'forecast.GET');
  }
}

export async function POST() {
  try {
    const session = await requireApiSession();
    if (isApiError(session)) return session;
    const forecasts = await computeForecasts(session.organizationId);
    return jsonResponse(apiSuccess(forecasts));
  } catch (error) {
    return handleApiError(error, 'forecast.POST');
  }
}
