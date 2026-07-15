import { describe, expect, it } from 'vitest';

import { computeRemainingReceivable, sumReceivables } from './receivables';

describe('computeRemainingReceivable', () => {
  it('subtracts paid from total', () => {
    expect(computeRemainingReceivable(10_000_000, 3_000_000)).toBe(7_000_000);
  });

  it('never returns negative', () => {
    expect(computeRemainingReceivable(5_000_000, 6_000_000)).toBe(0);
  });
});

describe('sumReceivables', () => {
  it('aggregates remaining balances', () => {
    const total = sumReceivables([
      { total: 10_000_000, paidAmount: 2_000_000 },
      { total: 5_000_000, paidAmount: 0 },
    ]);
    expect(total).toBe(13_000_000);
  });
});
