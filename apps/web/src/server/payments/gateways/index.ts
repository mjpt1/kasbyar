import {
  PROVIDER_IDS,
  resolveProviderId,
  type InvoicePaymentGateway,
} from '@kesbyar/shared';

import { resolvePaymentCredentials } from '@/server/integrations/org-credentials.service';

import { createIdpayGateway } from './idpay';
import { createZarinpalGateway } from './zarinpal';

const ALLOWED = [
  PROVIDER_IDS.BILLING_MANUAL,
  PROVIDER_IDS.BILLING_ZARINPAL,
  PROVIDER_IDS.BILLING_IDPAY,
] as const;

export type InvoiceGatewayAvailability = {
  provider: string;
  configured: boolean;
  sandbox: boolean;
  setupHintFa?: string;
};

const SETTINGS_HINT =
  'برای پرداخت آنلاین، در تنظیمات سازمان کلید زرین‌پال یا آیدی‌پی را وارد کنید. تا آن زمان فقط ثبت دستی پرداخت فعال است.';

function sandboxFlag(): boolean {
  const v = process.env.PAYMENT_SANDBOX ?? 'true';
  return v !== 'false' && v !== '0';
}

/** @deprecated Prefer resolvePaymentCredentials(organizationId) — env-only snapshot */
export function getInvoicePaymentEnvConfig(): {
  preferred: string;
  zarinpalMerchantId?: string;
  idpayApiKey?: string;
  sandbox: boolean;
} {
  return {
    preferred: resolveProviderId(
      null,
      process.env.INVOICE_PAYMENT_PROVIDER ?? process.env.BILLING_PROVIDER,
      PROVIDER_IDS.BILLING_MANUAL,
      ALLOWED,
    ),
    zarinpalMerchantId:
      process.env.PAYMENT_ZARINPAL_MERCHANT_ID ??
      process.env.BILLING_ZARINPAL_MERCHANT_ID ??
      undefined,
    idpayApiKey:
      process.env.PAYMENT_IDPAY_API_KEY ?? process.env.BILLING_IDPAY_API_KEY ?? undefined,
    sandbox: sandboxFlag(),
  };
}

function availabilityFromResolved(creds: Awaited<ReturnType<typeof resolvePaymentCredentials>>): InvoiceGatewayAvailability {
  const { preferredProvider, zarinpalMerchantId, idpayApiKey, sandbox } = creds;

  if (preferredProvider === PROVIDER_IDS.BILLING_ZARINPAL && zarinpalMerchantId) {
    return { provider: PROVIDER_IDS.BILLING_ZARINPAL, configured: true, sandbox };
  }
  if (preferredProvider === PROVIDER_IDS.BILLING_IDPAY && idpayApiKey) {
    return { provider: PROVIDER_IDS.BILLING_IDPAY, configured: true, sandbox };
  }

  // Explicit manual — do not auto-pick
  if (preferredProvider === PROVIDER_IDS.BILLING_MANUAL) {
    // Still allow auto-pick from keys when org never set preferred (env single-tenant)
    if (creds.source === 'env') {
      if (zarinpalMerchantId) {
        return { provider: PROVIDER_IDS.BILLING_ZARINPAL, configured: true, sandbox };
      }
      if (idpayApiKey) {
        return { provider: PROVIDER_IDS.BILLING_IDPAY, configured: true, sandbox };
      }
    }
    return {
      provider: PROVIDER_IDS.BILLING_MANUAL,
      configured: false,
      sandbox,
      setupHintFa: SETTINGS_HINT,
    };
  }

  // Preferred gateway missing keys
  if (zarinpalMerchantId && preferredProvider !== PROVIDER_IDS.BILLING_IDPAY) {
    return { provider: PROVIDER_IDS.BILLING_ZARINPAL, configured: true, sandbox };
  }
  if (idpayApiKey) {
    return { provider: PROVIDER_IDS.BILLING_IDPAY, configured: true, sandbox };
  }

  return {
    provider: PROVIDER_IDS.BILLING_MANUAL,
    configured: false,
    sandbox,
    setupHintFa: SETTINGS_HINT,
  };
}

export async function getInvoicePaymentAvailability(
  organizationId: string,
): Promise<InvoiceGatewayAvailability> {
  const creds = await resolvePaymentCredentials(organizationId);
  return availabilityFromResolved(creds);
}

/** Returns a live gateway or null when only manual recording is available. */
export async function getInvoicePaymentGateway(
  organizationId: string,
): Promise<InvoicePaymentGateway | null> {
  const creds = await resolvePaymentCredentials(organizationId);
  const availability = availabilityFromResolved(creds);
  if (!availability.configured) return null;

  if (availability.provider === PROVIDER_IDS.BILLING_ZARINPAL && creds.zarinpalMerchantId) {
    return createZarinpalGateway(creds.zarinpalMerchantId, { sandbox: creds.sandbox });
  }
  if (availability.provider === PROVIDER_IDS.BILLING_IDPAY && creds.idpayApiKey) {
    return createIdpayGateway(creds.idpayApiKey, { sandbox: creds.sandbox });
  }
  return null;
}

/** Build gateway for a specific provider using org (then env) credentials — for verify callbacks. */
export async function getInvoicePaymentGatewayByProvider(
  organizationId: string,
  provider: string,
): Promise<InvoicePaymentGateway | null> {
  const creds = await resolvePaymentCredentials(organizationId);
  if (provider === PROVIDER_IDS.BILLING_ZARINPAL && creds.zarinpalMerchantId) {
    return createZarinpalGateway(creds.zarinpalMerchantId, { sandbox: creds.sandbox });
  }
  if (provider === PROVIDER_IDS.BILLING_IDPAY && creds.idpayApiKey) {
    return createIdpayGateway(creds.idpayApiKey, { sandbox: creds.sandbox });
  }
  return null;
}
