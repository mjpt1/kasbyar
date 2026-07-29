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
  WHATSAPP: 'whatsapp',
  RESEND: 'resend',
  VOIP: 'voip',
  TELEGRAM: 'telegram',
  INSTAGRAM: 'instagram',
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

type WhatsAppConfigJson = {
  phoneNumberId?: string | null;
  accessTokenEnc?: string;
  accessTokenLast4?: string;
};

type ResendConfigJson = {
  apiKeyEnc?: string;
  apiKeyLast4?: string;
  fromEmail?: string | null;
};

type VoipConfigJson = {
  webhookSecretEnc?: string;
  webhookSecretLast4?: string;
};

type TelegramConfigJson = {
  botTokenEnc?: string;
  botTokenLast4?: string;
  botUsername?: string | null;
};

type InstagramConfigJson = {
  pageId?: string | null;
  accessTokenEnc?: string;
  accessTokenLast4?: string;
  appSecretEnc?: string;
  appSecretLast4?: string;
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

export type ResolvedWhatsAppCredentials = {
  phoneNumberId: string | null;
  accessToken: string | null;
  source: 'org' | 'env' | 'none';
};

export type ResolvedResendCredentials = {
  apiKey: string | null;
  fromEmail: string | null;
  source: 'org' | 'env' | 'none';
};

export type ResolvedVoipCredentials = {
  webhookSecret: string | null;
  source: 'org' | 'env' | 'none';
};

export type ResolvedTelegramCredentials = {
  botToken: string | null;
  botUsername: string | null;
  source: 'org' | 'env' | 'none';
};

export type ResolvedInstagramCredentials = {
  pageId: string | null;
  accessToken: string | null;
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
    webhookUrl: string;
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
  whatsapp: {
    phoneNumberId: string | null;
    accessTokenMasked: string | null;
    configured: boolean;
    webhookUrl: string;
    status: 'active' | 'needs_setup';
    statusLabelFa: string;
  };
  email: {
    fromEmail: string | null;
    apiKeyMasked: string | null;
    configured: boolean;
    webhookUrl: string;
    status: 'active' | 'needs_setup';
    statusLabelFa: string;
  };
  voip: {
    webhookSecretMasked: string | null;
    configured: boolean;
    webhookUrl: string;
    status: 'active' | 'needs_setup';
    statusLabelFa: string;
  };
  telegram: {
    botUsername: string | null;
    botTokenMasked: string | null;
    configured: boolean;
    webhookUrl: string;
    status: 'active' | 'needs_setup';
    statusLabelFa: string;
  };
  instagram: {
    pageId: string | null;
    accessTokenMasked: string | null;
    appSecretMasked: string | null;
    configured: boolean;
    tokenValid: boolean;
    pageName: string | null;
    webhookUrl: string;
    status: 'active' | 'needs_setup';
    statusLabelFa: string;
    noticeFa: string;
    permissionsFa: string[];
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
  whatsapp?: {
    phoneNumberId?: string | null;
    accessToken?: string | null;
    clearAccessToken?: boolean;
  };
  email?: {
    fromEmail?: string | null;
    apiKey?: string | null;
    clearApiKey?: boolean;
  };
  voip?: {
    webhookSecret?: string | null;
    clearWebhookSecret?: boolean;
  };
  telegram?: {
    botUsername?: string | null;
    botToken?: string | null;
    clearBotToken?: boolean;
  };
  instagram?: {
    pageId?: string | null;
    accessToken?: string | null;
    appSecret?: string | null;
    clearAccessToken?: boolean;
    clearAppSecret?: boolean;
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

function asWhatsAppConfig(raw: Prisma.JsonValue | null | undefined): WhatsAppConfigJson {
  if (!raw || typeof raw !== 'object' || Array.isArray(raw)) return {};
  return raw as WhatsAppConfigJson;
}

function asResendConfig(raw: Prisma.JsonValue | null | undefined): ResendConfigJson {
  if (!raw || typeof raw !== 'object' || Array.isArray(raw)) return {};
  return raw as ResendConfigJson;
}

function asVoipConfig(raw: Prisma.JsonValue | null | undefined): VoipConfigJson {
  if (!raw || typeof raw !== 'object' || Array.isArray(raw)) return {};
  return raw as VoipConfigJson;
}

function asTelegramConfig(raw: Prisma.JsonValue | null | undefined): TelegramConfigJson {
  if (!raw || typeof raw !== 'object' || Array.isArray(raw)) return {};
  return raw as TelegramConfigJson;
}

function asInstagramConfig(raw: Prisma.JsonValue | null | undefined): InstagramConfigJson {
  if (!raw || typeof raw !== 'object' || Array.isArray(raw)) return {};
  return raw as InstagramConfigJson;
}

function appBaseUrl(): string {
  return (
    process.env.NEXT_PUBLIC_APP_URL?.replace(/\/$/, '') ||
    process.env.APP_URL?.replace(/\/$/, '') ||
    'http://localhost:3000'
  );
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
        in: [
          ORG_INTEGRATION.PAYMENT,
          ORG_INTEGRATION.KAVENEGAR,
          ORG_INTEGRATION.MOADIAN,
          ORG_INTEGRATION.WHATSAPP,
          ORG_INTEGRATION.RESEND,
          ORG_INTEGRATION.VOIP,
          ORG_INTEGRATION.TELEGRAM,
          ORG_INTEGRATION.INSTAGRAM,
        ],
      },
    },
  });
  const byProvider = Object.fromEntries(rows.map((r) => [r.provider, r]));
  return {
    payment: byProvider[ORG_INTEGRATION.PAYMENT] ?? null,
    kavenegar: byProvider[ORG_INTEGRATION.KAVENEGAR] ?? null,
    moadian: byProvider[ORG_INTEGRATION.MOADIAN] ?? null,
    whatsapp: byProvider[ORG_INTEGRATION.WHATSAPP] ?? null,
    resend: byProvider[ORG_INTEGRATION.RESEND] ?? null,
    voip: byProvider[ORG_INTEGRATION.VOIP] ?? null,
    telegram: byProvider[ORG_INTEGRATION.TELEGRAM] ?? null,
    instagram: byProvider[ORG_INTEGRATION.INSTAGRAM] ?? null,
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

export async function resolveWhatsAppCredentials(
  organizationId: string,
): Promise<ResolvedWhatsAppCredentials> {
  const { whatsapp } = await loadConfigs(organizationId);
  const cfg = asWhatsAppConfig(whatsapp?.config);
  const orgToken = decryptSecret(cfg.accessTokenEnc);
  const envToken = process.env.WHATSAPP_ACCESS_TOKEN?.trim() || null;
  const envPhone = process.env.WHATSAPP_PHONE_NUMBER_ID?.trim() || null;
  const phoneNumberId = cfg.phoneNumberId?.trim() || envPhone;
  const accessToken = orgToken || envToken;

  if (cfg.phoneNumberId || orgToken) {
    return { phoneNumberId, accessToken, source: 'org' };
  }
  if (envPhone || envToken) {
    return { phoneNumberId, accessToken, source: 'env' };
  }
  return { phoneNumberId: phoneNumberId || null, accessToken: null, source: 'none' };
}

export async function resolveResendCredentials(
  organizationId: string,
): Promise<ResolvedResendCredentials> {
  const { resend } = await loadConfigs(organizationId);
  const cfg = asResendConfig(resend?.config);
  const orgKey = decryptSecret(cfg.apiKeyEnc);
  const envKey = process.env.RESEND_API_KEY?.trim() || null;
  const envFrom = process.env.RESEND_FROM_EMAIL?.trim() || null;
  const fromEmail = cfg.fromEmail?.trim() || envFrom;

  if (orgKey || cfg.fromEmail) {
    return { apiKey: orgKey || envKey, fromEmail, source: 'org' };
  }
  if (envKey || envFrom) {
    return { apiKey: envKey, fromEmail: envFrom, source: 'env' };
  }
  return { apiKey: null, fromEmail: null, source: 'none' };
}

export async function resolveVoipWebhookSecret(
  organizationId: string,
): Promise<string | null> {
  const { voip } = await loadConfigs(organizationId);
  const cfg = asVoipConfig(voip?.config);
  const orgSecret = cfg.webhookSecretEnc ? decryptSecret(cfg.webhookSecretEnc) : null;
  const envSecret = process.env.VOIP_WEBHOOK_SECRET?.trim() || null;
  return orgSecret || envSecret;
}

export async function resolveTelegramCredentials(
  organizationId: string,
): Promise<ResolvedTelegramCredentials> {
  const { telegram } = await loadConfigs(organizationId);
  const cfg = asTelegramConfig(telegram?.config);
  const orgToken = decryptSecret(cfg.botTokenEnc);
  const envToken = process.env.TELEGRAM_BOT_TOKEN?.trim() || null;
  const botToken = orgToken || envToken;
  const botUsername = cfg.botUsername?.trim() || process.env.TELEGRAM_BOT_USERNAME?.trim() || null;

  if (orgToken || cfg.botUsername) {
    return { botToken, botUsername, source: 'org' };
  }
  if (envToken) {
    return { botToken: envToken, botUsername, source: 'env' };
  }
  return { botToken: null, botUsername, source: 'none' };
}

export async function resolveInstagramCredentials(
  organizationId: string,
): Promise<ResolvedInstagramCredentials> {
  const { instagram } = await loadConfigs(organizationId);
  const cfg = asInstagramConfig(instagram?.config);
  const orgToken = decryptSecret(cfg.accessTokenEnc);
  const envToken = process.env.INSTAGRAM_ACCESS_TOKEN?.trim() || null;
  const pageId = cfg.pageId?.trim() || process.env.INSTAGRAM_PAGE_ID?.trim() || null;
  const accessToken = orgToken || envToken;

  if (cfg.pageId || orgToken) {
    return { pageId, accessToken, source: 'org' };
  }
  if (envToken || pageId) {
    return { pageId, accessToken: envToken, source: 'env' };
  }
  return { pageId: null, accessToken: null, source: 'none' };
}

export async function resolveInstagramAppSecret(orgSlug: string): Promise<string | null> {
  const org = await prisma.organization.findUnique({
    where: { slug: orgSlug },
    select: { id: true },
  });
  if (!org) return null;

  const { instagram } = await loadConfigs(org.id);
  const cfg = asInstagramConfig(instagram?.config);
  const orgSecret = cfg.appSecretEnc ? decryptSecret(cfg.appSecretEnc) : null;
  return (
    orgSecret ||
    process.env.INSTAGRAM_APP_SECRET?.trim() ||
    process.env.META_APP_SECRET?.trim() ||
    null
  );
}

export async function getOrgIntegrationsPublicView(
  organizationId: string,
): Promise<OrgIntegrationsPublicView> {
  const [configs, org] = await Promise.all([
    loadConfigs(organizationId),
    prisma.organization.findUnique({
      where: { id: organizationId },
      select: { taxMemoryId: true, slug: true },
    }),
  ]);

  const payCfg = asPaymentConfig(configs.payment?.config);
  const smsCfg = asKavenegarConfig(configs.kavenegar?.config);
  const moadianCfg = asMoadianConfig(configs.moadian?.config);
  const whatsappCfg = asWhatsAppConfig(configs.whatsapp?.config);
  const resendCfg = asResendConfig(configs.resend?.config);
  const voipCfg = asVoipConfig(configs.voip?.config);
  const telegramCfg = asTelegramConfig(configs.telegram?.config);
  const instagramCfg = asInstagramConfig(configs.instagram?.config);

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

  const whatsappResolved = await resolveWhatsAppCredentials(organizationId);
  const whatsappConfigured = Boolean(
    whatsappResolved.phoneNumberId && whatsappResolved.accessToken,
  );

  const resendResolved = await resolveResendCredentials(organizationId);
  const emailConfigured = Boolean(resendResolved.apiKey && resendResolved.fromEmail);

  const voipSecret = voipCfg.webhookSecretEnc
    ? decryptSecret(voipCfg.webhookSecretEnc)
    : process.env.VOIP_WEBHOOK_SECRET?.trim() || null;
  const voipConfigured = true;

  const telegramResolved = await resolveTelegramCredentials(organizationId);
  const telegramConfigured = Boolean(telegramResolved.botToken);

  const instagramResolved = await resolveInstagramCredentials(organizationId);
  const instagramConfigured = Boolean(
    instagramResolved.pageId && instagramResolved.accessToken,
  );

  const orgSlug = org?.slug ?? 'slug-سازمان';

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
      webhookUrl: `${appBaseUrl()}/api/webhooks/kavenegar/${orgSlug}`,
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
    whatsapp: {
      phoneNumberId: whatsappResolved.phoneNumberId,
      accessTokenMasked: maskSecret(
        whatsappCfg.accessTokenLast4 ?? secretLast4(whatsappResolved.accessToken),
        Boolean(whatsappResolved.accessToken),
      ),
      configured: whatsappConfigured,
      webhookUrl: `${appBaseUrl()}/api/webhooks/whatsapp`,
      status: whatsappConfigured ? 'active' : 'needs_setup',
      statusLabelFa: whatsappConfigured ? 'فعال' : 'نیاز به تکمیل',
    },
    email: {
      fromEmail: resendResolved.fromEmail,
      apiKeyMasked: maskSecret(
        resendCfg.apiKeyLast4 ?? secretLast4(resendResolved.apiKey),
        Boolean(resendResolved.apiKey),
      ),
      configured: emailConfigured,
      webhookUrl: `${appBaseUrl()}/api/webhooks/resend/${orgSlug}`,
      status: emailConfigured ? 'active' : 'needs_setup',
      statusLabelFa: emailConfigured ? 'فعال' : 'نیاز به تکمیل',
    },
    voip: {
      webhookSecretMasked: maskSecret(
        voipCfg.webhookSecretLast4 ?? secretLast4(voipSecret),
        Boolean(voipSecret),
      ),
      configured: voipConfigured,
      webhookUrl: `${appBaseUrl()}/api/webhooks/voip/${orgSlug}`,
      status: voipSecret ? 'active' : 'needs_setup',
      statusLabelFa: voipSecret ? 'فعال' : 'فعال — توصیه: کلید webhook',
    },
    telegram: {
      botUsername: telegramResolved.botUsername,
      botTokenMasked: maskSecret(
        telegramCfg.botTokenLast4 ?? secretLast4(telegramResolved.botToken),
        Boolean(telegramResolved.botToken),
      ),
      configured: telegramConfigured,
      webhookUrl: `${appBaseUrl()}/api/webhooks/telegram/${orgSlug}`,
      status: telegramConfigured ? 'active' : 'needs_setup',
      statusLabelFa: telegramConfigured ? 'فعال' : 'نیاز به تکمیل',
    },
    instagram: {
      pageId: instagramResolved.pageId,
      accessTokenMasked: maskSecret(
        instagramCfg.accessTokenLast4 ?? secretLast4(instagramResolved.accessToken),
        Boolean(instagramResolved.accessToken),
      ),
      appSecretMasked: maskSecret(
        instagramCfg.appSecretLast4 ??
          secretLast4(instagramCfg.appSecretEnc ? decryptSecret(instagramCfg.appSecretEnc) : null),
        Boolean(instagramCfg.appSecretEnc),
      ),
      configured: instagramConfigured,
      tokenValid: instagramConfigured,
      pageName: null,
      webhookUrl: `${appBaseUrl()}/api/webhooks/instagram/${orgSlug}`,
      status: instagramConfigured ? 'active' : 'needs_setup',
      statusLabelFa: instagramConfigured ? 'فعال — دریافت/ارسال DM' : 'پیکربندی نشده',
      noticeFa:
        'برای production، Meta App Review برای instagram_manage_messages لازم است. webhook و امضای HMAC با App Secret پشتیبانی می‌شود.',
      permissionsFa: [
        'instagram_basic',
        'instagram_manage_messages',
        'pages_manage_metadata',
        'pages_messaging',
      ],
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

  if (input.whatsapp) {
    const prev = asWhatsAppConfig(existing.whatsapp?.config);
    const next: WhatsAppConfigJson = { ...prev };

    if (input.whatsapp.phoneNumberId !== undefined) {
      next.phoneNumberId = input.whatsapp.phoneNumberId?.trim() || null;
    }

    if (input.whatsapp.clearAccessToken) {
      delete next.accessTokenEnc;
      delete next.accessTokenLast4;
    } else if (typeof input.whatsapp.accessToken === 'string' && input.whatsapp.accessToken.trim()) {
      const plain = input.whatsapp.accessToken.trim();
      next.accessTokenEnc = encryptSecret(plain);
      next.accessTokenLast4 = secretLast4(plain) ?? undefined;
    }

    await upsertIntegration(
      organizationId,
      ORG_INTEGRATION.WHATSAPP,
      'واتساپ Business',
      next as Prisma.InputJsonValue,
      Boolean(next.phoneNumberId && next.accessTokenEnc),
    );
  }

  if (input.email) {
    const prev = asResendConfig(existing.resend?.config);
    const next: ResendConfigJson = { ...prev };

    if (input.email.fromEmail !== undefined) {
      next.fromEmail = input.email.fromEmail?.trim() || null;
    }

    if (input.email.clearApiKey) {
      delete next.apiKeyEnc;
      delete next.apiKeyLast4;
    } else if (typeof input.email.apiKey === 'string' && input.email.apiKey.trim()) {
      const plain = input.email.apiKey.trim();
      next.apiKeyEnc = encryptSecret(plain);
      next.apiKeyLast4 = secretLast4(plain) ?? undefined;
    }

    await upsertIntegration(
      organizationId,
      ORG_INTEGRATION.RESEND,
      'ایمیل Resend',
      next as Prisma.InputJsonValue,
      Boolean(next.apiKeyEnc && next.fromEmail),
    );
  }

  if (input.voip) {
    const prev = asVoipConfig(existing.voip?.config);
    const next: VoipConfigJson = { ...prev };

    if (input.voip.clearWebhookSecret) {
      delete next.webhookSecretEnc;
      delete next.webhookSecretLast4;
    } else if (
      typeof input.voip.webhookSecret === 'string' &&
      input.voip.webhookSecret.trim()
    ) {
      const plain = input.voip.webhookSecret.trim();
      next.webhookSecretEnc = encryptSecret(plain);
      next.webhookSecretLast4 = secretLast4(plain) ?? undefined;
    }

    await upsertIntegration(
      organizationId,
      ORG_INTEGRATION.VOIP,
      'تماس VoIP',
      next as Prisma.InputJsonValue,
      true,
    );
  }

  if (input.telegram) {
    const prev = asTelegramConfig(existing.telegram?.config);
    const next: TelegramConfigJson = { ...prev };

    if (input.telegram.botUsername !== undefined) {
      next.botUsername = input.telegram.botUsername?.trim() || null;
    }

    if (input.telegram.clearBotToken) {
      delete next.botTokenEnc;
      delete next.botTokenLast4;
    } else if (typeof input.telegram.botToken === 'string' && input.telegram.botToken.trim()) {
      const plain = input.telegram.botToken.trim();
      next.botTokenEnc = encryptSecret(plain);
      next.botTokenLast4 = secretLast4(plain) ?? undefined;
    }

    await upsertIntegration(
      organizationId,
      ORG_INTEGRATION.TELEGRAM,
      'ربات تلگرام',
      next as Prisma.InputJsonValue,
      Boolean(next.botTokenEnc),
    );
  }

  if (input.instagram) {
    const prev = asInstagramConfig(existing.instagram?.config);
    const next: InstagramConfigJson = { ...prev };

    if (input.instagram.pageId !== undefined) {
      next.pageId = input.instagram.pageId?.trim() || null;
    }

    if (input.instagram.clearAccessToken) {
      delete next.accessTokenEnc;
      delete next.accessTokenLast4;
    } else if (
      typeof input.instagram.accessToken === 'string' &&
      input.instagram.accessToken.trim()
    ) {
      const plain = input.instagram.accessToken.trim();
      next.accessTokenEnc = encryptSecret(plain);
      next.accessTokenLast4 = secretLast4(plain) ?? undefined;
    }

    if (input.instagram.clearAppSecret) {
      delete next.appSecretEnc;
      delete next.appSecretLast4;
    } else if (
      typeof input.instagram.appSecret === 'string' &&
      input.instagram.appSecret.trim()
    ) {
      const plain = input.instagram.appSecret.trim();
      next.appSecretEnc = encryptSecret(plain);
      next.appSecretLast4 = secretLast4(plain) ?? undefined;
    }

    await upsertIntegration(
      organizationId,
      ORG_INTEGRATION.INSTAGRAM,
      'اینستاگرام DM',
      next as Prisma.InputJsonValue,
      Boolean(next.pageId && next.accessTokenEnc),
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
