import { IndustryPack } from '@prisma/client';
import { getSpecialty, listSpecialties, PACK_REGISTRY, type IndustryPackId } from '@kesbyar/shared';

import { prisma } from '@/lib/prisma';
import { AppError, ForbiddenError, NotFoundError } from '@/lib/errors';
import { getDefaultHomePath } from '@/lib/permissions';

const PACK_IDS = new Set(Object.keys(PACK_REGISTRY));

export function needsOnboarding(
  role: string,
  industrySpecialty: string | null | undefined,
): boolean {
  if (role !== 'OWNER' && role !== 'ADMIN') return false;
  return !industrySpecialty?.trim();
}

export interface CompleteOnboardingInput {
  name: string;
  industryPack: string;
  industrySpecialty: string;
}

export async function completeOnboarding(
  organizationId: string,
  role: string,
  input: CompleteOnboardingInput,
) {
  if (role !== 'OWNER' && role !== 'ADMIN') {
    throw new ForbiddenError('فقط مالک یا مدیر می‌تواند راه‌اندازی را تکمیل کند');
  }

  const name = input.name.trim();
  if (name.length < 2) {
    throw new AppError('نام کسب‌وکار را وارد کنید', 'VALIDATION_ERROR', 400);
  }

  if (!PACK_IDS.has(input.industryPack)) {
    throw new AppError('بستهٔ شغلی نامعتبر است', 'VALIDATION_ERROR', 400);
  }

  const specialty = getSpecialty(input.industrySpecialty);
  if (!specialty) {
    throw new AppError('تخصص نامعتبر است', 'VALIDATION_ERROR', 400);
  }
  if (specialty.basePack !== input.industryPack) {
    throw new AppError('تخصص با بستهٔ شغلی هم‌خوانی ندارد', 'VALIDATION_ERROR', 400);
  }

  const org = await prisma.organization.findUnique({ where: { id: organizationId } });
  if (!org) throw new NotFoundError('سازمان');

  const updated = await prisma.organization.update({
    where: { id: organizationId },
    data: {
      name,
      industryPack: input.industryPack as IndustryPack,
      industrySpecialty: specialty.id,
      settings: {
        ...(typeof org.settings === 'object' && org.settings && !Array.isArray(org.settings)
          ? (org.settings as Record<string, unknown>)
          : {}),
        onboardingCompleted: true,
        onboardingCompletedAt: new Date().toISOString(),
      },
    },
  });

  return {
    organization: updated,
    homePath: getDefaultHomePath(
      role as 'OWNER' | 'ADMIN',
      updated.industryPack,
      updated.industrySpecialty,
    ),
  };
}

export function listOnboardingOptions() {
  const packs = Object.values(PACK_REGISTRY).map((p) => ({
    id: p.id,
    label: p.label,
    description: p.description,
  }));
  const specialties = listSpecialties().map((s) => ({
    id: s.id,
    label: s.label,
    description: s.description,
    basePack: s.basePack as IndustryPackId,
  }));
  return { packs, specialties };
}

export function assertPackSpecialtyMatch(pack: string, specialtyId: string) {
  const specialty = getSpecialty(specialtyId);
  if (!specialty) throw new AppError('تخصص نامعتبر', 'VALIDATION_ERROR', 400);
  if (specialty.basePack !== pack) {
    throw new AppError('تخصص با بسته هم‌خوان نیست', 'VALIDATION_ERROR', 400);
  }
  return specialty;
}
