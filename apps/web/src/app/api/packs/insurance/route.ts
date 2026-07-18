import { apiSuccess, jsonResponse } from '@/lib/api-response';
import { handleApiError } from '@/lib/api-auth';
import { createInsurancePolicy, listInsurancePolicies } from '@/server/packs/insurance/insurance.service';
import { requireApiPack } from '@/server/packs/require-api-pack';

export async function GET(request: Request) {
  try {
    const auth = await requireApiPack('INSURANCE_AGENCY');
    if (auth instanceof Response) return auth;

    const { searchParams } = new URL(request.url);
    const status = searchParams.get('status') ?? undefined;
    const page = Number(searchParams.get('page') ?? 1);

    const data = await listInsurancePolicies(auth.session.organizationId, { status, page });
    return jsonResponse(apiSuccess(data));
  } catch (error) {
    return handleApiError(error, 'insurance.GET');
  }
}

export async function POST(request: Request) {
  try {
    const auth = await requireApiPack('INSURANCE_AGENCY');
    if (auth instanceof Response) return auth;

    const body = await request.json();
    if (!body.customerId || !body.policyNumber || !body.policyType) {
      return jsonResponse(
        {
          success: false,
          error: { code: 'VALIDATION', message: 'customerId، policyNumber و policyType الزامی است' },
        },
        400,
      );
    }

    const item = await createInsurancePolicy(auth.session.organizationId, {
      customerId: body.customerId,
      policyNumber: body.policyNumber,
      policyType: body.policyType,
      status: body.status ?? 'ACTIVE',
      premium: body.premium,
      startsAt: body.startsAt ? new Date(body.startsAt) : undefined,
      expiresAt: body.expiresAt ? new Date(body.expiresAt) : undefined,
      notes: body.notes,
    });

    return jsonResponse(apiSuccess(item), 201);
  } catch (error) {
    return handleApiError(error, 'insurance.POST');
  }
}
