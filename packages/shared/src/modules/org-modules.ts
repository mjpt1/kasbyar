import {
  ORG_MODULE_TO_PACK_NAV_KEY,
  isPackNavKeyEnabled,
} from '../packs/nav-profiles';
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

/** Modules that only make sense for certain industry packs (hard allowlist) */
export const ORG_MODULE_PACK_SCOPE: Partial<Record<string, readonly string[]>> = {
  inventory: ['RETAIL', 'WHOLESALE', 'DISTRIBUTION'],
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

/**
 * Whether a module should appear in the platform catalog for this pack.
 * Intersection of hard pack scope + pack nav profile (chat/inbox/AI, etc.).
 */
export function isOrgModuleRelevantForPack(
  moduleKey: string,
  industryPack: string | null | undefined,
): boolean {
  const pack = industryPack ?? 'GENERAL';
  const allowed = ORG_MODULE_PACK_SCOPE[moduleKey];
  if (allowed && !allowed.includes(pack)) return false;

  const navKey = ORG_MODULE_TO_PACK_NAV_KEY[moduleKey];
  if (navKey && !isPackNavKeyEnabled(pack, navKey)) return false;

  return true;
}

export function buildDefaultModuleToggles(): Record<string, boolean> {
  return Object.fromEntries(ORG_MODULE_CATALOG.map((m) => [m.key, m.defaultEnabled]));
}
