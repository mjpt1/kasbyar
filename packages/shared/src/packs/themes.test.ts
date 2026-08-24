import { describe, expect, it } from 'vitest';

import { PACK_REGISTRY } from './registry';
import {
  assertAllPacksHaveTheme,
  getPackLayoutModel,
  getPackTheme,
  getPackThemeId,
  listPackThemes,
  PACK_THEME_MAP,
  SPECIALTY_THEME_MAP,
  packThemeToCssVars,
  type PackThemeId,
} from './themes';

describe('pack visual themes', () => {
  it('maps every registry pack to a theme', () => {
    expect(assertAllPacksHaveTheme()).toEqual([]);
    for (const id of Object.keys(PACK_REGISTRY)) {
      expect(PACK_THEME_MAP[id as keyof typeof PACK_THEME_MAP]).toBeTruthy();
      expect(getPackTheme(id).id).toBe(getPackThemeId(id));
    }
  });

  it('falls back to general for unknown packs', () => {
    expect(getPackThemeId('UNKNOWN_PACK')).toBe('general');
    expect(getPackTheme('UNKNOWN_PACK').layout).toBe('balanced');
  });

  it('gives clinic and beauty different themes and layouts', () => {
    expect(getPackThemeId('CLINIC')).toBe('clinic');
    expect(getPackThemeId('BEAUTY_SALON')).toBe('beauty');
    expect(getPackLayoutModel('CLINIC')).toBe('calendar_forward');
    expect(getPackLayoutModel('BEAUTY_SALON')).toBe('soft_gallery');
    expect(getPackTheme('CLINIC').radius).not.toBe(getPackTheme('BEAUTY_SALON').radius);
  });

  it('aligns specialty colors with occupations', () => {
    expect(getPackThemeId('CLINIC', 'hospital')).toBe('hospital');
    expect(getPackThemeId('CLINIC', 'aesthetic-laser')).toBe('beauty');
    expect(getPackThemeId('CLINIC', 'dental-clinic')).toBe('dental');
    expect(getPackThemeId('BEAUTY_SALON', 'barber-shop')).toBe('barber');
    expect(getPackThemeId('BEAUTY_SALON', 'spa-center')).toBe('spa');
    expect(getPackThemeId('RETAIL', 'pharmacy')).toBe('pharmacy');
    expect(getPackThemeId('RETAIL', 'flower-shop')).toBe('florist');
    expect(getPackThemeId('FOOD_SERVICE', 'cafe')).toBe('cafe');
    expect(getPackThemeId('FOOD_SERVICE', 'bakery')).toBe('bakery');

    expect(getPackTheme('CLINIC', 'hospital').hsl.primary).not.toBe(
      getPackTheme('CLINIC', 'aesthetic-laser').hsl.primary,
    );
    expect(getPackTheme('CLINIC', 'aesthetic-laser').vibeFa).toMatch(/صورتی|رز/);
    expect(getPackTheme('CLINIC', 'hospital').vibeFa).toMatch(/آبی|قرمز/);
  });

  it('falls back to pack theme when specialty has no override', () => {
    expect(getPackThemeId('CLINIC', 'unknown-specialty')).toBe('clinic');
    expect(getPackThemeId('RETAIL', null)).toBe('retail');
  });

  it('only maps known specialty ids', () => {
    expect(Object.keys(SPECIALTY_THEME_MAP).length).toBeGreaterThan(15);
  });

  it('assigns distinct layout models to key verticals', () => {
    const layouts = [
      getPackLayoutModel('CLINIC'),
      getPackLayoutModel('BEAUTY_SALON'),
      getPackLayoutModel('RETAIL'),
      getPackLayoutModel('FOOD_SERVICE'),
      getPackLayoutModel('REAL_ESTATE'),
      getPackLayoutModel('GENERAL'),
    ];
    expect(new Set(layouts).size).toBe(layouts.length);
  });

  it('exposes CSS vars with primary and radius for every theme', () => {
    expect(listPackThemes().length).toBeGreaterThanOrEqual(10);
    for (const theme of listPackThemes()) {
      const vars = packThemeToCssVars(theme);
      expect(vars['--primary']).toMatch(/\d/);
      expect(vars['--radius']).toMatch(/rem/);
      expect(vars['--sidebar']).toBeTruthy();
      expect(theme.mobile.primary).toMatch(/^#/);
    }
  });

  it('keeps wholesale/distribution on retail theme family', () => {
    expect(getPackThemeId('WHOLESALE')).toBe('retail');
    expect(getPackThemeId('DISTRIBUTION')).toBe('retail');
    expect(getPackLayoutModel('RETAIL')).toBe('dense_kpi');
  });

  it('covers all PackThemeId values used in the maps', () => {
    const used = new Set([
      ...Object.values(PACK_THEME_MAP),
      ...Object.values(SPECIALTY_THEME_MAP),
    ]);
    const defined = new Set(listPackThemes().map((t) => t.id));
    for (const id of used) {
      expect(defined.has(id as PackThemeId)).toBe(true);
    }
  });
});
