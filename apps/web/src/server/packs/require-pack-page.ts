import { redirect } from 'next/navigation';
import type { IndustryPack } from '@prisma/client';

import { requireSession } from '@/lib/auth/session';
import { PlanUpgradeRequiredError } from '@/lib/errors';
import { getDefaultHomePath } from '@/lib/permissions';
import { requirePackWithEntitlement } from '@/server/packs/pack-context';
import type { MembershipRole } from '@prisma/client';

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
    redirect(
      getDefaultHomePath(
        session.role as MembershipRole,
        session.industryPack,
        session.industrySpecialty,
      ),
    );
  }
}
