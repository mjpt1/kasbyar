import { ORG_MODULE_BY_KEY, ORG_MODULE_CATALOG } from './catalog';

/**
 * Nav paths gated by org module toggles.
 * Integration modules (payment, sms, moadian, push) configure via /settings —
 * they must NOT hide core CRM pages like invoices/payments/settings.
 */
export const ORG_MODULE_NAV_PATHS: Record<string, readonly string[]> = {
  internal_chat: ['/chat'],
  support_tickets: ['/support'],
  ai_assistant: [
    '/conversation',
    '/memory',
    '/forecast',
    '/strategy',
    '/simulation',
    '/meetings',
    '/growth',
    '/twin',
  ],
  ai_briefing: ['/command'],
  automation: ['/automation'],
  inventory: ['/retail/inventory'],
  customer_inbox: ['/inbox'],
};

/** Primary nav path per module (first entry) — backward compatible */
export const ORG_MODULE_NAV: Record<string, string> = Object.fromEntries(
  Object.entries(ORG_MODULE_NAV_PATHS).map(([key, paths]) => [key, paths[0]!]),
);

/** Modules that only make sense for certain industry packs */
export const ORG_MODULE_PACK_SCOPE: Partial<Record<string, readonly string[]>> = {
  inventory: ['RETAIL'],
};

export function resolveOrgModuleForPath(pathname: string): string | null {
  const entries = Object.entries(ORG_MODULE_NAV_PATHS).flatMap(([key, paths]) =>
    paths.map((href) => [key, href] as const),
  );
  const sorted = entries.sort((a, b) => b[1].length - a[1].length);
  for (const [key, href] of sorted) {
    if (pathname === href || pathname.startsWith(`${href}/`)) return key;
  }
  return null;
}

export function isOrgModuleEnabled(
  toggles: Record<string, boolean>,
  moduleKey: string,
): boolean {
  if (moduleKey in toggles) return toggles[moduleKey]!;
  const def = ORG_MODULE_BY_KEY[moduleKey]?.defaultEnabled;
  return def ?? true;
}

export function isNavHrefModuleEnabled(
  toggles: Record<string, boolean>,
  href: string,
): boolean {
  const moduleKey = resolveOrgModuleForPath(href);
  if (!moduleKey) return true;
  return isOrgModuleEnabled(toggles, moduleKey);
}

/** Whether a module should appear in the platform catalog for this pack */
export function isOrgModuleRelevantForPack(
  moduleKey: string,
  industryPack: string | null | undefined,
): boolean {
  const allowed = ORG_MODULE_PACK_SCOPE[moduleKey];
  if (!allowed) return true;
  return Boolean(industryPack && allowed.includes(industryPack));
}

export function buildDefaultModuleToggles(): Record<string, boolean> {
  return Object.fromEntries(ORG_MODULE_CATALOG.map((m) => [m.key, m.defaultEnabled]));
}
