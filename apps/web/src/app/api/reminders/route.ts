import { apiSuccess, errorResponse, jsonResponse } from '@/lib/api-response';
import { isApiError, requireApiSession } from '@/lib/api-auth';
import { reminderSchema } from '@/lib/validators';
import { createReminder, listReminders } from '@/server/tasks/task.service';

export async function GET() {
  const session = await requireApiSession();
  if (isApiError(session)) return session;

  const reminders = await listReminders(session.organizationId, true);
  return jsonResponse(apiSuccess(reminders));
}

export async function POST(request: Request) {
  const session = await requireApiSession();
  if (isApiError(session)) return session;

  const body = await request.json();
  const parsed = reminderSchema.safeParse(body);
  if (!parsed.success) {
    return errorResponse(parsed.error.errors[0]?.message ?? 'داده نامعتبر', 400);
  }

  const reminder = await createReminder(session.organizationId, {
    title: parsed.data.title,
    message: parsed.data.message,
    remindAt: new Date(parsed.data.remindAt),
    userId: session.user.id,
    taskId: parsed.data.taskId,
  });

  return jsonResponse(apiSuccess(reminder), 201);
}
