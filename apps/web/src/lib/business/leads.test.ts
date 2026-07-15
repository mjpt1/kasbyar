import { describe, expect, it } from 'vitest';

import { isStaleLead } from './leads';

describe('isStaleLead', () => {
  const now = new Date('2026-07-15T12:00:00');

  it('returns false for won leads', () => {
    expect(
      isStaleLead({ status: 'WON', lastContactAt: null }, 7, now),
    ).toBe(false);
  });

  it('returns true when never contacted', () => {
    expect(
      isStaleLead({ status: 'NEW', lastContactAt: null }, 7, now),
    ).toBe(true);
  });

  it('returns true when last contact older than threshold', () => {
    const old = new Date('2026-07-01');
    expect(
      isStaleLead({ status: 'CONTACTED', lastContactAt: old }, 7, now),
    ).toBe(true);
  });

  it('returns false for recent contact', () => {
    const recent = new Date('2026-07-14');
    expect(
      isStaleLead({ status: 'CONTACTED', lastContactAt: recent }, 7, now),
    ).toBe(false);
  });
});
