import { AUDIT_ACTIONS, AUDIT_ENTITY_TYPES, PROVIDER_IDS } from '@kesbyar/shared';
import type { MembershipRole, Prisma } from '@prisma/client';

import {
  decryptSecret,
  encryptSecret,
  maskSecret,
  secretLast4,
} from '@/lib/crypto/secrets';
import { ForbiddenError } from '@/lib/errors';
import { canManageSettings } from '@/lib/permissions';
import { prisma } from '@/lib/prisma';
import { logAudit } from '@/server/audit/audit.service';

/** IntegrationConfig.provider keys for Iran P0 org credentials */
export const ORG_INTEGRATION = {
  PAYMENT: 'payment',
  KAVENEGAR: 'kavenegar',
  MOADIAN: 'moadian',
} as const;

export type PaymentProviderChoice =
  | typeof PROVIDER_IDS.BILLING_MANUAL
  | typeof PROVIDER_IDS.BILLING_ZARINPAL
  | typeof PROVIDER_IDS.BILLING_IDPAY;

type PaymentConfigJson = {
  preferredProvider?: PaymentProviderChoice;
  sandbox?: boolean;
  zarinpalMerchantIdEnc?: string;
  zarinpalMerchantIdLast4?: string;
  idpayApiKeyEnc?: string;
  idpayApiKeyLast4?: string;
};

type KavenegarConfigJson = {
  apiKeyEnc?: string;
  apiKeyLast4?: string;
  sender?: string | null;
};

type MoadianConfigJson = {
  intermediaryUrl?: string | null;
  apiKeyEnc?: string;
  apiKeyLast4?: string;
};

export type ResolvedPaymentCredentials = {
  preferredProvider: PaymentProviderChoice;
  zarinpalMerchantId: string | null;
  idpayApiKey: string | null;
  sandbox: boolean;
  source: 'org' | 'env' | 'mixed';
};

export type ResolvedSmsCredentials = {
  apiKey: string | null;
  sender: string | null;
  source: 'org' | 'env' | 'none';
};

export type ResolvedMoadianCredentials = {
  intermediaryUrl: string | null;
  apiKey: string | null;
  source: 'org' | 'env' | 'none';
};

/** Public/masked view for Settings GET — never includes full secrets */
export type OrgIntegrationsPublicView = {
  payment: {
    preferredProvider: PaymentProviderChoice;
    sandbox: boolean;
    zarinpalMerchantIdMasked: string | null;
    zarinpalConfigured: boolean;
    idpayApiKeyMasked: string | null;
    idpayConfigured: boolean;
    status: 'active' | 'needs_setup' | 'manual';
    statusLabelFa: string;
  };
  sms: {
    apiKeyMasked: string | null;
    configured: boolean;
    sender: string | null;
    status: 'active' | 'needs_setup';
    statusLabelFa: string;
  };
  moadian: {
    intermediaryUrl: string | null;
    apiKeyMasked: string | null;
    configured: boolean;
    taxMemoryId: string | null;
    status: 'active' | 'export_only';
    statusLabelFa: string;
    noticeFa: string;
  };
};

export type UpdateOrgIntegrationsInput = {
  payment?: {
    preferredProvider?: PaymentProviderChoice;
    sandbox?: boolean;
    /** Omit or empty = keep existing; send new value to rotate */
    zarinpalMerchantId?: string | null;
    idpayApiKey?: string | null;
    clearZarinpalMerchantId?: boolean;
    clearIdpayApiKey?: boolean;
  };
  sms?: {
    apiKey?: string | null;
    sender?: string | null;
    clearApiKey?: boolean;
  };
  moadian?: {
    intermediaryUrl?: string | null;
    apiKey?: string | null;
    clearApiKey?: boolean;
  };
};

function envSandbox(): boolean {
  const v = process.env.PAYMENT_SANDBOX ?? 'true';
  return v !== 'false' && v !== '0';
}

function asPaymentConfig(raw: Prisma.JsonValue | null | undefined): PaymentConfigJson {
  if (!raw || typeof raw !== 'object' || Array.isArray(raw)) return {};
  return raw as PaymentConfigJson;
}

function asKavenegarConfig(raw: Prisma.JsonValue | null | undefined): KavenegarConfigJson {
  if (!raw || typeof raw !== 'object' || Array.isArray(raw)) return {};
  return raw as KavenegarConfigJson;
}

function asMoadianConfig(raw: Prisma.JsonValue | null | undefined): MoadianConfigJson {
  if (!raw || typeof raw !== 'object' || Array.isArray(raw)) return {};
  return raw as MoadianConfigJson;
}

function paymentStatusLabel(
  preferred: PaymentProviderChoice,
  zarinpalOk: boolean,
  idpayOk: boolean,
): { status: 'active' | 'needs_setup' | 'manual'; statusLabelFa: string } {
  if (preferred === PROVIDER_IDS.BILLING_MANUAL) {
    return { status: 'manual', statusLabelFa: 'پرداخت دستی' };
  }
  if (preferred === PROVIDER_IDS.BILLING_ZARINPAL) {
    return zarinpalOk
      ? { status: 'active', statusLabelFa: 'فعال' }
      : { status: 'needs_setup', statusLabelFa: 'نیاز به تکمیل' };
  }
  if (preferred === PROVIDER_IDS.BILLING_IDPAY) {
    return idpayOk
      ? { status: 'active', statusLabelFa: 'فعال' }
      : { status: 'needs_setup', statusLabelFa: 'نیاز به تکمیل' };
  }
  return { status: 'needs_setup', statusLabelFa: 'نیاز به تکمیل' };
}

async function loadConfigs(organizationId: string) {
  const rows = await prisma.integrationConfig.findMany({
    where: {
      organizationId,
      provider: {
        in: [ORG_INTEGRATION.PAYMENT, ORG_INTEGRATION.KAVENEGAR, ORG_INTEGRATION.MOADIAN],
      },
    },
  });
  const byProvider = Object.fromEntries(rows.map((r) => [r.provider, r]));
  return {
    payment: byProvider[ORG_INTEGRATION.PAYMENT] ?? null,
    kavenegar: byProvider[ORG_INTEGRATION.KAVENEGAR] ?? null,
    moadian: byProvider[ORG_INTEGRATION.MOADIAN] ?? null,
  };
}

export async function resolvePaymentCredentials(
  organizationId: string,
): Promise<ResolvedPaymentCredentials> {
  const { payment } = await loadConfigs(organizationId);
  const cfg = asPaymentConfig(payment?.config);

  const envPreferred = (
    process.env.INVOICE_PAYMENT_PROVIDER ??
    process.env.BILLING_PROVIDER ??
    PROVIDER_IDS.BILLING_MANUAL
  )
    .trim()
    .toLowerCase() as PaymentProviderChoice;

  const preferredRaw = cfg.preferredProvider ?? envPreferred;
  const preferred: PaymentProviderChoice = [
    PROVIDER_IDS.BILLING_MANUAL,
    PROVIDER_IDS.BILLING_ZARINPAL,
    PROVIDER_IDS.BILLING_IDPAY,
  ].includes(preferredRaw)
    ? preferredRaw
    : PROVIDER_IDS.BILLING_MANUAL;

  const orgZarinpal = decryptSecret(cfg.zarinpalMerchantIdEnc);
  const orgIdpay = decryptSecret(cfg.idpayApiKeyEnc);
  const envZarinpal =
    process.env.PAYMENT_ZARINPAL_MERCHANT_ID ?? process.env.BILLING_ZARINPAL_MERCHANT_ID ?? null;
  const envIdpay = process.env.PAYMENT_IDPAY_API_KEY ?? process.env.BILLING_IDPAY_API_KEY ?? null;

  const zarinpalMerchantId = orgZarinpal || envZarinpal;
  const idpayApiKey = orgIdpay || envIdpay;
  const sandbox = typeof cfg.sandbox === 'boolean' ? cfg.sandbox : envSandbox();

  let source: ResolvedPaymentCredentials['source'] = 'env';
  if (payment?.config) {
    const usedOrg =
      (orgZarinpal && zarinpalMerchantId === orgZarinpal) ||
      (orgIdpay && idpayApiKey === orgIdpay) ||
      cfg.preferredProvider != null ||
      typeof cfg.sandbox === 'boolean';
    const usedEnv =
      (!orgZarinpal && Boolean(envZarinpal)) || (!orgIdpay && Boolean(envIdpay));
    source = usedOrg && usedEnv ? 'mixed' : usedOrg ? 'org' : 'env';
  }

  return {
    preferredProvider: preferred,
    zarinpalMerchantId: zarinpalMerchantId || null,
    idpayApiKey: idpayApiKey || null,
    sandbox,
    source,
  };
}

export async function resolveSmsCredentials(
  organizationId: string,
): Promise<ResolvedSmsCredentials> {
  const { kavenegar } = await loadConfigs(organizationId);
  const cfg = asKavenegarConfig(kavenegar?.config);
  const orgKey = decryptSecret(cfg.apiKeyEnc);
  const envKey =
    process.env.SMS_KAVENEGAR_API_KEY ?? process.env.KAVENEGAR_API_KEY ?? null;
  const envSender = process.env.SMS_KAVENEGAR_SENDER ?? process.env.KAVENEGAR_SENDER ?? null;

  if (orgKey) {
    return {
      apiKey: orgKey,
      sender: cfg.sender ?? envSender,
      source: 'org',
    };
  }
  if (envKey) {
    return { apiKey: envKey, sender: envSender, source: 'env' };
  }
  return { apiKey: null, sender: cfg.sender ?? envSender, source: 'none' };
}

export async function resolveMoadianCredentials(
  organizationId: string,
): Promise<ResolvedMoadianCredentials> {
  const { moadian } = await loadConfigs(organizationId);
  const cfg = asMoadianConfig(moadian?.config);
  const orgKey = decryptSecret(cfg.apiKeyEnc);
  const orgUrl = cfg.intermediaryUrl?.trim() || null;
  const envUrl = process.env.MOADIAN_INTERMEDIARY_URL?.trim() || null;
  const envKey = process.env.MOADIAN_INTERMEDIARY_API_KEY?.trim() || null;

  const url = orgUrl || envUrl;
  const apiKey = orgKey || envKey;

  if (orgUrl || orgKey) {
    return { intermediaryUrl: url, apiKey, source: 'org' };
  }
  if (envUrl && envKey) {
    return { intermediaryUrl: envUrl, apiKey: envKey, source: 'env' };
  }
  return { intermediaryUrl: url, apiKey, source: 'none' };
}

export async function getOrgIntegrationsPublicView(
  organizationId: string,
): Promise<OrgIntegrationsPublicView> {
  const [configs, org] = await Promise.all([
    loadConfigs(organizationId),
    prisma.organization.findUnique({
      where: { id: organizationId },
      select: { taxMemoryId: true },
    }),
  ]);

  const payCfg = asPaymentConfig(configs.payment?.config);
  const smsCfg = asKavenegarConfig(configs.kavenegar?.config);
  const moadianCfg = asMoadianConfig(configs.moadian?.config);

  const resolvedPay = await resolvePaymentCredentials(organizationId);
  const zarinpalConfigured = Boolean(resolvedPay.zarinpalMerchantId);
  const idpayConfigured = Boolean(resolvedPay.idpayApiKey);
  const payStatus = paymentStatusLabel(
    resolvedPay.preferredProvider,
    zarinpalConfigured,
    idpayConfigured,
  );

  const smsResolved = await resolveSmsCredentials(organizationId);
  const smsConfigured = Boolean(smsResolved.apiKey);

  const moadianResolved = await resolveMoadianCredentials(organizationId);
  const moadianConfigured = Boolean(
    moadianResolved.intermediaryUrl && moadianResolved.apiKey,
  );

  return {
    payment: {
      preferredProvider: resolvedPay.preferredProvider,
      sandbox: resolvedPay.sandbox,
      zarinpalMerchantIdMasked: maskSecret(
        payCfg.zarinpalMerchantIdLast4 ?? secretLast4(resolvedPay.zarinpalMerchantId),
        zarinpalConfigured,
      ),
      zarinpalConfigured,
      idpayApiKeyMasked: maskSecret(
        payCfg.idpayApiKeyLast4 ?? secretLast4(resolvedPay.idpayApiKey),
        idpayConfigured,
      ),
      idpayConfigured,
      status: payStatus.status,
      statusLabelFa: payStatus.statusLabelFa,
    },
    sms: {
      apiKeyMasked: maskSecret(
        smsCfg.apiKeyLast4 ?? secretLast4(smsResolved.apiKey),
        smsConfigured,
      ),
      configured: smsConfigured,
      sender: smsResolved.sender,
      status: smsConfigured ? 'active' : 'needs_setup',
      statusLabelFa: smsConfigured ? 'فعال' : 'نیاز به تکمیل',
    },
    moadian: {
      intermediaryUrl: moadianResolved.intermediaryUrl,
      apiKeyMasked: maskSecret(
        moadianCfg.apiKeyLast4 ?? secretLast4(moadianResolved.apiKey),
        Boolean(moadianResolved.apiKey),
      ),
      configured: moadianConfigured,
      taxMemoryId: org?.taxMemoryId ?? null,
      status: moadianConfigured ? 'active' : 'export_only',
      statusLabelFa: moadianConfigured ? 'فعال (واسط)' : 'فقط خروجی / بارگذاری دستی',
      noticeFa:
        'این بخش اتصال به «واسط مؤدیان» است، نه اتصال مستقیم به سازمان امور مالیاتی. بدون URL و کلید واسط، فقط خروجی JSON و بارگذاری دستی در کارپوشه ممکن است.',
    },
  };
}

async function upsertIntegration(
  organizationId: string,
  provider: string,
  label: string,
  config: Prisma.InputJsonValue,
  isActive: boolean,
) {
  return prisma.integrationConfig.upsert({
    where: {
      organizationId_provider: { organizationId, provider },
    },
    create: {
      organizationId,
      provider,
      label,
      config,
      isActive,
    },
    update: {
      label,
      config,
      isActive,
    },
  });
}

export async function updateOrgIntegrations(
  organizationId: string,
  role: MembershipRole,
  userId: string,
  input: UpdateOrgIntegrationsInput,
): Promise<OrgIntegrationsPublicView> {
  if (!canManageSettings(role)) {
    throw new ForbiddenError('فقط مالک یا مدیر می‌تواند کلیدهای یکپارچه‌سازی را ویرایش کند');
  }

  const existing = await loadConfigs(organizationId);

  if (input.payment) {
    const prev = asPaymentConfig(existing.payment?.config);
    const next: PaymentConfigJson = { ...prev };

    if (input.payment.preferredProvider) {
      next.preferredProvider = input.payment.preferredProvider;
    }
    if (typeof input.payment.sandbox === 'boolean') {
      next.sandbox = input.payment.sandbox;
    }

    if (input.payment.clearZarinpalMerchantId) {
      delete next.zarinpalMerchantIdEnc;
      delete next.zarinpalMerchantIdLast4;
    } else if (
      typeof input.payment.zarinpalMerchantId === 'string' &&
      input.payment.zarinpalMerchantId.trim()
    ) {
      const plain = input.payment.zarinpalMerchantId.trim();
      next.zarinpalMerchantIdEnc = encryptSecret(plain);
      next.zarinpalMerchantIdLast4 = secretLast4(plain) ?? undefined;
    }

    if (input.payment.clearIdpayApiKey) {
      delete next.idpayApiKeyEnc;
      delete next.idpayApiKeyLast4;
    } else if (typeof input.payment.idpayApiKey === 'string' && input.payment.idpayApiKey.trim()) {
      const plain = input.payment.idpayApiKey.trim();
      next.idpayApiKeyEnc = encryptSecret(plain);
      next.idpayApiKeyLast4 = secretLast4(plain) ?? undefined;
    }

    const active =
      next.preferredProvider !== PROVIDER_IDS.BILLING_MANUAL &&
      Boolean(next.zarinpalMerchantIdEnc || next.idpayApiKeyEnc);

    await upsertIntegration(
      organizationId,
      ORG_INTEGRATION.PAYMENT,
      'درگاه پرداخت',
      next as Prisma.InputJsonValue,
      active,
    );
  }

  if (input.sms) {
    const prev = asKavenegarConfig(existing.kavenegar?.config);
    const next: KavenegarConfigJson = { ...prev };

    if (input.sms.clearApiKey) {
      delete next.apiKeyEnc;
      delete next.apiKeyLast4;
    } else if (typeof input.sms.apiKey === 'string' && input.sms.apiKey.trim()) {
      const plain = input.sms.apiKey.trim();
      next.apiKeyEnc = encryptSecret(plain);
      next.apiKeyLast4 = secretLast4(plain) ?? undefined;
    }

    if (input.sms.sender !== undefined) {
      next.sender = input.sms.sender?.trim() || null;
    }

    await upsertIntegration(
      organizationId,
      ORG_INTEGRATION.KAVENEGAR,
      'پیامک کاوه‌نگار',
      next as Prisma.InputJsonValue,
      Boolean(next.apiKeyEnc),
    );
  }

  if (input.moadian) {
    const prev = asMoadianConfig(existing.moadian?.config);
    const next: MoadianConfigJson = { ...prev };

    if (input.moadian.intermediaryUrl !== undefined) {
      next.intermediaryUrl = input.moadian.intermediaryUrl?.trim() || null;
    }

    if (input.moadian.clearApiKey) {
      delete next.apiKeyEnc;
      delete next.apiKeyLast4;
    } else if (typeof input.moadian.apiKey === 'string' && input.moadian.apiKey.trim()) {
      const plain = input.moadian.apiKey.trim();
      next.apiKeyEnc = encryptSecret(plain);
      next.apiKeyLast4 = secretLast4(plain) ?? undefined;
    }

    await upsertIntegration(
      organizationId,
      ORG_INTEGRATION.MOADIAN,
      'واسط مؤدیان',
      next as Prisma.InputJsonValue,
      Boolean(next.intermediaryUrl && next.apiKeyEnc),
    );
  }

  await logAudit({
    organizationId,
    userId,
    action: AUDIT_ACTIONS.SETTINGS_UPDATE,
    entityType: AUDIT_ENTITY_TYPES.ORGANIZATION,
    entityId: organizationId,
    metadata: {
      fields: ['integrations'],
      sections: Object.keys(input),
    },
  });

  return getOrgIntegrationsPublicView(organizationId);
}
