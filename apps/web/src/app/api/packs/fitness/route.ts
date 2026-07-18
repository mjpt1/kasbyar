import { apiSuccess, jsonResponse } from '@/lib/api-response';
import { handleApiError } from '@/lib/api-auth';
import {
  createGymClass,
  createGymMembership,
  listGymClasses,
  listGymMemberships,
} from '@/server/packs/fitness/fitness.service';
import { requireApiPack } from '@/server/packs/require-api-pack';

export async function GET(request: Request) {
  try {
    const auth = await requireApiPack('FITNESS');
    if (auth instanceof Response) return auth;

    const { searchParams } = new URL(request.url);
    const mode = searchParams.get('mode') ?? 'memberships';
    const page = Number(searchParams.get('page') ?? 1);

    if (mode === 'classes') {
      const data = await listGymClasses(auth.session.organizationId, { page });
      return jsonResponse(apiSuccess(data));
    }

    const status = searchParams.get('status') ?? undefined;
    const data = await listGymMemberships(auth.session.organizationId, { status, page });
    return jsonResponse(apiSuccess(data));
  } catch (error) {
    return handleApiError(error, 'fitness.GET');
  }
}

export async function POST(request: Request) {
  try {
    const auth = await requireApiPack('FITNESS');
    if (auth instanceof Response) return auth;

    const body = await request.json();
    const mode = body.mode ?? 'membership';

    if (mode === 'class') {
      if (!body.title || !body.scheduledAt) {
        return jsonResponse(
          { success: false, error: { code: 'VALIDATION', message: 'title و scheduledAt الزامی است' } },
          400,
        );
      }
      const gymClass = await createGymClass(auth.session.organizationId, {
        title: body.title,
        coach: body.coach,
        scheduledAt: new Date(body.scheduledAt),
        capacity: body.capacity ?? 15,
      });
      return jsonResponse(apiSuccess(gymClass), 201);
    }

    if (!body.customerId || !body.planName || !body.startsAt || !body.endsAt) {
      return jsonResponse(
        {
          success: false,
          error: { code: 'VALIDATION', message: 'customerId, planName, startsAt, endsAt الزامی است' },
        },
        400,
      );
    }

    const membership = await createGymMembership(auth.session.organizationId, {
      customerId: body.customerId,
      planName: body.planName,
      startsAt: new Date(body.startsAt),
      endsAt: new Date(body.endsAt),
      status: body.status ?? 'ACTIVE',
    });

    return jsonResponse(apiSuccess(membership), 201);
  } catch (error) {
    return handleApiError(error, 'fitness.POST');
  }
}
