import { describe, expect, it } from 'vitest';

import {
  isNavHrefModuleEnabled,
  isOrgModuleRelevantForPack,
  resolveOrgModuleForPath,
} from './org-modules';

describe('org module nav gating', () => {
  it('does not gate core CRM behind integration modules', () => {
    expect(resolveOrgModuleForPath('/invoices')).toBeNull();
    expect(resolveOrgModuleForPath('/payments')).toBeNull();
    expect(resolveOrgModuleForPath('/settings')).toBeNull();
  });

  it('gates AI suite under ai_assistant / ai_briefing', () => {
    expect(resolveOrgModuleForPath('/conversation')).toBe('ai_assistant');
    expect(resolveOrgModuleForPath('/memory')).toBe('ai_assistant');
    expect(resolveOrgModuleForPath('/command')).toBe('ai_briefing');
  });

  it('respects toggles for nav hrefs', () => {
    const off = { ai_assistant: false, ai_briefing: true };
    expect(isNavHrefModuleEnabled(off, '/memory')).toBe(false);
    expect(isNavHrefModuleEnabled(off, '/command')).toBe(true);
    expect(isNavHrefModuleEnabled(off, '/customers')).toBe(true);
  });

  it('scopes inventory module to retail pack', () => {
    expect(isOrgModuleRelevantForPack('inventory', 'RETAIL')).toBe(true);
    expect(isOrgModuleRelevantForPack('inventory', 'CLINIC')).toBe(false);
    expect(isOrgModuleRelevantForPack('ai_assistant', 'CLINIC')).toBe(true);
  });
});
