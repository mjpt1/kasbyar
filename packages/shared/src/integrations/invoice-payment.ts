/**
 * Invoice online payment gateway contract (CRM invoices — separate from SaaS billing).
 */
import type { ProviderId } from './categories';

export interface InvoicePaymentRequest {
  organizationId: string;
  invoiceId: string;
  paymentId: string;
  amountIrr: number;
  description: string;
  callbackUrl: string;
  /** Mobile for some gateways */
  mobile?: string;
  email?: string;
}

export interface InvoicePaymentRequestResult {
  paymentUrl: string;
  providerRef: string;
  provider: string;
}

export interface InvoicePaymentVerifyRequest {
  providerRef: string;
  amountIrr: number;
  /** Extra fields from callback query/body */
  raw?: Record<string, string | undefined>;
}

export interface InvoicePaymentVerifyResult {
  status: 'paid' | 'failed' | 'pending';
  providerRef: string;
  reference?: string;
  messageFa?: string;
}

export interface InvoicePaymentGateway {
  readonly id: ProviderId | string;
  createPayment(params: InvoicePaymentRequest): Promise<InvoicePaymentRequestResult>;
  verifyPayment(params: InvoicePaymentVerifyRequest): Promise<InvoicePaymentVerifyResult>;
}
