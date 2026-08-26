import { describe, expect, it } from 'vitest';

import {
  getPackDashboardChartDefs,
  listPackIdsWithDashboardCharts,
} from './dashboard-charts';
import { PACK_REGISTRY, isVerticalPack } from './registry';

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

  it('covers every vertical pack with homeRoute', () => {
    const withHome = Object.values(PACK_REGISTRY).filter(
      (p) => isVerticalPack(p.id) && p.homeRoute,
    );
    for (const pack of withHome) {
      expect(getPackDashboardChartDefs(pack.id).length).toBeGreaterThanOrEqual(1);
    }
    expect(listPackIdsWithDashboardCharts().length).toBeGreaterThanOrEqual(withHome.length);
  });

  it('overrides agency with seo-agency specialty charts', () => {
    const charts = getPackDashboardChartDefs('MARKETING_AGENCY', 'seo-agency');
    expect(charts.map((c) => c.key)).toEqual(['traffic-trend', 'leads-trend']);
  });

  it('returns specialty charts for new occupations', () => {
    expect(getPackDashboardChartDefs('CLEANING', 'dry-cleaning')).toHaveLength(2);
    expect(getPackDashboardChartDefs('WORKSHOP', 'phone-repair')).toHaveLength(2);
    expect(getPackDashboardChartDefs('GENERAL', 'translation-bureau')).toHaveLength(2);
    expect(getPackDashboardChartDefs('CLINIC', 'medical-aesthetics')).toHaveLength(2);
  });

  it('returns empty for GENERAL without specialty override', () => {
    expect(getPackDashboardChartDefs('GENERAL')).toEqual([]);
  });
});
