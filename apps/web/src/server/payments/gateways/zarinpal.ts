import type {
  InvoicePaymentGateway,
  InvoicePaymentRequest,
  InvoicePaymentRequestResult,
  InvoicePaymentVerifyRequest,
  InvoicePaymentVerifyResult,
} from '@kesbyar/shared';
import { PROVIDER_IDS } from '@kesbyar/shared';

function sandboxEnabled(override?: boolean): boolean {
  if (typeof override === 'boolean') return override;
  const v = process.env.PAYMENT_SANDBOX ?? process.env.ZARINPAL_SANDBOX ?? 'true';
  return v !== 'false' && v !== '0';
}

/**
 * Zarinpal PG v4 — real HTTP calls when merchant id is set.
 * @see https://docs.zarinpal.com/paymentGateway/
 */
export function createZarinpalGateway(
  merchantId: string,
  opts?: { sandbox?: boolean },
): InvoicePaymentGateway {
  const sandbox = sandboxEnabled(opts?.sandbox);
  const apiBase = sandbox
    ? 'https://sandbox.zarinpal.com/pg/v4/payment'
    : 'https://payment.zarinpal.com/pg/v4/payment';
  const startPayBase = sandbox
    ? 'https://sandbox.zarinpal.com/pg/StartPay'
    : 'https://www.zarinpal.com/pg/StartPay';

  return {
    id: PROVIDER_IDS.BILLING_ZARINPAL,
    async createPayment(params: InvoicePaymentRequest): Promise<InvoicePaymentRequestResult> {
      const res = await fetch(`${apiBase}/request.json`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
        body: JSON.stringify({
          merchant_id: merchantId,
          amount: params.amountIrr,
          callback_url: params.callbackUrl,
          description: params.description.slice(0, 255),
          metadata: {
            mobile: params.mobile,
            email: params.email,
            order_id: params.paymentId,
          },
        }),
      });

      const data = (await res.json()) as {
        data?: { code?: number; authority?: string; message?: string };
        errors?: { message?: string } | unknown[];
      };

      const code = data.data?.code;
      const authority = data.data?.authority;
      if (code !== 100 || !authority) {
        const errMsg =
          (typeof data.errors === 'object' &&
            data.errors &&
            !Array.isArray(data.errors) &&
            'message' in data.errors &&
            String((data.errors as { message?: string }).message)) ||
          data.data?.message ||
          'خطا در ایجاد درخواست پرداخت زرین‌پال';
        throw new Error(errMsg);
      }

      return {
        paymentUrl: `${startPayBase}/${authority}`,
        providerRef: authority,
        provider: PROVIDER_IDS.BILLING_ZARINPAL,
      };
    },

    async verifyPayment(params: InvoicePaymentVerifyRequest): Promise<InvoicePaymentVerifyResult> {
      const authority = params.providerRef || params.raw?.Authority || params.raw?.authority;
      if (!authority) {
        return {
          status: 'failed',
          providerRef: '',
          messageFa: 'شناسه پیگیری درگاه یافت نشد',
        };
      }

      const status = (params.raw?.Status || params.raw?.status || '').toUpperCase();
      if (status && status !== 'OK') {
        return {
          status: 'failed',
          providerRef: authority,
          messageFa: 'پرداخت توسط کاربر لغو شد یا ناموفق بود',
        };
      }

      const res = await fetch(`${apiBase}/verify.json`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
        body: JSON.stringify({
          merchant_id: merchantId,
          amount: params.amountIrr,
          authority,
        }),
      });

      const data = (await res.json()) as {
        data?: { code?: number; ref_id?: number; message?: string };
      };

      const code = data.data?.code;
      // 100 = first verify success, 101 = already verified
      if (code === 100 || code === 101) {
        return {
          status: 'paid',
          providerRef: authority,
          reference: data.data?.ref_id != null ? String(data.data.ref_id) : authority,
          messageFa: code === 101 ? 'این پرداخت قبلاً تأیید شده است' : 'پرداخت با موفقیت تأیید شد',
        };
      }

      return {
        status: 'failed',
        providerRef: authority,
        messageFa: data.data?.message || 'تأیید پرداخت زرین‌پال ناموفق بود',
      };
    },
  };
}
