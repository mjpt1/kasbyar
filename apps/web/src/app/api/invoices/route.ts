import { apiSuccess, jsonResponse } from '@/lib/api-response';
import {
  handleApiError,
  isApiError,
  requireApiRole,
  requireApiSession,
} from '@/lib/api-auth';
import { invoiceSchema } from '@/lib/validators';
import { parseBody, paginationQuerySchema } from '@/lib/validators/parse';
import { listInvoices, createInvoice } from '@/server/invoices/invoice.service';

export async function GET(request: Request) {
  try {
    const session = await requireApiSession();
    if (isApiError(session)) return session;

    const { searchParams } = new URL(request.url);
    const { page, search, status } = paginationQuerySchema.parse(searchParams);

    const data = await listInvoices(session.organizationId, {
      search,
      status,
      page,
    });
    return jsonResponse(apiSuccess(data));
  } catch (error) {
    return handleApiError(error, 'invoices.GET');
  }
}

export async function POST(request: Request) {
  try {
    const session = await requireApiSession();
    if (isApiError(session)) return session;

    const denied = requireApiRole(session, 'MANAGER');
    if (denied) return denied;

    const body = await request.json();
    const parsed = parseBody(invoiceSchema, body);
    if (!parsed.ok) return parsed.response;

    const { assertQuota } = await import('@/server/billing/entitlement.service');
    await assertQuota(session.organizationId, 'invoicesPerMonth');

    const invoice = await createInvoice(session.organizationId, session.user.id, {
      customerId: parsed.data.customerId,
      dueDate: parsed.data.dueDate ? new Date(parsed.data.dueDate) : undefined,
      notes: parsed.data.notes,
      kind: parsed.data.kind,
      items: parsed.data.items,
    });

    return jsonResponse(apiSuccess(invoice), 201);
  } catch (error) {
    return handleApiError(error, 'invoices.POST');
  }
}
