import { apiSuccess, jsonResponse } from '@/lib/api-response';
import { handleApiError } from '@/lib/api-auth';
import { createCleaningJob, listCleaningJobs } from '@/server/packs/cleaning/cleaning.service';
import { requireApiPack } from '@/server/packs/require-api-pack';

export async function GET(request: Request) {
  try {
    const auth = await requireApiPack('CLEANING');
    if (auth instanceof Response) return auth;

    const { searchParams } = new URL(request.url);
    const status = searchParams.get('status') ?? undefined;
    const page = Number(searchParams.get('page') ?? 1);

    const data = await listCleaningJobs(auth.session.organizationId, { status, page });
    return jsonResponse(apiSuccess(data));
  } catch (error) {
    return handleApiError(error, 'cleaning.GET');
  }
}

export async function POST(request: Request) {
  try {
    const auth = await requireApiPack('CLEANING');
    if (auth instanceof Response) return auth;

    const body = await request.json();
    if (!body.customerId || !body.address || !body.scheduledAt) {
      return jsonResponse(
        {
          success: false,
          error: { code: 'VALIDATION', message: 'customerId، address و scheduledAt الزامی است' },
        },
        400,
      );
    }

    const item = await createCleaningJob(auth.session.organizationId, {
      customerId: body.customerId,
      address: body.address,
      serviceType: body.serviceType,
      status: body.status ?? 'SCHEDULED',
      scheduledAt: new Date(body.scheduledAt),
      price: body.price,
      notes: body.notes,
    });

    return jsonResponse(apiSuccess(item), 201);
  } catch (error) {
    return handleApiError(error, 'cleaning.POST');
  }
}
