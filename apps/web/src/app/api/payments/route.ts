import { apiSuccess, jsonResponse } from '@/lib/api-response';
import {
  handleApiError,
  isApiError,
  requireApiRole,
  requireApiSession,
} from '@/lib/api-auth';
import { paymentSchema } from '@/lib/validators';
import { parseBody, paginationQuerySchema } from '@/lib/validators/parse';
import { listPayments, createPayment } from '@/server/payments/payment.service';

export async function GET(request: Request) {
  try {
    const session = await requireApiSession();
    if (isApiError(session)) return session;

    const { page } = paginationQuerySchema.parse(new URL(request.url).searchParams);
    const data = await listPayments(session.organizationId, { page });
    return jsonResponse(apiSuccess(data));
  } catch (error) {
    return handleApiError(error, 'payments.GET');
  }
}

export async function POST(request: Request) {
  try {
    const session = await requireApiSession();
    if (isApiError(session)) return session;

    const denied = requireApiRole(session, 'MANAGER');
    if (denied) return denied;

    const body = await request.json();
    const parsed = parseBody(paymentSchema, body);
    if (!parsed.ok) return parsed.response;

    const payment = await createPayment(session.organizationId, session.user.id, {
      ...parsed.data,
      paidAt: parsed.data.paidAt ? new Date(parsed.data.paidAt) : undefined,
    });

    return jsonResponse(apiSuccess(payment), 201);
  } catch (error) {
    return handleApiError(error, 'payments.POST');
  }
}
