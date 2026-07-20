import { describe, expect, it } from 'vitest';

function cashRunwayDays(input: {
  monthlyCash: number;
  prevMonthlyCash: number;
  weeklyCash: number;
  receivablesOpen: number;
}) {
  const cashDecline = Math.max(0, input.prevMonthlyCash - input.monthlyCash);
  const estimatedBurn = cashDecline > 0 ? cashDecline : input.monthlyCash * 0.4;
  const dailyBurn = estimatedBurn > 0 ? estimatedBurn / 30 : input.weeklyCash / 7;
  const liquidBuffer = Math.max(
    input.monthlyCash * 0.35 + Math.max(0, input.receivablesOpen) * 0.15,
    input.weeklyCash,
  );
  return dailyBurn > 0 ? Math.round(liquidBuffer / dailyBurn) : input.monthlyCash > 0 ? 90 : 14;
}

describe('forecast cash runway heuristic', () => {
  it('returns finite runway with cash flow', () => {
    const days = cashRunwayDays({
      monthlyCash: 300_000_000,
      prevMonthlyCash: 280_000_000,
      weeklyCash: 70_000_000,
      receivablesOpen: 50_000_000,
    });
    expect(days).toBeGreaterThan(10);
    expect(days).toBeLessThan(200);
  });

  it('handles zero cash', () => {
    expect(
      cashRunwayDays({
        monthlyCash: 0,
        prevMonthlyCash: 0,
        weeklyCash: 0,
        receivablesOpen: 0,
      }),
    ).toBe(14);
  });
});
