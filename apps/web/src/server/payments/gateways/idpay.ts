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
  const v = process.env.PAYMENT_SANDBOX ?? process.env.IDPAY_SANDBOX ?? 'true';
  return v !== 'false' && v !== '0';
}

/**
 * IDPay v1.1 — real HTTP when API key is set.
 * @see https://idpay.ir/web-service/v1.1
 */
export function createIdpayGateway(
  apiKey: string,
  opts?: { sandbox?: boolean },
): InvoicePaymentGateway {
  const sandbox = sandboxEnabled(opts?.sandbox);

  return {
    id: PROVIDER_IDS.BILLING_IDPAY,
    async createPayment(params: InvoicePaymentRequest): Promise<InvoicePaymentRequestResult> {
      const res = await fetch('https://api.idpay.ir/v1.1/payment', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-API-KEY': apiKey,
          ...(sandbox ? { 'X-SANDBOX': '1' } : {}),
        },
        body: JSON.stringify({
          order_id: params.paymentId.slice(0, 50),
          amount: params.amountIrr,
          callback: params.callbackUrl,
          desc: params.description.slice(0, 255),
          name: undefined,
          phone: params.mobile,
          mail: params.email,
        }),
      });

      const data = (await res.json()) as {
        id?: string;
        link?: string;
        error_code?: number;
        error_message?: string;
      };

      if (!res.ok || !data.id || !data.link) {
        throw new Error(data.error_message || 'خطا در ایجاد درخواست پرداخت آیدی‌پی');
      }

      return {
        paymentUrl: data.link,
        providerRef: data.id,
        provider: PROVIDER_IDS.BILLING_IDPAY,
      };
    },

    async verifyPayment(params: InvoicePaymentVerifyRequest): Promise<InvoicePaymentVerifyResult> {
      const id = params.providerRef || params.raw?.id;
      const orderId = params.raw?.order_id;
      if (!id) {
        return {
          status: 'failed',
          providerRef: '',
          messageFa: 'شناسه تراکنش آیدی‌پی یافت نشد',
        };
      }

      const statusCode = Number(params.raw?.status ?? 0);
      // IDPay: 10 = waiting for verify after redirect
      if (statusCode && statusCode !== 10 && statusCode < 100) {
        return {
          status: 'failed',
          providerRef: id,
          messageFa: 'پرداخت ناموفق یا لغو شد',
        };
      }

      const res = await fetch('https://api.idpay.ir/v1.1/payment/verify', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-API-KEY': apiKey,
          ...(sandbox ? { 'X-SANDBOX': '1' } : {}),
        },
        body: JSON.stringify({
          id,
          order_id: orderId,
        }),
      });

      const data = (await res.json()) as {
        status?: number;
        track_id?: number | string;
        payment?: { track_id?: number | string };
        error_message?: string;
      };

      // 100 = paid verified, 101 = already verified
      if (data.status === 100 || data.status === 101) {
        const ref =
          data.track_id != null
            ? String(data.track_id)
            : data.payment?.track_id != null
              ? String(data.payment.track_id)
              : id;
        return {
          status: 'paid',
          providerRef: id,
          reference: ref,
          messageFa:
            data.status === 101 ? 'این پرداخت قبلاً تأیید شده است' : 'پرداخت با موفقیت تأیید شد',
        };
      }

      return {
        status: 'failed',
        providerRef: id,
        messageFa: data.error_message || 'تأیید پرداخت آیدی‌پی ناموفق بود',
      };
    },
  };
}
