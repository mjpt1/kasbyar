const CLOSED_STATUSES = new Set(['WON', 'LOST']);

export function isClosedLeadStatus(status: string): boolean {
  return CLOSED_STATUSES.has(status);
}

export function getStaleLeadCutoff(staleDays: number, now = new Date()): Date {
  const cutoff = new Date(now);
  cutoff.setDate(cutoff.getDate() - staleDays);
  return cutoff;
}

/**
 * لید راکد: بدون تماس یا آخرین تماس قبل از cutoff — وضعیت نه WON نه LOST
 */
export function isStaleLead(
  lead: { status: string; lastContactAt: Date | null },
  staleDays = 7,
  now = new Date(),
): boolean {
  if (isClosedLeadStatus(lead.status)) return false;
  if (!lead.lastContactAt) return true;
  return lead.lastContactAt < getStaleLeadCutoff(staleDays, now);
}
