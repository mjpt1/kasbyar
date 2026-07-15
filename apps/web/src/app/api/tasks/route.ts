import { apiSuccess, jsonResponse } from '@/lib/api-response';
import { handleApiError, isApiError, requireApiSession } from '@/lib/api-auth';
import { taskSchema } from '@/lib/validators';
import { parseBody, paginationQuerySchema } from '@/lib/validators/parse';
import { listTasks, createTask } from '@/server/tasks/task.service';

export async function GET(request: Request) {
  try {
    const session = await requireApiSession();
    if (isApiError(session)) return session;

    const { searchParams } = new URL(request.url);
    const { page, status } = paginationQuerySchema.parse(searchParams);

    const data = await listTasks(session.organizationId, { status, page });
    return jsonResponse(apiSuccess(data));
  } catch (error) {
    return handleApiError(error, 'tasks.GET');
  }
}

export async function POST(request: Request) {
  try {
    const session = await requireApiSession();
    if (isApiError(session)) return session;

    const body = await request.json();
    const parsed = parseBody(taskSchema, body);
    if (!parsed.ok) return parsed.response;

    const task = await createTask(session.organizationId, session.user.id, {
      title: parsed.data.title,
      description: parsed.data.description,
      priority: parsed.data.priority,
      assigneeId: parsed.data.assigneeId,
      dueDate: parsed.data.dueDate ? new Date(parsed.data.dueDate) : undefined,
    });

    return jsonResponse(apiSuccess(task), 201);
  } catch (error) {
    return handleApiError(error, 'tasks.POST');
  }
}
