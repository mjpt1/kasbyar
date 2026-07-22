import { apiSuccess, errorResponse, jsonResponse } from '@/lib/api-response';
import { startOnlinePaymentForLink } from '@/server/payments/invoice-payment.service';

export async function POST(
  _request: Request,
  context: { params: Promise<{ token: string }> },
) {
  try {
    const { token } = await context.params;
    const result = await startOnlinePaymentForLink(token);
    return jsonResponse(apiSuccess(result));
  } catch (error) {
    const message = error instanceof Error ? error.message : 'شروع پرداخت ناموفق بود';
    return errorResponse(message, 400);
  }
}
