import { apiSuccess, jsonResponse } from '@/lib/api-response';
import { handleApiError, isApiError, requireApiSession } from '@/lib/api-auth';
import { parseBody, paginationQuerySchema } from '@/lib/validators/parse';
import { customerSchema } from '@/lib/validators';
import { listCustomers, createCustomer } from '@/server/customers/customer.service';

export async function GET(request: Request) {
  try {
    const session = await requireApiSession();
    if (isApiError(session)) return session;

    const { searchParams } = new URL(request.url);
    const { page, pageSize, search } = paginationQuerySchema.parse(searchParams);

    const data = await listCustomers(session.organizationId, {
      search,
      page,
      pageSize,
    });
    return jsonResponse(apiSuccess(data));
  } catch (error) {
    return handleApiError(error, 'customers.GET');
  }
}

export async function POST(request: Request) {
  try {
    const session = await requireApiSession();
    if (isApiError(session)) return session;

    const body = await request.json();
    const parsed = parseBody(customerSchema, body);
    if (!parsed.ok) return parsed.response;

    const { assertQuota } = await import('@/server/billing/entitlement.service');
    await assertQuota(session.organizationId, 'customers');

    const customer = await createCustomer(
      session.organizationId,
      session.user.id,
      {
        ...parsed.data,
        email: parsed.data.email || null,
      },
    );

    return jsonResponse(apiSuccess(customer), 201);
  } catch (error) {
    return handleApiError(error, 'customers.POST');
  }
}
