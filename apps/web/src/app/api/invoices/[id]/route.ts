import { apiSuccess, errorResponse, jsonResponse } from '@/lib/api-response';
import { isApiError, requireApiSession } from '@/lib/api-auth';
import { invoiceStatusSchema } from '@/lib/validators';
import { getInvoice, updateInvoiceStatus } from '@/server/invoices/invoice.service';
import { logActivity } from '@/server/audit/audit.service';

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const session = await requireApiSession();
  if (isApiError(session)) return session;

  const { id } = await params;
  const invoice = await getInvoice(session.organizationId, id);
  if (!invoice) return errorResponse('فاکتور یافت نشد', 404, 'NOT_FOUND');

  return jsonResponse(apiSuccess(invoice));
}

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const session = await requireApiSession();
  if (isApiError(session)) return session;

  const { id } = await params;
  const body = await request.json();
  const parsed = invoiceStatusSchema.safeParse(body);
  if (!parsed.success) {
    return errorResponse(parsed.error.errors[0]?.message ?? 'داده نامعتبر', 400);
  }

  const existing = await getInvoice(session.organizationId, id);
  if (!existing) return errorResponse('فاکتور یافت نشد', 404, 'NOT_FOUND');

  await updateInvoiceStatus(
    session.organizationId,
    id,
    parsed.data.status,
    session.user.id,
  );

  await logActivity({
    organizationId: session.organizationId,
    userId: session.user.id,
    type: 'INVOICE',
    title: 'وضعیت فاکتور تغییر کرد',
    description: `${existing.number} → ${parsed.data.status}`,
    customerId: existing.customerId,
    invoiceId: id,
  });

  const invoice = await getInvoice(session.organizationId, id);
  return jsonResponse(apiSuccess(invoice));
}
