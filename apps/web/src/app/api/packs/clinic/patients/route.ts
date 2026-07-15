import { apiSuccess, jsonResponse } from '@/lib/api-response';
import { handleApiError } from '@/lib/api-auth';
import { patientProfileSchema } from '@/lib/validators';
import { parseBody } from '@/lib/validators/parse';
import { ensurePatientProfile, listPatients } from '@/server/packs/clinic/clinic.service';
import { requireApiPack } from '@/server/packs/require-api-pack';

export async function GET(request: Request) {
  try {
    const auth = await requireApiPack('CLINIC');
    if (auth instanceof Response) return auth;

    const { searchParams } = new URL(request.url);
    const search = searchParams.get('search') ?? undefined;
    const page = Number(searchParams.get('page') ?? 1);

    const data = await listPatients(auth.session.organizationId, { search, page });
    return jsonResponse(apiSuccess(data));
  } catch (error) {
    return handleApiError(error, 'clinic.patients.GET');
  }
}

export async function POST(request: Request) {
  try {
    const auth = await requireApiPack('CLINIC');
    if (auth instanceof Response) return auth;

    const body = await request.json();
    const parsed = parseBody(patientProfileSchema, body);
    if (!parsed.ok) return parsed.response;

    const profile = await ensurePatientProfile(
      auth.session.organizationId,
      parsed.data.customerId,
      {
        fileNumber: parsed.data.fileNumber,
        allergies: parsed.data.allergies,
        notes: parsed.data.notes,
      },
    );

    if (!profile) {
      return jsonResponse(
        { success: false, error: { code: 'NOT_FOUND', message: 'مشتری یافت نشد' } },
        404,
      );
    }

    return jsonResponse(apiSuccess(profile), 201);
  } catch (error) {
    return handleApiError(error, 'clinic.patients.POST');
  }
}
