import { apiSuccess, jsonResponse } from '@/lib/api-response';
import { handleApiError } from '@/lib/api-auth';
import { visitRecordSchema } from '@/lib/validators';
import { parseBody } from '@/lib/validators/parse';
import { createVisitRecord, listVisitRecords } from '@/server/packs/clinic/clinic.service';
import { requireApiPack } from '@/server/packs/require-api-pack';

export async function GET(request: Request) {
  try {
    const auth = await requireApiPack('CLINIC');
    if (auth instanceof Response) return auth;

    const { searchParams } = new URL(request.url);
    const customerId = searchParams.get('customerId') ?? undefined;
    const page = Number(searchParams.get('page') ?? 1);

    const data = await listVisitRecords(auth.session.organizationId, { customerId, page });
    return jsonResponse(apiSuccess(data));
  } catch (error) {
    return handleApiError(error, 'clinic.visits.GET');
  }
}

export async function POST(request: Request) {
  try {
    const auth = await requireApiPack('CLINIC');
    if (auth instanceof Response) return auth;

    const body = await request.json();
    const parsed = parseBody(visitRecordSchema, body);
    if (!parsed.ok) return parsed.response;

    const visit = await createVisitRecord(auth.session.organizationId, {
      customerId: parsed.data.customerId,
      practitionerId: parsed.data.practitionerId,
      appointmentId: parsed.data.appointmentId,
      visitDate: parsed.data.visitDate ?? new Date(),
      chiefComplaint: parsed.data.chiefComplaint,
      diagnosis: parsed.data.diagnosis,
      treatmentNotes: parsed.data.treatmentNotes,
      followUpAt: parsed.data.followUpAt ?? undefined,
    });

    return jsonResponse(apiSuccess(visit), 201);
  } catch (error) {
    return handleApiError(error, 'clinic.visits.POST');
  }
}
