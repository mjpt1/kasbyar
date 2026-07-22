import { apiSuccess, errorResponse, jsonResponse } from '@/lib/api-response';
import {
  handleApiError,
  isApiError,
  requireApiRole,
  requireApiSession,
} from '@/lib/api-auth';
import { createOrGetPaymentLink } from '@/server/payments/invoice-payment.service';
import {
  sendInvoiceDueReminderSms,
  sendInvoicePaymentLinkSms,
} from '@/server/notifications/sms-invoice.service';

export async function GET(
  _request: Request,
  context: { params: Promise<{ id: string }> },
) {
  try {
    const session = await requireApiSession();
    if (isApiError(session)) return session;
    const { id } = await context.params;

    const result = await createOrGetPaymentLink(session.organizationId, id);
    return jsonResponse(
      apiSuccess({
        publicUrl: result.publicUrl,
        remaining: result.remaining,
        gateway: result.gateway,
      }),
    );
  } catch (error) {
    return handleApiError(error, 'invoices.payment-link.GET');
  }
}

export async function POST(
  request: Request,
  context: { params: Promise<{ id: string }> },
) {
  try {
    const session = await requireApiSession();
    if (isApiError(session)) return session;
    const denied = requireApiRole(session, 'MANAGER');
    if (denied) return denied;

    const { id } = await context.params;
    const body = (await request.json().catch(() => ({}))) as {
      action?: 'link' | 'sms_link' | 'sms_due';
    };
    const action = body.action ?? 'link';

    if (action === 'sms_due') {
      const result = await sendInvoiceDueReminderSms({
        organizationId: session.organizationId,
        invoiceId: id,
      });
      return jsonResponse(apiSuccess(result));
    }

    if (action === 'sms_link') {
      const result = await sendInvoicePaymentLinkSms({
        organizationId: session.organizationId,
        invoiceId: id,
      });
      return jsonResponse(apiSuccess(result));
    }

    const result = await createOrGetPaymentLink(session.organizationId, id);
    return jsonResponse(
      apiSuccess({
        publicUrl: result.publicUrl,
        remaining: result.remaining,
        gateway: result.gateway,
      }),
    );
  } catch (error) {
    if (error instanceof Error) {
      return errorResponse(error.message, 400);
    }
    return handleApiError(error, 'invoices.payment-link.POST');
  }
}
