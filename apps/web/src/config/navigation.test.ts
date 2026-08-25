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

    // Pack home (or generic dashboard), then AI section — before CRM ops
    expect(hrefs[0]).toBe('/dashboard');
    expect(hrefs[1]).toBe('/command');
    expect(hrefs.indexOf('/command')).toBeLessThan(hrefs.indexOf('/customers'));
  });

  it('uses vertical pack home as first nav item (not /dashboard)', () => {
    const clinic = getNavItems('CLINIC', 'OWNER');
    expect(clinic[0]?.href).toBe('/clinic');
    expect(clinic[0]?.label).toBe('کلینیک');
    expect(clinic.filter((i) => i.href === '/clinic')).toHaveLength(1);
    expect(clinic.map((i) => i.href)).not.toContain('/dashboard');

    const beauty = getNavItems('BEAUTY_SALON', 'OWNER');
    expect(beauty[0]?.href).toBe('/beauty');
    expect(beauty.filter((i) => i.href === '/beauty')).toHaveLength(1);

    const retail = getNavItems('RETAIL', 'OWNER');
    expect(retail[0]?.href).toBe('/retail');
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

  it('keeps AI above secondary pack links so specialty orgs still surface them', () => {
    const items = getNavItems('CLINIC', 'OWNER');
    const hrefs = items.map((i) => i.href);
    // Home is /clinic at index 0; AI comes before appointments / patients
    expect(hrefs.indexOf('/command')).toBeLessThan(hrefs.indexOf('/clinic/appointments'));
    expect(hrefs.indexOf('/command')).toBeLessThan(hrefs.indexOf('/customers'));
  });

  it('prefers specialty home and does not duplicate it', () => {
    const items = getNavItems('CLINIC', 'OWNER', 'hospital');
    expect(items[0]?.href).toBe('/v/hospital');
    expect(items.filter((i) => i.href === '/v/hospital')).toHaveLength(1);
    expect(items.map((i) => i.href)).toContain('/clinic');
  });

  it('hides chat and leads for clinic/beauty pack profiles', () => {
    const clinic = getNavItems('CLINIC', 'OWNER').map((i) => i.href);
    expect(clinic).not.toContain('/chat');
    expect(clinic).not.toContain('/leads');
    expect(clinic).not.toContain('/inbox');
    expect(clinic).not.toContain('/forecast');
    expect(clinic).toContain('/customers');
    expect(clinic).toContain('/clinic/appointments');
    expect(clinic).toContain('/command');

    const beauty = getNavItems('BEAUTY_SALON', 'OWNER').map((i) => i.href);
    expect(beauty).not.toContain('/chat');
    expect(beauty).not.toContain('/leads');
    expect(beauty).toContain('/beauty/appointments');
  });

  it('keeps retail without leads/chat/tasks clutter', () => {
    const hrefs = getNavItems('RETAIL', 'OWNER').map((i) => i.href);
    expect(hrefs).not.toContain('/leads');
    expect(hrefs).not.toContain('/chat');
    expect(hrefs).not.toContain('/tasks');
    expect(hrefs).toContain('/customers');
    expect(hrefs).toContain('/invoices');
    expect(hrefs).toContain('/retail/inventory');
  });

  it('keeps fuller CRM for GENERAL including leads and chat', () => {
    const hrefs = getNavItems('GENERAL', 'OWNER').map((i) => i.href);
    expect(hrefs).toContain('/leads');
    expect(hrefs).toContain('/chat');
    expect(hrefs).toContain('/inbox');
    expect(hrefs).toContain('/forecast');
  });

  it('enables leads for real-estate and agency packs', () => {
    expect(getNavItems('REAL_ESTATE', 'OWNER').map((i) => i.href)).toContain('/leads');
    expect(getNavItems('LAW_FIRM', 'OWNER').map((i) => i.href)).toContain('/chat');
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
