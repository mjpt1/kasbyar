import { apiSuccess, jsonResponse } from '@/lib/api-response';
import { handleApiError } from '@/lib/api-auth';
import {
  createBeautyAppointment,
  listBeautyAppointments,
} from '@/server/packs/beauty/beauty.service';
import { requireApiPack } from '@/server/packs/require-api-pack';

export async function GET(request: Request) {
  try {
    const auth = await requireApiPack('BEAUTY_SALON');
    if (auth instanceof Response) return auth;

    const { searchParams } = new URL(request.url);
    const status = searchParams.get('status') ?? undefined;
    const page = Number(searchParams.get('page') ?? 1);

    const data = await listBeautyAppointments(auth.session.organizationId, { status, page });
    return jsonResponse(apiSuccess(data));
  } catch (error) {
    return handleApiError(error, 'beauty.GET');
  }
}

export async function POST(request: Request) {
  try {
    const auth = await requireApiPack('BEAUTY_SALON');
    if (auth instanceof Response) return auth;

    const body = await request.json();
    if (!body.customerId || !body.serviceName || !body.scheduledAt) {
      return jsonResponse(
        { success: false, error: { code: 'VALIDATION', message: 'customerId, serviceName, scheduledAt الزامی است' } },
        400,
      );
    }

    const appointment = await createBeautyAppointment(auth.session.organizationId, {
      customerId: body.customerId,
      serviceName: body.serviceName,
      scheduledAt: new Date(body.scheduledAt),
      stylistName: body.stylistName,
      durationMin: body.durationMin ?? 60,
      status: body.status ?? 'SCHEDULED',
      price: body.price,
      notes: body.notes,
    });

    return jsonResponse(apiSuccess(appointment), 201);
  } catch (error) {
    return handleApiError(error, 'beauty.POST');
  }
}
