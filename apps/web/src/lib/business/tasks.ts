export type TaskDueState = 'none' | 'overdue' | 'today' | 'upcoming';

const INACTIVE_STATUSES = new Set(['DONE', 'CANCELLED']);

export function startOfDay(date: Date): Date {
  const d = new Date(date);
  d.setHours(0, 0, 0, 0);
  return d;
}

export function endOfDay(date: Date): Date {
  const d = new Date(date);
  d.setHours(23, 59, 59, 999);
  return d;
}

export function getTaskDueState(
  dueDate: Date | null | undefined,
  status: string,
  now = new Date(),
): TaskDueState {
  if (!dueDate || INACTIVE_STATUSES.has(status)) return 'none';

  const dayStart = startOfDay(now);
  const dayEnd = endOfDay(now);

  if (dueDate < dayStart) return 'overdue';
  if (dueDate <= dayEnd) return 'today';
  return 'upcoming';
}

export function isTaskDueToday(
  dueDate: Date | null | undefined,
  status: string,
  now = new Date(),
): boolean {
  return getTaskDueState(dueDate, status, now) === 'today';
}
