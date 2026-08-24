import { apiSuccess, jsonResponse } from '@/lib/api-response';
import { handleApiError } from '@/lib/api-auth';
import { appointmentUpdateSchema } from '@/lib/validators';
import { parseBody } from '@/lib/validators/parse';
import { updateAppointment } from '@/server/packs/clinic/clinic.service';
import { requireApiPack } from '@/server/packs/require-api-pack';

export async function PATCH(
  request: Request,
  context: { params: Promise<{ id: string }> },
) {
  try {
    const auth = await requireApiPack('CLINIC');
    if (auth instanceof Response) return auth;

    const { id } = await context.params;
    const body = await request.json();
    const parsed = parseBody(appointmentUpdateSchema, body);
    if (!parsed.ok) return parsed.response;

    const appointment = await updateAppointment(auth.session.organizationId, id, {
      status: parsed.data.status,
      scheduledAt: parsed.data.scheduledAt,
      durationMin: parsed.data.durationMin,
      reason: parsed.data.reason,
      notes: parsed.data.notes,
      followUpAt: parsed.data.followUpAt,
    });

    if (!appointment) {
      return jsonResponse(
        { success: false, error: { code: 'NOT_FOUND', message: 'نوبت یافت نشد' } },
        404,
      );
    }

    return jsonResponse(apiSuccess(appointment));
  } catch (error) {
    return handleApiError(error, 'clinic.appointments.PATCH');
  }
}
