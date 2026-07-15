import { describe, expect, it } from 'vitest';

import {
  DEMO_INVESTOR_ORDER,
  DEMO_SCENARIO_LIST,
  getScenarioByOrgSlug,
  getScenarioIdByOrgSlug,
} from './scenarios';

describe('demo scenario registry', () => {
  it('defines four scenarios with unique slugs', () => {
    expect(DEMO_SCENARIO_LIST).toHaveLength(4);
    const slugs = DEMO_SCENARIO_LIST.map((s) => s.orgSlug);
    expect(new Set(slugs).size).toBe(4);
    expect(slugs).toContain('demo-general');
    expect(slugs).toContain('demo-clinic');
    expect(slugs).toContain('demo-travel');
    expect(slugs).toContain('demo-retail');
  });

  it('resolves scenario by org slug', () => {
    const general = getScenarioByOrgSlug('demo-general');
    expect(general?.id).toBe('general');
    expect(general?.firstStopHref).toBe('/dashboard');
    expect(getScenarioByOrgSlug('unknown')).toBeUndefined();
  });

  it('maps slug to scenario id', () => {
    expect(getScenarioIdByOrgSlug('demo-clinic')).toBe('clinic');
    expect(getScenarioIdByOrgSlug('missing')).toBeNull();
  });

  it('orders investor walkthrough differently from sales', () => {
    const salesFirst = [...DEMO_SCENARIO_LIST].sort(
      (a, b) => a.salesWalkthroughOrder - b.salesWalkthroughOrder,
    )[0]!;
    const investorFirst = DEMO_INVESTOR_ORDER[0]!;
    expect(salesFirst.id).toBe('general');
    expect(investorFirst.id).toBe('general');
    expect(DEMO_INVESTOR_ORDER.map((s) => s.id)).toContain('retail');
  });

  it('each scenario has showcase links and highlights', () => {
    for (const scenario of DEMO_SCENARIO_LIST) {
      expect(scenario.showcaseLinks.length).toBeGreaterThan(0);
      expect(scenario.highlights.length).toBeGreaterThan(0);
      expect(scenario.valueProposition.length).toBeGreaterThan(5);
    }
  });
});
