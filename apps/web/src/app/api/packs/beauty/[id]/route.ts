import { z } from 'zod';

import { apiSuccess, jsonResponse } from '@/lib/api-response';
import { handleApiError } from '@/lib/api-auth';
import { parseBody } from '@/lib/validators/parse';
import { updateBeautyAppointment } from '@/server/packs/beauty/beauty.service';
import { requireApiPack } from '@/server/packs/require-api-pack';

const beautyAppointmentUpdateSchema = z.object({
  status: z
    .enum(['SCHEDULED', 'CONFIRMED', 'COMPLETED', 'CANCELLED', 'NO_SHOW'])
    .optional(),
  serviceName: z.string().min(1).optional(),
  scheduledAt: z.coerce.date().optional(),
  durationMin: z.coerce.number().int().min(15).max(480).optional(),
  stylistName: z.string().optional().nullable(),
  notes: z.string().optional().nullable(),
  price: z.coerce.number().optional().nullable(),
});

export async function PATCH(
  request: Request,
  context: { params: Promise<{ id: string }> },
) {
  try {
    const auth = await requireApiPack('BEAUTY_SALON');
    if (auth instanceof Response) return auth;

    const { id } = await context.params;
    const body = await request.json();
    const parsed = parseBody(beautyAppointmentUpdateSchema, body);
    if (!parsed.ok) return parsed.response;

    const appointment = await updateBeautyAppointment(auth.session.organizationId, id, {
      status: parsed.data.status,
      serviceName: parsed.data.serviceName,
      scheduledAt: parsed.data.scheduledAt,
      durationMin: parsed.data.durationMin,
      stylistName: parsed.data.stylistName,
      notes: parsed.data.notes,
      price: parsed.data.price ?? undefined,
    });

    if (!appointment) {
      return jsonResponse(
        { success: false, error: { code: 'NOT_FOUND', message: 'نوبت یافت نشد' } },
        404,
      );
    }

    return jsonResponse(apiSuccess(appointment));
  } catch (error) {
    return handleApiError(error, 'beauty.appointments.PATCH');
  }
}
