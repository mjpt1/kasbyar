import { apiSuccess, errorResponse, jsonResponse } from '@/lib/api-response';
import { isApiError, requireApiSession } from '@/lib/api-auth';
import { followUpSchema } from '@/lib/validators';
import { addFollowUp } from '@/server/leads/lead.service';

export async function POST(
  request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const session = await requireApiSession();
  if (isApiError(session)) return session;

  const { id } = await params;
  const body = await request.json();
  const parsed = followUpSchema.safeParse(body);
  if (!parsed.success) {
    return errorResponse(parsed.error.errors[0]?.message ?? 'داده نامعتبر', 400);
  }

  const followUp = await addFollowUp(session.organizationId, session.user.id, id, {
    note: parsed.data.note,
    channel: parsed.data.channel,
    nextFollowUpAt: parsed.data.nextFollowUpAt
      ? new Date(parsed.data.nextFollowUpAt)
      : undefined,
  });

  if (!followUp) return errorResponse('لید یافت نشد', 404, 'NOT_FOUND');
  return jsonResponse(apiSuccess(followUp), 201);
}
