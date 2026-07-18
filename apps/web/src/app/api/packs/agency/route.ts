import { apiSuccess, jsonResponse } from '@/lib/api-response';
import { handleApiError } from '@/lib/api-auth';
import { createMarketingCampaign, listMarketingCampaigns } from '@/server/packs/agency/agency.service';
import { requireApiPack } from '@/server/packs/require-api-pack';

export async function GET(request: Request) {
  try {
    const auth = await requireApiPack('MARKETING_AGENCY');
    if (auth instanceof Response) return auth;

    const { searchParams } = new URL(request.url);
    const status = searchParams.get('status') ?? undefined;
    const page = Number(searchParams.get('page') ?? 1);

    const data = await listMarketingCampaigns(auth.session.organizationId, { status, page });
    return jsonResponse(apiSuccess(data));
  } catch (error) {
    return handleApiError(error, 'agency.GET');
  }
}

export async function POST(request: Request) {
  try {
    const auth = await requireApiPack('MARKETING_AGENCY');
    if (auth instanceof Response) return auth;

    const body = await request.json();
    if (!body.customerId || !body.title) {
      return jsonResponse(
        {
          success: false,
          error: { code: 'VALIDATION', message: 'customerId و title الزامی است' },
        },
        400,
      );
    }

    const item = await createMarketingCampaign(auth.session.organizationId, {
      customerId: body.customerId,
      title: body.title,
      channel: body.channel,
      status: body.status ?? 'PLANNED',
      budget: body.budget,
      startDate: body.startDate ? new Date(body.startDate) : undefined,
      endDate: body.endDate ? new Date(body.endDate) : undefined,
      notes: body.notes,
    });

    return jsonResponse(apiSuccess(item), 201);
  } catch (error) {
    return handleApiError(error, 'agency.POST');
  }
}
