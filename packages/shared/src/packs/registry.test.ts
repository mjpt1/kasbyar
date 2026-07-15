import { describe, expect, it } from 'vitest';

import { getPackDefinition, getPackNavItems, isVerticalPack } from './registry';

describe('pack registry', () => {
  it('returns empty nav for GENERAL', () => {
    expect(getPackNavItems('GENERAL')).toEqual([]);
    expect(isVerticalPack('GENERAL')).toBe(false);
  });

  it('exposes clinic pack routes', () => {
    const nav = getPackNavItems('CLINIC');
    expect(nav.length).toBeGreaterThan(0);
    expect(nav.some((n) => n.href === '/clinic/appointments')).toBe(true);
    expect(getPackDefinition('CLINIC').labels.customer).toBe('بیمار');
  });

  it('exposes travel and retail packs', () => {
    expect(isVerticalPack('TRAVEL_AGENCY')).toBe(true);
    expect(getPackNavItems('RETAIL').some((n) => n.href === '/retail/inventory')).toBe(true);
  });
});
