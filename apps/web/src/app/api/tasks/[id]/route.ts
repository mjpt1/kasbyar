import { apiSuccess, errorResponse, jsonResponse } from '@/lib/api-response';
import { isApiError, requireApiSession } from '@/lib/api-auth';
import { taskUpdateSchema } from '@/lib/validators';
import { updateTask } from '@/server/tasks/task.service';

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const session = await requireApiSession();
  if (isApiError(session)) return session;

  const { id } = await params;
  const body = await request.json();
  const parsed = taskUpdateSchema.safeParse(body);
  if (!parsed.success) {
    return errorResponse(parsed.error.errors[0]?.message ?? 'داده نامعتبر', 400);
  }

  const data = {
    ...parsed.data,
    ...(parsed.data.dueDate !== undefined
      ? { dueDate: parsed.data.dueDate ? new Date(parsed.data.dueDate) : null }
      : {}),
    ...(parsed.data.status === 'DONE' ? { completedAt: new Date() } : {}),
    ...(parsed.data.status && parsed.data.status !== 'DONE'
      ? { completedAt: null }
      : {}),
  };

  const result = await updateTask(session.organizationId, id, data);
  if (result.count === 0) return errorResponse('وظیفه یافت نشد', 404, 'NOT_FOUND');

  return jsonResponse(apiSuccess({ updated: true }));
}
