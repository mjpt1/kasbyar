import { describe, expect, it } from 'vitest';

import { PACK_REGISTRY } from './registry';
import {
  assertAllPacksHaveNavFamily,
  getPackNavFamily,
  getPackNavItemLabel,
  getPackNavProfile,
  isCoreNavHrefEnabledForPack,
  isPackNavKeyEnabled,
} from './nav-profiles';

describe('pack nav profiles', () => {
  it('covers every pack in the registry', () => {
    expect(assertAllPacksHaveNavFamily()).toEqual([]);
    for (const id of Object.keys(PACK_REGISTRY)) {
      expect(getPackNavProfile(id).enabledSet.has('dashboard')).toBe(true);
      expect(getPackNavProfile(id).enabledSet.has('settings')).toBe(true);
    }
  });

  it('hides chat and leads for clinic and beauty', () => {
    for (const pack of ['CLINIC', 'BEAUTY_SALON'] as const) {
      expect(getPackNavFamily(pack)).toBe('care');
      expect(isPackNavKeyEnabled(pack, 'chat')).toBe(false);
      expect(isPackNavKeyEnabled(pack, 'leads')).toBe(false);
      expect(isPackNavKeyEnabled(pack, 'inbox')).toBe(false);
      expect(isPackNavKeyEnabled(pack, 'customers')).toBe(true);
      expect(isPackNavKeyEnabled(pack, 'invoices')).toBe(true);
      expect(isCoreNavHrefEnabledForPack(pack, '/clinic/appointments')).toBe(true);
      expect(isCoreNavHrefEnabledForPack(pack, '/chat')).toBe(false);
      expect(isCoreNavHrefEnabledForPack(pack, '/leads/kanban')).toBe(false);
    }
  });

  it('keeps retail focused on POS/inventory ops without leads/chat', () => {
    expect(getPackNavFamily('RETAIL')).toBe('retail_ops');
    expect(isPackNavKeyEnabled('RETAIL', 'leads')).toBe(false);
    expect(isPackNavKeyEnabled('RETAIL', 'chat')).toBe(false);
    expect(isPackNavKeyEnabled('RETAIL', 'tasks')).toBe(false);
    expect(isPackNavKeyEnabled('RETAIL', 'customers')).toBe(true);
    expect(isPackNavKeyEnabled('RETAIL', 'invoices')).toBe(true);
    expect(isPackNavKeyEnabled('RETAIL', 'payments')).toBe(true);
    expect(isCoreNavHrefEnabledForPack('RETAIL', '/retail/inventory')).toBe(true);
  });

  it('enables leads for real estate and agencies', () => {
    expect(isPackNavKeyEnabled('REAL_ESTATE', 'leads')).toBe(true);
    expect(isPackNavKeyEnabled('LAW_FIRM', 'leads')).toBe(true);
    expect(isPackNavKeyEnabled('MARKETING_AGENCY', 'chat')).toBe(true);
    expect(isPackNavKeyEnabled('LAW_FIRM', 'chat')).toBe(true);
  });

  it('keeps fuller CRM for GENERAL', () => {
    expect(getPackNavFamily('GENERAL')).toBe('general_crm');
    expect(isPackNavKeyEnabled('GENERAL', 'leads')).toBe(true);
    expect(isPackNavKeyEnabled('GENERAL', 'chat')).toBe(true);
    expect(isPackNavKeyEnabled('GENERAL', 'inbox')).toBe(true);
    expect(isPackNavKeyEnabled('GENERAL', 'forecast')).toBe(true);
    expect(isPackNavKeyEnabled('GENERAL', 'team')).toBe(true);
  });

  it('relabels leads for travel and customers for clinic', () => {
    expect(getPackNavItemLabel('TRAVEL_AGENCY', 'leads', 'سرنخ')).toBe('درخواست رزرو');
    expect(getPackNavItemLabel('CLINIC', 'customers', 'مشتریان')).toBe('بیماران');
  });

  it('trims AI suite for care packs but keeps command/conversation', () => {
    expect(isPackNavKeyEnabled('CLINIC', 'command')).toBe(true);
    expect(isPackNavKeyEnabled('CLINIC', 'conversation')).toBe(true);
    expect(isPackNavKeyEnabled('CLINIC', 'forecast')).toBe(false);
    expect(isPackNavKeyEnabled('CLINIC', 'twin')).toBe(false);
  });
});
