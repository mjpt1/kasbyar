import { ORG_MODULE_BY_KEY, ORG_MODULE_CATALOG } from './catalog';

/** Nav paths gated by org module toggles */
export const ORG_MODULE_NAV: Record<string, string> = {
  internal_chat: '/chat',
  support_tickets: '/support',
  ai_assistant: '/conversation',
  ai_briefing: '/command',
  automation: '/automation',
  payment_gateway: '/payments',
  sms_kavenegar: '/settings',
  moadian: '/invoices',
  inventory: '/retail/inventory',
  push_notifications: '/settings',
};

export function resolveOrgModuleForPath(pathname: string): string | null {
  const sorted = Object.entries(ORG_MODULE_NAV).sort((a, b) => b[1].length - a[1].length);
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

export function buildDefaultModuleToggles(): Record<string, boolean> {
  return Object.fromEntries(ORG_MODULE_CATALOG.map((m) => [m.key, m.defaultEnabled]));
}
