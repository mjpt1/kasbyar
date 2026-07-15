import { apiSuccess, errorResponse, jsonResponse } from '@/lib/api-response';
import { isApiError, requireApiSession } from '@/lib/api-auth';
import { leadUpdateSchema } from '@/lib/validators';
import { getLead, updateLead } from '@/server/leads/lead.service';

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const session = await requireApiSession();
  if (isApiError(session)) return session;

  const { id } = await params;
  const lead = await getLead(session.organizationId, id);
  if (!lead) return errorResponse('لید یافت نشد', 404, 'NOT_FOUND');

  return jsonResponse(apiSuccess(lead));
}

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const session = await requireApiSession();
  if (isApiError(session)) return session;

  const { id } = await params;
  const body = await request.json();
  const parsed = leadUpdateSchema.safeParse(body);
  if (!parsed.success) {
    return errorResponse(parsed.error.errors[0]?.message ?? 'داده نامعتبر', 400);
  }

  const { stageId, nextFollowUpAt, value, ...rest } = parsed.data;

  const data: Parameters<typeof updateLead>[3] = {
    ...rest,
    ...(value !== undefined ? { value } : {}),
    ...(nextFollowUpAt !== undefined
      ? { nextFollowUpAt: nextFollowUpAt ? new Date(nextFollowUpAt) : null }
      : {}),
    ...(stageId !== undefined
      ? stageId
        ? { stage: { connect: { id: stageId } } }
        : { stage: { disconnect: true } }
      : {}),
  };

  const lead = await updateLead(
    session.organizationId,
    id,
    session.user.id,
    data,
  );

  if (!lead) return errorResponse('لید یافت نشد', 404, 'NOT_FOUND');
  return jsonResponse(apiSuccess(lead));
}
