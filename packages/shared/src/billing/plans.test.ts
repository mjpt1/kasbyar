import { describe, expect, it } from 'vitest';

import {
  canAccessFeature,
  canUseIndustryPack,
  getPlanDefinition,
  getQuotaLimit,
} from './plans';

describe('plan catalog', () => {
  it('FREE blocks AI and vertical packs', () => {
    const plan = getPlanDefinition('FREE');
    expect(canAccessFeature(plan, 'aiAssistant')).toBe(false);
    expect(canAccessFeature(plan, 'reports')).toBe(false);
    expect(canUseIndustryPack(plan, 'CLINIC')).toBe(false);
  });

  it('STARTER allows single pack and basic reports', () => {
    const plan = getPlanDefinition('STARTER');
    expect(canAccessFeature(plan, 'reports')).toBe(true);
    expect(canAccessFeature(plan, 'aiAssistant')).toBe(false);
    expect(canUseIndustryPack(plan, 'RETAIL')).toBe(true);
  });

  it('BUSINESS unlocks AI and all packs', () => {
    const plan = getPlanDefinition('BUSINESS');
    expect(canAccessFeature(plan, 'aiAssistant')).toBe(true);
    expect(canUseIndustryPack(plan, 'TRAVEL_AGENCY')).toBe(true);
    expect(getQuotaLimit(plan, 'customers')).toBeGreaterThan(100);
  });
});
