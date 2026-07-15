import type { IndustryPack } from '@prisma/client';

import { isApiError, requireApiSession } from '@/lib/api-auth';
import { ForbiddenError, PlanUpgradeRequiredError } from '@/lib/errors';
import { requirePackWithEntitlement } from '@/server/packs/pack-context';

function planErrorResponse(error: PlanUpgradeRequiredError) {
  return new Response(
    JSON.stringify({
      success: false,
      error: {
        code: error.code,
        message: error.message,
        reason: error.reason,
        suggestedPlan: error.suggestedPlan,
      },
    }),
    { status: 403, headers: { 'Content-Type': 'application/json' } },
  );
}

export async function requireApiPack(expected: IndustryPack) {
  const session = await requireApiSession();
  if (isApiError(session)) return session;

  try {
    const ctx = await requirePackWithEntitlement(session.organizationId, expected);
    return { session, ctx };
  } catch (error) {
    if (error instanceof PlanUpgradeRequiredError) {
      return planErrorResponse(error);
    }
    if (error instanceof ForbiddenError) {
      return new Response(
        JSON.stringify({
          success: false,
          error: { code: 'FORBIDDEN', message: error.message },
        }),
        { status: 403, headers: { 'Content-Type': 'application/json' } },
      );
    }
    throw error;
  }
}
