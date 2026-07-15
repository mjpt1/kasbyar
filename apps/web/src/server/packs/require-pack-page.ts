import { redirect } from 'next/navigation';
import type { IndustryPack } from '@prisma/client';

import { requireSession } from '@/lib/auth/session';
import { ForbiddenError, PlanUpgradeRequiredError } from '@/lib/errors';
import { requirePackWithEntitlement } from '@/server/packs/pack-context';

export async function requirePackPage(expected: IndustryPack) {
  const session = await requireSession();

  try {
    const ctx = await requirePackWithEntitlement(session.organizationId, expected);
    return { session, ctx };
  } catch (error) {
    if (error instanceof PlanUpgradeRequiredError) {
      redirect(
        `/settings/billing?upgrade=pack&suggested=${error.suggestedPlan ?? 'STARTER'}`,
      );
    }
    if (error instanceof ForbiddenError) {
      redirect('/dashboard');
    }
    redirect('/dashboard');
  }
}
