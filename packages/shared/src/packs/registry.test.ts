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
    expect(nav.some((n) => n.href === '/clinic/visits')).toBe(true);
    expect(getPackDefinition('CLINIC').labels.customer).toBe('بیمار');
  });

  it('exposes travel and retail packs', () => {
    expect(isVerticalPack('TRAVEL_AGENCY')).toBe(true);
    expect(getPackNavItems('RETAIL').some((n) => n.href === '/retail/inventory')).toBe(true);
  });

  it('exposes new vertical packs', () => {
    expect(isVerticalPack('BEAUTY_SALON')).toBe(true);
    expect(isVerticalPack('FOOD_SERVICE')).toBe(true);
    expect(isVerticalPack('EDUCATION')).toBe(true);
    expect(isVerticalPack('FITNESS')).toBe(true);
    expect(isVerticalPack('REAL_ESTATE')).toBe(true);
    expect(isVerticalPack('WORKSHOP')).toBe(true);

    expect(getPackNavItems('BEAUTY_SALON').some((n) => n.href === '/beauty/appointments')).toBe(true);
    expect(getPackNavItems('FOOD_SERVICE').some((n) => n.href === '/food/menu')).toBe(true);
    expect(getPackNavItems('EDUCATION').some((n) => n.href === '/education/courses')).toBe(true);
    expect(getPackNavItems('FITNESS').some((n) => n.href === '/fitness/memberships')).toBe(true);
    expect(getPackNavItems('REAL_ESTATE').some((n) => n.href === '/real-estate/listings')).toBe(true);
    expect(getPackNavItems('WORKSHOP').some((n) => n.href === '/workshop/jobs')).toBe(true);

    expect(getPackDefinition('BEAUTY_SALON').homeRoute).toBe('/beauty');
    expect(getPackDefinition('FOOD_SERVICE').homeRoute).toBe('/food');
    expect(getPackDefinition('EDUCATION').homeRoute).toBe('/education');
    expect(getPackDefinition('FITNESS').homeRoute).toBe('/fitness');
    expect(getPackDefinition('REAL_ESTATE').homeRoute).toBe('/real-estate');
    expect(getPackDefinition('WORKSHOP').homeRoute).toBe('/workshop');
  });
});
