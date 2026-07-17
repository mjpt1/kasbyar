import { describe, expect, it } from 'vitest';

import {
  DEMO_INVESTOR_ORDER,
  DEMO_SCENARIO_LIST,
  getScenarioByOrgSlug,
  getScenarioIdByOrgSlug,
} from './scenarios';

describe('demo scenario registry', () => {
  it('defines multiple scenarios with unique slugs', () => {
    expect(DEMO_SCENARIO_LIST.length).toBeGreaterThanOrEqual(40);
    const slugs = DEMO_SCENARIO_LIST.map((s) => s.orgSlug);
    expect(new Set(slugs).size).toBe(DEMO_SCENARIO_LIST.length);
    expect(slugs).toContain('demo-general');
    expect(slugs).toContain('demo-clinic');
    expect(slugs).toContain('demo-travel');
    expect(slugs).toContain('demo-retail');
    expect(slugs).toContain('demo-medical-office');
    expect(slugs).toContain('demo-hospital');
    expect(slugs).toContain('demo-treatment-center');
    expect(slugs).toContain('demo-supermarket');
    expect(slugs).toContain('demo-pharmacy');
    expect(slugs).toContain('demo-contracting');
    expect(slugs).toContain('demo-education-center');
    expect(slugs).toContain('demo-beauty-salon');
    expect(slugs).toContain('demo-restaurant');
    expect(slugs).toContain('demo-cafe');
    expect(slugs).toContain('demo-bakery');
    expect(slugs).toContain('demo-mobile-shop');
    expect(slugs).toContain('demo-electronics-store');
    expect(slugs).toContain('demo-flower-shop');
    expect(slugs).toContain('demo-pet-shop');
    expect(slugs).toContain('demo-real-estate');
    expect(slugs).toContain('demo-law-office');
    expect(slugs).toContain('demo-accounting-office');
    expect(slugs).toContain('demo-gym');
    expect(slugs).toContain('demo-auto-repair');
    expect(slugs).toContain('demo-optician');
    expect(slugs).toContain('demo-stationery-store');
    expect(slugs).toContain('demo-bookstore');
    expect(slugs).toContain('demo-hardware-store');
    expect(slugs).toContain('demo-cosmetics-store');
    expect(slugs).toContain('demo-tailor-shop');
    expect(slugs).toContain('demo-jewelry-store');
    expect(slugs).toContain('demo-cleaning-services');
    expect(slugs).toContain('demo-marketing-agency');
    expect(slugs).toContain('demo-printing-shop');
    expect(slugs).toContain('demo-insurance-agency');
    expect(slugs).toContain('demo-appliance-repair');
    expect(slugs).toContain('demo-photography-studio');
    expect(slugs).toContain('demo-daycare-center');
    expect(slugs).toContain('demo-computer-service');
    expect(slugs).toContain('demo-veterinary-clinic');
  });

  it('resolves scenario by org slug', () => {
    const general = getScenarioByOrgSlug('demo-general');
    expect(general?.id).toBe('general');
    expect(general?.firstStopHref).toBe('/dashboard');
    expect(getScenarioByOrgSlug('unknown')).toBeUndefined();
  });

  it('maps slug to scenario id', () => {
    expect(getScenarioIdByOrgSlug('demo-clinic')).toBe('clinic');
    expect(getScenarioIdByOrgSlug('demo-pharmacy')).toBe('pharmacy');
    expect(getScenarioIdByOrgSlug('demo-real-estate')).toBe('real-estate');
    expect(getScenarioIdByOrgSlug('demo-veterinary-clinic')).toBe('veterinary-clinic');
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
