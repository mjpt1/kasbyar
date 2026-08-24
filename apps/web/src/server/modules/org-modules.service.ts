import {
  ORG_MODULE_BY_KEY,
  ORG_MODULE_CATALOG,
  isOrgModuleEnabled,
  isOrgModuleRelevantForPack,
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
  if (provider === 'whatsapp') {
    return integrations.whatsapp.configured;
  }
  if (provider === 'resend') {
    return integrations.email.configured;
  }
  if (provider === 'voip') {
    return integrations.voip.configured;
  }
  if (provider === 'telegram') {
    return integrations.telegram.configured;
  }
  if (provider === 'instagram') {
    return integrations.instagram.configured;
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
  if (provider === 'moadian') return configs.moadianActive;
  if (provider === 'whatsapp') return configs.whatsappActive;
  if (provider === 'resend') return configs.resendActive;
  if (provider === 'telegram') return configs.telegramActive;
  if (provider === 'instagram') return configs.instagramActive;
  return configs.voipActive;
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
    whatsappActive: byProvider[ORG_INTEGRATION.WHATSAPP] ?? true,
    resendActive: byProvider[ORG_INTEGRATION.RESEND] ?? true,
    voipActive: byProvider[ORG_INTEGRATION.VOIP] ?? true,
    telegramActive: byProvider[ORG_INTEGRATION.TELEGRAM] ?? true,
    instagramActive: byProvider[ORG_INTEGRATION.INSTAGRAM] ?? false,
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
  const [toggles, integrations, integrationFlags, org] = await Promise.all([
    getOrgModuleToggles(organizationId),
    getOrgIntegrationsPublicView(organizationId),
    loadIntegrationFlags(organizationId),
    prisma.organization.findUnique({
      where: { id: organizationId },
      select: { industryPack: true },
    }),
  ]);

  const pack = org?.industryPack ?? 'GENERAL';

  return ORG_MODULE_CATALOG.filter((def) => isOrgModuleRelevantForPack(def.key, pack)).map(
    (def) => {
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
    },
  );
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
        : provider === 'moadian'
          ? ORG_INTEGRATION.MOADIAN
          : provider === 'whatsapp'
            ? ORG_INTEGRATION.WHATSAPP
            : provider === 'resend'
              ? ORG_INTEGRATION.RESEND
              : provider === 'telegram'
                ? ORG_INTEGRATION.TELEGRAM
                : provider === 'instagram'
                  ? ORG_INTEGRATION.INSTAGRAM
                  : ORG_INTEGRATION.VOIP;

  const label =
    provider === 'payment'
      ? 'درگاه پرداخت'
      : provider === 'kavenegar'
        ? 'پیامک کاوه‌نگار'
        : provider === 'moadian'
          ? 'سامانه مؤدیان'
          : provider === 'whatsapp'
            ? 'واتساپ Business'
            : provider === 'resend'
              ? 'ایمیل Resend'
              : provider === 'telegram'
                ? 'ربات تلگرام'
                : provider === 'instagram'
                  ? 'اینستاگرام DM'
                  : 'تماس VoIP';

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
