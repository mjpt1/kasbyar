import {
  ORG_MODULE_BY_KEY,
  ORG_MODULE_CATALOG,
  isOrgModuleEnabled,
  type OrgModuleDefinition,
} from '@kesbyar/shared';
import type { MembershipRole } from '@prisma/client';

import { ForbiddenError } from '@/lib/errors';
import { canManageSettings } from '@/lib/permissions';
import { prisma } from '@/lib/prisma';
import {
  getOrgModuleToggles,
  setOrgModuleEnabled as persistOrgModuleToggle,
} from '@/server/modules/org-module.service';
import {
  ORG_INTEGRATION,
  type OrgIntegrationsPublicView,
  getOrgIntegrationsPublicView,
} from '@/server/integrations/org-credentials.service';

export type OrgModuleListItem = OrgModuleDefinition & {
  enabled: boolean;
  configured: boolean;
  statusLabel: string;
  statusVariant: 'default' | 'secondary' | 'outline' | 'destructive';
};

function integrationConfigured(
  integrations: OrgIntegrationsPublicView,
  provider: OrgModuleDefinition['integrationProvider'],
): boolean {
  if (!provider) return true;
  if (provider === 'payment') {
    return integrations.payment.status === 'active';
  }
  if (provider === 'kavenegar') {
    return integrations.sms.configured;
  }
  if (provider === 'moadian') {
    return integrations.moadian.configured;
  }
  return false;
}

function integrationActiveFromConfigs(
  configs: Awaited<ReturnType<typeof loadIntegrationFlags>>,
  provider: OrgModuleDefinition['integrationProvider'],
): boolean {
  if (!provider) return true;
  if (provider === 'payment') return configs.paymentActive;
  if (provider === 'kavenegar') return configs.smsActive;
  return configs.moadianActive;
}

async function loadIntegrationFlags(organizationId: string) {
  const rows = await prisma.integrationConfig.findMany({
    where: { organizationId },
    select: { provider: true, isActive: true },
  });
  const byProvider = Object.fromEntries(rows.map((r) => [r.provider, r.isActive]));
  return {
    paymentActive: byProvider[ORG_INTEGRATION.PAYMENT] ?? true,
    smsActive: byProvider[ORG_INTEGRATION.KAVENEGAR] ?? true,
    moadianActive: byProvider[ORG_INTEGRATION.MOADIAN] ?? true,
  };
}

function statusForModule(
  def: OrgModuleDefinition,
  enabled: boolean,
  configured: boolean,
  integrationFlags: Awaited<ReturnType<typeof loadIntegrationFlags>>,
): { statusLabel: string; statusVariant: OrgModuleListItem['statusVariant'] } {
  if (!enabled) {
    return { statusLabel: 'غیرفعال', statusVariant: 'secondary' };
  }
  if (def.integrationProvider) {
    if (!configured) {
      return { statusLabel: 'نیاز به پیکربندی', statusVariant: 'outline' };
    }
    const active = integrationActiveFromConfigs(integrationFlags, def.integrationProvider);
    return active
      ? { statusLabel: 'فعال', statusVariant: 'default' }
      : { statusLabel: 'پیکربندی‌شده — خاموش', statusVariant: 'outline' };
  }
  return { statusLabel: 'فعال', statusVariant: 'default' };
}

export async function listOrgModules(organizationId: string): Promise<OrgModuleListItem[]> {
  const [toggles, integrations, integrationFlags] = await Promise.all([
    getOrgModuleToggles(organizationId),
    getOrgIntegrationsPublicView(organizationId),
    loadIntegrationFlags(organizationId),
  ]);

  return ORG_MODULE_CATALOG.map((def) => {
    const enabled = isOrgModuleEnabled(toggles, def.key);
    const configured = integrationConfigured(integrations, def.integrationProvider);
    const { statusLabel, statusVariant } = statusForModule(
      def,
      enabled,
      configured,
      integrationFlags,
    );
    return {
      ...def,
      enabled,
      configured,
      statusLabel,
      statusVariant,
    };
  });
}

async function setIntegrationActive(
  organizationId: string,
  provider: NonNullable<OrgModuleDefinition['integrationProvider']>,
  enabled: boolean,
) {
  const providerKey =
    provider === 'payment'
      ? ORG_INTEGRATION.PAYMENT
      : provider === 'kavenegar'
        ? ORG_INTEGRATION.KAVENEGAR
        : ORG_INTEGRATION.MOADIAN;

  const label =
    provider === 'payment'
      ? 'درگاه پرداخت'
      : provider === 'kavenegar'
        ? 'پیامک کاوه‌نگار'
        : 'سامانه مؤدیان';

  await prisma.integrationConfig.upsert({
    where: {
      organizationId_provider: { organizationId, provider: providerKey },
    },
    create: {
      organizationId,
      provider: providerKey,
      label,
      isActive: enabled,
    },
    update: { isActive: enabled },
  });
}

export async function setOrgModuleEnabled(
  organizationId: string,
  role: MembershipRole,
  moduleKey: string,
  enabled: boolean,
) {
  if (!canManageSettings(role)) {
    throw new ForbiddenError('فقط مالک یا مدیر می‌تواند افزونه‌ها را مدیریت کند');
  }

  const def = ORG_MODULE_BY_KEY[moduleKey];
  if (!def) {
    throw new ForbiddenError('ماژول نامعتبر است');
  }

  await persistOrgModuleToggle(organizationId, moduleKey, enabled);

  if (def.integrationProvider) {
    await setIntegrationActive(organizationId, def.integrationProvider, enabled);
  }

  return listOrgModules(organizationId);
}
