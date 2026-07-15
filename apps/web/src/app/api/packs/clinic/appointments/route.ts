import { apiSuccess, jsonResponse } from '@/lib/api-response';
import { handleApiError } from '@/lib/api-auth';
import { appointmentSchema } from '@/lib/validators';
import { parseBody } from '@/lib/validators/parse';
import {
  createAppointment,
  listAppointments,
  listTodayAppointments,
} from '@/server/packs/clinic/clinic.service';
import { requireApiPack } from '@/server/packs/require-api-pack';

export async function GET(request: Request) {
  try {
    const auth = await requireApiPack('CLINIC');
    if (auth instanceof Response) return auth;

    const { searchParams } = new URL(request.url);
    const today = searchParams.get('today') === '1';
    const page = Number(searchParams.get('page') ?? 1);

    if (today) {
      const items = await listTodayAppointments(auth.session.organizationId);
      return jsonResponse(apiSuccess({ items, total: items.length }));
    }

    const data = await listAppointments(auth.session.organizationId, { page });
    return jsonResponse(apiSuccess(data));
  } catch (error) {
    return handleApiError(error, 'clinic.appointments.GET');
  }
}

export async function POST(request: Request) {
  try {
    const auth = await requireApiPack('CLINIC');
    if (auth instanceof Response) return auth;

    const body = await request.json();
    const parsed = parseBody(appointmentSchema, body);
    if (!parsed.ok) return parsed.response;

    const appointment = await createAppointment(auth.session.organizationId, {
      customerId: parsed.data.customerId,
      practitionerId: parsed.data.practitionerId,
      scheduledAt: parsed.data.scheduledAt,
      durationMin: parsed.data.durationMin ?? 30,
      reason: parsed.data.reason,
      notes: parsed.data.notes,
      status: parsed.data.status ?? 'SCHEDULED',
      followUpAt: parsed.data.followUpAt ?? undefined,
    });

    return jsonResponse(apiSuccess(appointment), 201);
  } catch (error) {
    return handleApiError(error, 'clinic.appointments.POST');
  }
}
