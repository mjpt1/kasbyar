import { describe, expect, it } from 'vitest';

import { PACK_REGISTRY } from './registry';
import {
  assertAllPacksHaveTheme,
  getPackLayoutModel,
  getPackTheme,
  getPackThemeId,
  listPackThemes,
  PACK_THEME_MAP,
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
    const ids = listPackThemes().map((t) => t.id);
    expect(ids.length).toBeGreaterThanOrEqual(10);
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

  it('covers all PackThemeId values used in the map', () => {
    const used = new Set(Object.values(PACK_THEME_MAP));
    const defined = new Set(listPackThemes().map((t) => t.id));
    for (const id of used) {
      expect(defined.has(id as PackThemeId)).toBe(true);
    }
  });
});
