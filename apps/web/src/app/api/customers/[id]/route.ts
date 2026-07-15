import { apiSuccess, errorResponse, jsonResponse } from '@/lib/api-response';
import { isApiError, requireApiSession } from '@/lib/api-auth';
import { customerUpdateSchema } from '@/lib/validators';
import {
  deleteCustomer,
  getCustomer,
  updateCustomer,
} from '@/server/customers/customer.service';

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const session = await requireApiSession();
  if (isApiError(session)) return session;

  const { id } = await params;
  const customer = await getCustomer(session.organizationId, id);
  if (!customer) return errorResponse('مشتری یافت نشد', 404, 'NOT_FOUND');

  return jsonResponse(apiSuccess(customer));
}

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const session = await requireApiSession();
  if (isApiError(session)) return session;

  const { id } = await params;
  const body = await request.json();
  const parsed = customerUpdateSchema.safeParse(body);
  if (!parsed.success) {
    return errorResponse(parsed.error.errors[0]?.message ?? 'داده نامعتبر', 400);
  }

  const customer = await updateCustomer(session.organizationId, id, {
    ...parsed.data,
    email: parsed.data.email === '' ? null : parsed.data.email,
    phone: parsed.data.phone === '' ? null : parsed.data.phone,
  });

  if (!customer) return errorResponse('مشتری یافت نشد', 404, 'NOT_FOUND');
  return jsonResponse(apiSuccess(customer));
}

export async function DELETE(
  _request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const session = await requireApiSession();
  if (isApiError(session)) return session;

  const { id } = await params;
  const result = await deleteCustomer(session.organizationId, id, session.user.id);
  if (result.count === 0) return errorResponse('مشتری یافت نشد', 404, 'NOT_FOUND');

  return jsonResponse(apiSuccess({ deleted: true }));
}
