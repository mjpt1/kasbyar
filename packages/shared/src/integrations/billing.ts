/**
 * Billing / payment gateway adapter contract.
 * Business logic uses domain types only — never PSP field names.
 */
import type { ProviderId } from './categories';

export interface CheckoutSessionRequest {
  organizationId: string;
  planCode: string;
  billingPeriod: 'MONTHLY' | 'YEARLY';
  returnUrl: string;
  /** IRR amount in smallest unit if known — optional for manual */
  amountMinor?: number;
}

export interface CheckoutSessionResult {
  /** null = no redirect (manual billing) */
  checkoutUrl: string | null;
  /** Opaque provider reference for webhook reconciliation */
  providerRef: string;
  status: 'ready' | 'pending' | 'manual';
}

export interface PaymentWebhookEvent {
  providerRef: string;
  organizationId?: string;
  planCode?: string;
  status: 'paid' | 'failed' | 'pending' | 'refunded';
  amountMinor?: number;
  currency?: string;
  occurredAt: string;
}

export interface BillingProvider {
  readonly id: ProviderId | string;
  createCheckoutSession(params: CheckoutSessionRequest): Promise<CheckoutSessionResult>;
  parseWebhook?(payload: unknown, headers?: Record<string, string>): Promise<PaymentWebhookEvent | null>;
  verifyWebhook?(payload: unknown, headers?: Record<string, string>): boolean;
}
