import { CheckSquare } from 'lucide-react';

import { TasksCreateForm } from '@/components/features/tasks/tasks-create-form';
import { RemindersPanel } from '@/components/features/tasks/reminders-panel';
import { TaskRowActions } from '@/components/features/tasks/task-row-actions';
import { PageHeader } from '@/components/layout/page-header';
import { EmptyState } from '@/components/shared/empty-state';
import { JalaliDate } from '@/components/shared/jalali-date';
import { ResponsiveTable } from '@/components/shared/responsive-table';
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
              <CardContent className="p-3 md:p-0">
                <ResponsiveTable
                  columns={[
                    { key: 'title', header: 'عنوان' },
                    { key: 'assignee', header: 'مسئول', hideOnMobile: true },
                    { key: 'status', header: 'وضعیت' },
                    { key: 'priority', header: 'اولویت' },
                    { key: 'due', header: 'سررسید' },
                  ]}
                  rows={items.map((task) => ({
                    id: task.id,
                    cells: {
                      title: (
                        <div>
                          <div className="font-medium">{task.title}</div>
                          {task.description ? (
                            <div className="line-clamp-1 text-xs text-muted-foreground">
                              {task.description}
                            </div>
                          ) : null}
                        </div>
                      ),
                      assignee: task.assignee?.name ?? '—',
                      status: <TaskRowActions taskId={task.id} status={task.status} />,
                      priority: <TaskPriorityBadge priority={task.priority} />,
                      due: task.dueDate ? <JalaliDate date={task.dueDate} /> : '—',
                    },
                  }))}
                />
              </CardContent>
            </Card>
          )}
        </div>

        <RemindersPanel reminders={reminderRows} />
      </div>
    </div>
  );
}
