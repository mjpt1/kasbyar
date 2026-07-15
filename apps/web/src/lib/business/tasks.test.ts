import { describe, expect, it } from 'vitest';

import { getTaskDueState } from './tasks';

describe('getTaskDueState', () => {
  const now = new Date('2026-07-15T12:00:00');

  it('returns none for completed tasks', () => {
    expect(getTaskDueState(new Date('2026-07-10'), 'DONE', now)).toBe('none');
  });

  it('returns overdue for past due dates', () => {
    expect(getTaskDueState(new Date('2026-07-10'), 'TODO', now)).toBe('overdue');
  });

  it('returns today for due date on same day', () => {
    expect(getTaskDueState(new Date('2026-07-15T18:00:00'), 'TODO', now)).toBe(
      'today',
    );
  });

  it('returns upcoming for future dates', () => {
    expect(getTaskDueState(new Date('2026-07-20'), 'TODO', now)).toBe(
      'upcoming',
    );
  });
});
