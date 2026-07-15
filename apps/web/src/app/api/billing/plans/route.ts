import { listPublicPlans } from '@kesbyar/shared';

import { apiSuccess, jsonResponse } from '@/lib/api-response';
import { handleApiError } from '@/lib/api-auth';

export async function GET() {
  try {
    const plans = listPublicPlans().map((p) => ({
      code: p.code,
      name: p.name,
      description: p.description,
      priceMonthlyIrr: p.priceMonthlyIrr,
      priceYearlyIrr: p.priceYearlyIrr,
      features: p.features,
      quotas: p.quotas,
      packs: p.packs,
      highlighted: p.highlighted ?? false,
    }));
    return jsonResponse(apiSuccess(plans));
  } catch (error) {
    return handleApiError(error, 'billing.plans.GET');
  }
}
