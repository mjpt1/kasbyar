import { CheckSquare } from 'lucide-react';

import { TasksCreateForm } from '@/components/features/tasks/tasks-create-form';
import { RemindersPanel } from '@/components/features/tasks/reminders-panel';
import { TaskRowActions } from '@/components/features/tasks/task-row-actions';
import { PageHeader } from '@/components/layout/page-header';
import { EmptyState } from '@/components/shared/empty-state';
import { JalaliDate } from '@/components/shared/jalali-date';
import { TaskPriorityBadge } from '@/components/shared/status-badges';
import { Card, CardContent } from '@/components/ui/card';
import { requireSession } from '@/lib/auth/session';
import { listReminders, listTasks } from '@/server/tasks/task.service';

export default async function TasksPage() {
  const session = await requireSession();
  const [{ items, total }, reminders] = await Promise.all([
    listTasks(session.organizationId, {}),
    listReminders(session.organizationId, true),
  ]);

  const reminderRows = reminders.map((r) => ({
    id: r.id,
    title: r.title,
    message: r.message,
    remindAt: r.remindAt.toISOString(),
  }));

  return (
    <div className="space-y-6">
      <PageHeader title="وظایف و یادآورها" description={`${total} وظیفه`} />

      <div className="grid gap-6 lg:grid-cols-3">
        <div className="space-y-6 lg:col-span-2">
          <TasksCreateForm />

          {items.length === 0 ? (
            <EmptyState
              icon={CheckSquare}
              title="وظیفه‌ای ثبت نشده"
              description="کارهای روزانه تیم را اینجا مدیریت کنید."
            />
          ) : (
            <Card>
              <CardContent className="p-0">
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="border-b bg-muted/50">
                        <th className="p-3 text-right font-medium">عنوان</th>
                        <th className="p-3 text-right font-medium">مسئول</th>
                        <th className="p-3 text-right font-medium">وضعیت</th>
                        <th className="p-3 text-right font-medium">اولویت</th>
                        <th className="p-3 text-right font-medium">سررسید</th>
                      </tr>
                    </thead>
                    <tbody>
                      {items.map((task) => (
                        <tr key={task.id} className="border-b hover:bg-muted/30">
                          <td className="p-3">
                            <div className="font-medium">{task.title}</div>
                            {task.description ? (
                              <div className="text-xs text-muted-foreground line-clamp-1">
                                {task.description}
                              </div>
                            ) : null}
                          </td>
                          <td className="p-3">{task.assignee?.name ?? '—'}</td>
                          <td className="p-3">
                            <TaskRowActions taskId={task.id} status={task.status} />
                          </td>
                          <td className="p-3">
                            <TaskPriorityBadge priority={task.priority} />
                          </td>
                          <td className="p-3 text-muted-foreground">
                            {task.dueDate ? <JalaliDate date={task.dueDate} /> : '—'}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </CardContent>
            </Card>
          )}
        </div>

        <RemindersPanel reminders={reminderRows} />
      </div>
    </div>
  );
}
