import { apiSuccess, jsonResponse } from '@/lib/api-response';
import { handleApiError, isApiError, requireApiSession } from '@/lib/api-auth';
import { leadSchema } from '@/lib/validators';
import { parseBody, paginationQuerySchema } from '@/lib/validators/parse';
import { listLeads, createLead } from '@/server/leads/lead.service';

export async function GET(request: Request) {
  try {
    const session = await requireApiSession();
    if (isApiError(session)) return session;

    const { searchParams } = new URL(request.url);
    const { page, search, status } = paginationQuerySchema.parse(searchParams);

    const data = await listLeads(session.organizationId, { search, status, page });
    return jsonResponse(apiSuccess(data));
  } catch (error) {
    return handleApiError(error, 'leads.GET');
  }
}

export async function POST(request: Request) {
  try {
    const session = await requireApiSession();
    if (isApiError(session)) return session;

    const body = await request.json();
    const parsed = parseBody(leadSchema, body);
    if (!parsed.ok) return parsed.response;

    const { assertQuota } = await import('@/server/billing/entitlement.service');
    await assertQuota(session.organizationId, 'leads');

    const lead = await createLead(session.organizationId, session.user.id, {
      title: parsed.data.title,
      status: parsed.data.status ?? 'NEW',
      source: parsed.data.source ?? 'OTHER',
      contactName: parsed.data.contactName,
      contactPhone: parsed.data.contactPhone,
      contactEmail: parsed.data.contactEmail,
      description: parsed.data.description,
      value: parsed.data.value,
      nextFollowUpAt: parsed.data.nextFollowUpAt
        ? new Date(parsed.data.nextFollowUpAt)
        : undefined,
      customer: parsed.data.customerId
        ? { connect: { id: parsed.data.customerId } }
        : undefined,
    });

    return jsonResponse(apiSuccess(lead), 201);
  } catch (error) {
    return handleApiError(error, 'leads.POST');
  }
}
