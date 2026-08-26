import { describe, expect, it } from 'vitest';

import { getPackDashboardChartDefs } from './dashboard-charts';

describe('getPackDashboardChartDefs', () => {
  it('returns clinic charts', () => {
    const charts = getPackDashboardChartDefs('CLINIC');
    expect(charts.map((c) => c.key)).toEqual(['appointments-trend', 'visit-status']);
  });

  it('returns beauty charts', () => {
    const charts = getPackDashboardChartDefs('BEAUTY_SALON');
    expect(charts).toHaveLength(2);
    expect(charts[0]?.kind).toBe('bar');
  });

  it('returns retail, food, and agency charts', () => {
    expect(getPackDashboardChartDefs('RETAIL')).toHaveLength(2);
    expect(getPackDashboardChartDefs('FOOD_SERVICE')).toHaveLength(2);
    expect(getPackDashboardChartDefs('MARKETING_AGENCY')).toHaveLength(2);
  });

  it('overrides agency with seo-agency specialty charts', () => {
    const charts = getPackDashboardChartDefs('MARKETING_AGENCY', 'seo-agency');
    expect(charts.map((c) => c.key)).toEqual(['traffic-trend', 'leads-trend']);
  });

  it('returns empty for packs without chart defs', () => {
    expect(getPackDashboardChartDefs('TRAVEL_AGENCY')).toEqual([]);
  });
});
