import { describe, expect, it } from 'vitest';

import { isVerticalPack, PACK_REGISTRY } from './registry';
import { listSpecialties } from './specialties';

describe('specialty registry', () => {
  it('has at least 85 specialties', () => {
    expect(listSpecialties().length).toBeGreaterThanOrEqual(85);
  });

  it('has 100+ distinct dashboards (vertical packs + specialties)', () => {
    const verticalPacks = Object.keys(PACK_REGISTRY).filter(isVerticalPack).length;
    const specialtyCount = listSpecialties().length;
    expect(verticalPacks + specialtyCount).toBeGreaterThanOrEqual(100);
  });

  it('assigns unique specialty ids and home paths', () => {
    const specialties = listSpecialties();
    const ids = new Set(specialties.map((s) => s.id));
    const paths = new Set(specialties.map((s) => s.homePath));
    expect(ids.size).toBe(specialties.length);
    expect(paths.size).toBe(specialties.length);
  });
});
