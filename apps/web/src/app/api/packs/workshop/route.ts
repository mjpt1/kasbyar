import { apiSuccess, jsonResponse } from '@/lib/api-response';
import { handleApiError } from '@/lib/api-auth';
import { createRepairJob, listRepairJobs } from '@/server/packs/workshop/workshop.service';
import { requireApiPack } from '@/server/packs/require-api-pack';

export async function GET(request: Request) {
  try {
    const auth = await requireApiPack('WORKSHOP');
    if (auth instanceof Response) return auth;

    const { searchParams } = new URL(request.url);
    const status = searchParams.get('status') ?? undefined;
    const page = Number(searchParams.get('page') ?? 1);

    const data = await listRepairJobs(auth.session.organizationId, { status, page });
    return jsonResponse(apiSuccess(data));
  } catch (error) {
    return handleApiError(error, 'workshop.GET');
  }
}

export async function POST(request: Request) {
  try {
    const auth = await requireApiPack('WORKSHOP');
    if (auth instanceof Response) return auth;

    const body = await request.json();
    if (!body.customerId || !body.deviceLabel || !body.issue) {
      return jsonResponse(
        {
          success: false,
          error: { code: 'VALIDATION', message: 'customerId, deviceLabel, issue الزامی است' },
        },
        400,
      );
    }

    const job = await createRepairJob(auth.session.organizationId, {
      customerId: body.customerId,
      deviceLabel: body.deviceLabel,
      issue: body.issue,
      status: body.status ?? 'INTAKE',
      quotedAmount: body.quotedAmount,
      notes: body.notes,
    });

    return jsonResponse(apiSuccess(job), 201);
  } catch (error) {
    return handleApiError(error, 'workshop.POST');
  }
}
