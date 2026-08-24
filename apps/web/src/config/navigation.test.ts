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

  it('shows specialty dashboard link when industrySpecialty is set', () => {
    const items = getNavItems('GENERAL', 'OWNER', 'freelancer');
    const hrefs = items.map((i) => i.href);
    expect(hrefs).toContain('/v/freelancer');
  });

  it('shows pack module links for vertical org without specialty', () => {
    const items = getNavItems('RETAIL', 'OWNER', null);
    const hrefs = items.map((i) => i.href);
    expect(hrefs).toContain('/retail');
    expect(hrefs).toContain('/retail/products');
    expect(hrefs).not.toContain('/v/clothing-store');
  });

  it('never shows other vertical packs when switching workspace pack', () => {
    const clinic = getNavItems('CLINIC', 'OWNER', 'dental-clinic').map((i) => i.href);
    expect(clinic).toContain('/clinic/appointments');
    expect(clinic).not.toContain('/retail');
    expect(clinic).not.toContain('/beauty');
    expect(clinic).not.toContain('/travel');

    const beauty = getNavItems('BEAUTY_SALON', 'OWNER', 'beauty-salon').map((i) => i.href);
    expect(beauty).toContain('/beauty/appointments');
    expect(beauty).not.toContain('/clinic');
    expect(beauty).not.toContain('/retail');
  });

  it('hides module-gated nav when toggles disable them', () => {
    const toggles = {
      ai_assistant: false,
      ai_briefing: false,
      automation: false,
      internal_chat: false,
      support_tickets: false,
      customer_inbox: false,
      inventory: true,
    };
    const hrefs = getNavItems('CLINIC', 'OWNER', null, toggles).map((i) => i.href);
    expect(hrefs).not.toContain('/conversation');
    expect(hrefs).not.toContain('/memory');
    expect(hrefs).not.toContain('/command');
    expect(hrefs).not.toContain('/chat');
    expect(hrefs).not.toContain('/inbox');
    expect(hrefs).toContain('/customers');
    expect(hrefs).toContain('/invoices');
    expect(hrefs).toContain('/clinic/appointments');
  });

  it('uses pack/specialty customer labels in CRM nav', () => {
    const clinic = getNavItems('CLINIC', 'OWNER', 'dental-clinic');
    expect(clinic.find((i) => i.href === '/customers')?.label).toBe('بیماران');
  });
});
