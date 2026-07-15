import { DEMO_INVESTOR_ORDER, DEMO_SCENARIO_LIST, DEMO_PERSONAS, SALES_WALKTHROUGH_INTRO, INVESTOR_WALKTHROUGH_INTRO } from '@kesbyar/shared';

import { apiSuccess, jsonResponse } from '@/lib/api-response';
import { canShowDemoControls } from '@/lib/demo';

export async function GET() {
  if (!canShowDemoControls()) {
    return jsonResponse(
      { success: false, error: { code: 'DISABLED', message: 'حالت نمایش غیرفعال است' } },
      404,
    );
  }

  return jsonResponse(
    apiSuccess({
      scenarios: DEMO_SCENARIO_LIST,
      salesOrder: DEMO_SCENARIO_LIST,
      investorOrder: DEMO_INVESTOR_ORDER,
      personas: DEMO_PERSONAS,
      salesIntro: SALES_WALKTHROUGH_INTRO,
      investorIntro: INVESTOR_WALKTHROUGH_INTRO,
    }),
  );
}
