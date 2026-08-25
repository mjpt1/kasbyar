import { describe, expect, it } from 'vitest';

import {
  getPackDefinition,
  getPackHomeHref,
  getPackNavItems,
  isVerticalPack,
} from './registry';
import { getPackDashboardSurface } from './dashboard-surfaces';

describe('pack registry', () => {
  it('returns empty nav for GENERAL', () => {
    expect(getPackNavItems('GENERAL')).toEqual([]);
    expect(isVerticalPack('GENERAL')).toBe(false);
  });

  it('maps pack home href to vertical route (not generic dashboard)', () => {
    expect(getPackHomeHref('GENERAL')).toBe('/dashboard');
    expect(getPackHomeHref('CLINIC')).toBe('/clinic');
    expect(getPackHomeHref('BEAUTY_SALON')).toBe('/beauty');
    expect(getPackHomeHref('RETAIL')).toBe('/retail');
    expect(getPackHomeHref('FOOD_SERVICE')).toBe('/food');
    expect(getPackHomeHref('unknown-pack')).toBe('/dashboard');
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

  it('exposes wave 3 vertical packs', () => {
    expect(isVerticalPack('LAW_FIRM')).toBe(true);
    expect(isVerticalPack('ACCOUNTING_FIRM')).toBe(true);
    expect(isVerticalPack('INSURANCE_AGENCY')).toBe(true);
    expect(isVerticalPack('MARKETING_AGENCY')).toBe(true);
    expect(isVerticalPack('CONTRACTING')).toBe(true);
    expect(isVerticalPack('PHOTOGRAPHY')).toBe(true);
    expect(isVerticalPack('CLEANING')).toBe(true);
    expect(isVerticalPack('PRINTING')).toBe(true);

    expect(getPackNavItems('LAW_FIRM').some((n) => n.href === '/law/cases')).toBe(true);
    expect(getPackNavItems('ACCOUNTING_FIRM').some((n) => n.href === '/accounting/matters')).toBe(true);
    expect(getPackNavItems('INSURANCE_AGENCY').some((n) => n.href === '/insurance/policies')).toBe(true);
    expect(getPackNavItems('MARKETING_AGENCY').some((n) => n.href === '/agency/campaigns')).toBe(true);
    expect(getPackNavItems('CONTRACTING').some((n) => n.href === '/contracting/projects')).toBe(true);
    expect(getPackNavItems('PHOTOGRAPHY').some((n) => n.href === '/photography/sessions')).toBe(true);
    expect(getPackNavItems('CLEANING').some((n) => n.href === '/cleaning/jobs')).toBe(true);
    expect(getPackNavItems('PRINTING').some((n) => n.href === '/printing/orders')).toBe(true);

    expect(getPackDefinition('LAW_FIRM').homeRoute).toBe('/law');
    expect(getPackDefinition('ACCOUNTING_FIRM').homeRoute).toBe('/accounting');
    expect(getPackDefinition('INSURANCE_AGENCY').homeRoute).toBe('/insurance');
    expect(getPackDefinition('MARKETING_AGENCY').homeRoute).toBe('/agency');
    expect(getPackDefinition('CONTRACTING').homeRoute).toBe('/contracting');
    expect(getPackDefinition('PHOTOGRAPHY').homeRoute).toBe('/photography');
    expect(getPackDefinition('CLEANING').homeRoute).toBe('/cleaning');
    expect(getPackDefinition('PRINTING').homeRoute).toBe('/printing');
  });

  it('exposes wave 4 vertical packs', () => {
    expect(isVerticalPack('LOGISTICS')).toBe(true);
    expect(isVerticalPack('AUTOMOTIVE')).toBe(true);
    expect(isVerticalPack('HOSPITALITY')).toBe(true);
    expect(isVerticalPack('WHOLESALE')).toBe(true);
    expect(isVerticalPack('EVENTS')).toBe(true);
    expect(isVerticalPack('AGRICULTURE')).toBe(true);
    expect(isVerticalPack('HOME_SERVICES')).toBe(true);
    expect(isVerticalPack('DISTRIBUTION')).toBe(true);

    expect(getPackNavItems('LOGISTICS').some((n) => n.href === '/logistics/jobs')).toBe(true);
    expect(getPackNavItems('HOME_SERVICES').some((n) => n.href === '/home-services/jobs')).toBe(
      true,
    );
    expect(getPackDefinition('HOSPITALITY').homeRoute).toBe('/hospitality');
    expect(getPackDefinition('DISTRIBUTION').labels.customer).toBe('فروشگاه');
  });
});

describe('getPackDashboardSurface', () => {
  it('returns family-aware copy for vertical packs', () => {
    const clinic = getPackDashboardSurface('CLINIC');
    expect(clinic.titleFa).toBe('کلینیک');
    expect(clinic.descriptionFa).toMatch(/نوبت/);
    expect(clinic.primaryCta?.href).toBe('/clinic/appointments');
    expect(clinic.endUserActions.length).toBeGreaterThan(0);

    const beauty = getPackDashboardSurface('BEAUTY_SALON');
    expect(beauty.titleFa).toBe('سالن زیبایی');

    const retail = getPackDashboardSurface('RETAIL');
    expect(retail.titleFa).toBe('فروشگاه');

    const food = getPackDashboardSurface('FOOD_SERVICE');
    expect(food.titleFa).toBe('غذا و نوشیدنی');

    const general = getPackDashboardSurface('GENERAL');
    expect(general.titleFa).toBe('داشبورد');
  });

  it('applies specialty overrides for hospital vs dental and retail niches', () => {
    expect(getPackDashboardSurface('CLINIC', 'hospital').titleFa).toMatch(/بیمارستان/);
    expect(getPackDashboardSurface('CLINIC', 'dental-clinic').titleFa).toMatch(/دندان/);
    expect(getPackDashboardSurface('FOOD_SERVICE', 'cafe').titleFa).toMatch(/کافه/);
    expect(getPackDashboardSurface('RETAIL', 'pharmacy').titleFa).toMatch(/داروخانه/);
  });
});
