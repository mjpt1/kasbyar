import { describe, expect, it } from 'vitest';

import { getNavItems } from './navigation';

const AI_HREFS = [
  '/command',
  '/conversation',
  '/memory',
  '/forecast',
  '/strategy',
  '/simulation',
  '/meetings',
  '/growth',
  '/twin',
  '/platform',
  '/automation',
  '/help',
] as const;

describe('getNavItems AI OS', () => {
  it('shows all AI pages for OWNER near the top', () => {
    const items = getNavItems('GENERAL', 'OWNER');
    const hrefs = items.map((i) => i.href);

    for (const href of AI_HREFS) {
      expect(hrefs).toContain(href);
    }

    // Dashboard, then AI section — before CRM ops
    expect(hrefs[0]).toBe('/dashboard');
    expect(hrefs[1]).toBe('/command');
    expect(hrefs.indexOf('/command')).toBeLessThan(hrefs.indexOf('/customers'));
  });

  it('shows all AI pages for STAFF', () => {
    const items = getNavItems('GENERAL', 'STAFF');
    const hrefs = items.map((i) => i.href);
    for (const href of AI_HREFS) {
      expect(hrefs).toContain(href);
    }
  });

  it('hides AI pages for VIEWER', () => {
    const items = getNavItems('GENERAL', 'VIEWER');
    const hrefs = items.map((i) => i.href);
    for (const href of AI_HREFS) {
      expect(hrefs).not.toContain(href);
    }
  });

  it('keeps AI above pack links so specialty orgs still surface them', () => {
    const items = getNavItems('CLINIC', 'OWNER');
    const hrefs = items.map((i) => i.href);
    expect(hrefs.indexOf('/command')).toBeLessThan(hrefs.indexOf('/clinic'));
  });
});
