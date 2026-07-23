import {
  ORG_MODULE_CATALOG,
  buildDefaultModuleToggles,
  isOrgModuleEnabled,
} from '@kesbyar/shared';

import { prisma } from '@/lib/prisma';
import { AppError, ForbiddenError } from '@/lib/errors';

type OrgSettingsJson = {
  modules?: Record<string, { enabled?: boolean }>;
};

function readSettingsModules(settings: unknown): Record<string, { enabled?: boolean }> {
  if (!settings || typeof settings !== 'object') return {};
  const modules = (settings as OrgSettingsJson).modules;
  return modules && typeof modules === 'object' ? modules : {};
}

export async function getOrgModuleToggles(
  organizationId: string,
): Promise<Record<string, boolean>> {
  const [rows, org] = await Promise.all([
    prisma.orgModuleToggle.findMany({
      where: { organizationId },
      select: { moduleKey: true, enabled: true },
    }),
    prisma.organization.findUnique({
      where: { id: organizationId },
      select: { settings: true },
    }),
  ]);

  const toggles = buildDefaultModuleToggles();
  const rowKeys = new Set(rows.map((row) => row.moduleKey));

  for (const row of rows) {
    toggles[row.moduleKey] = row.enabled;
  }

  // Legacy: platform toggles stored in organization.settings.modules
  const stored = readSettingsModules(org?.settings);
  for (const mod of ORG_MODULE_CATALOG) {
    if (rowKeys.has(mod.key)) continue;
    const storedEnabled = stored[mod.key]?.enabled;
    if (storedEnabled !== undefined) {
      toggles[mod.key] = storedEnabled;
    }
  }

  return toggles;
}

export async function requireOrgModule(organizationId: string, moduleKey: string) {
  const toggles = await getOrgModuleToggles(organizationId);
  if (!isOrgModuleEnabled(toggles, moduleKey)) {
    const mod = ORG_MODULE_CATALOG.find((m) => m.key === moduleKey);
    const label = mod?.nameFa ?? 'این ماژول';
    throw new ForbiddenError(`${label} برای سازمان شما غیرفعال است. از بخش افزونه‌ها در پلتفرم می‌توانید آن را فعال کنید.`);
  }
}

export async function setOrgModuleEnabled(
  organizationId: string,
  moduleKey: string,
  enabled: boolean,
) {
  const known = ORG_MODULE_CATALOG.some((m) => m.key === moduleKey);
  if (!known) {
    throw new AppError('ماژول نامعتبر است', 'INVALID_MODULE', 400);
  }

  const org = await prisma.organization.findUnique({
    where: { id: organizationId },
    select: { settings: true },
  });
  const current = (org?.settings ?? {}) as OrgSettingsJson;
  const modules = { ...readSettingsModules(current), [moduleKey]: { enabled } };

  await prisma.organization.update({
    where: { id: organizationId },
    data: {
      settings: {
        ...current,
        modules,
      },
    },
  });

  return prisma.orgModuleToggle.upsert({
    where: {
      organizationId_moduleKey: { organizationId, moduleKey },
    },
    create: { organizationId, moduleKey, enabled },
    update: { enabled },
  });
}

export async function listOrgModulesForUi(organizationId: string) {
  const toggles = await getOrgModuleToggles(organizationId);
  return ORG_MODULE_CATALOG.map((mod) => ({
    ...mod,
    enabled: isOrgModuleEnabled(toggles, mod.key),
  }));
}
