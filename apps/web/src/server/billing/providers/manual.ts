import {
  PROVIDER_IDS,
  resolveProviderId,
  type BillingProvider,
  type CheckoutSessionRequest,
} from '@kesbyar/shared';

/**
 * Manual billing — no payment gateway redirect.
 * Admin / in-app plan change only.
 */
export const manualBillingProvider: BillingProvider = {
  id: PROVIDER_IDS.BILLING_MANUAL,
  async createCheckoutSession(_params: CheckoutSessionRequest) {
    return {
      checkoutUrl: null,
      providerRef: `manual-${Date.now()}`,
      status: 'manual' as const,
    };
  },
};

const ALLOWED_BILLING_PROVIDERS = [
  PROVIDER_IDS.BILLING_MANUAL,
  PROVIDER_IDS.BILLING_ZARINPAL,
  PROVIDER_IDS.BILLING_IDPAY,
] as const;

let cached: BillingProvider | null = null;

export function getBillingProvider(explicitId?: string | null): BillingProvider {
  if (cached && !explicitId) {
    return cached;
  }

  const id = resolveProviderId(
    explicitId,
    process.env.BILLING_PROVIDER,
    PROVIDER_IDS.BILLING_MANUAL,
    ALLOWED_BILLING_PROVIDERS,
  );

  switch (id) {
    case PROVIDER_IDS.BILLING_ZARINPAL:
    case PROVIDER_IDS.BILLING_IDPAY:
      // post-V1: return zarinpalBillingProvider
      cached = manualBillingProvider;
      return cached;
    case PROVIDER_IDS.BILLING_MANUAL:
    default:
      cached = manualBillingProvider;
      return cached;
  }
}

/** @deprecated import BillingProvider from @kesbyar/shared */
export type { BillingProvider };
