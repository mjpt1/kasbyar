import type { IndustryPackId } from './types';
import { PACK_REGISTRY } from './registry';

/**
 * Core sidebar/mobile nav keys gated by industry pack profile.
 * Pack-specific routes (`/clinic`, `/retail`, …) are always shown for that pack.
 */
export const PACK_NAV_KEYS = [
  'dashboard',
  'command',
  'conversation',
  'memory',
  'forecast',
  'strategy',
  'simulation',
  'meetings',
  'growth',
  'twin',
  'platform',
  'automation',
  'help',
  'chat',
  'inbox',
  'support',
  'customers',
  'leads',
  'invoices',
  'payments',
  'tasks',
  'reports',
  'team',
  'activity',
  'files',
  'settings',
] as const;

export type PackNavKey = (typeof PACK_NAV_KEYS)[number];

/** Product essentials — never hidden by pack profile */
export const PACK_NAV_ALWAYS_ON: readonly PackNavKey[] = [
  'dashboard',
  'settings',
  'support',
  'help',
] as const;

const HREF_TO_KEY: Record<string, PackNavKey> = {
  '/dashboard': 'dashboard',
  '/command': 'command',
  '/conversation': 'conversation',
  '/memory': 'memory',
  '/forecast': 'forecast',
  '/strategy': 'strategy',
  '/simulation': 'simulation',
  '/meetings': 'meetings',
  '/growth': 'growth',
  '/twin': 'twin',
  '/platform': 'platform',
  '/automation': 'automation',
  '/help': 'help',
  '/chat': 'chat',
  '/inbox': 'inbox',
  '/support': 'support',
  '/customers': 'customers',
  '/leads': 'leads',
  '/invoices': 'invoices',
  '/payments': 'payments',
  '/tasks': 'tasks',
  '/reports': 'reports',
  '/team': 'team',
  '/activity': 'activity',
  '/files': 'files',
  '/settings': 'settings',
};

/** Org module keys that map to a pack-nav gate */
export const ORG_MODULE_TO_PACK_NAV_KEY: Partial<Record<string, PackNavKey>> = {
  internal_chat: 'chat',
  customer_inbox: 'inbox',
  support_tickets: 'support',
  ai_assistant: 'conversation',
  ai_briefing: 'command',
  automation: 'automation',
};

export type PackNavFamily =
  | 'general_crm'
  | 'care'
  | 'retail_ops'
  | 'food_ops'
  | 'schedule'
  | 'sales_pipeline'
  | 'agency'
  | 'field_service'
  | 'travel';

export interface PackNavProfile {
  family: PackNavFamily;
  /** Enabled core keys (always-on keys are merged automatically) */
  enabled: readonly PackNavKey[];
  /** Optional Persian label overrides for core items */
  labels?: Partial<Record<'leads' | 'tasks' | 'customers', string>>;
}

const SLIM_AI: readonly PackNavKey[] = ['command', 'conversation'];

const MEDIUM_AI: readonly PackNavKey[] = [
  'command',
  'conversation',
  'memory',
  'platform',
  'automation',
];

const FULL_AI: readonly PackNavKey[] = [
  'command',
  'conversation',
  'memory',
  'forecast',
  'strategy',
  'simulation',
  'meetings',
  'growth',
  'twin',
  'platform',
  'automation',
];

const OPS_BASE: readonly PackNavKey[] = [
  'customers',
  'invoices',
  'payments',
  'reports',
  'activity',
  'files',
];

const OPS_WITH_TASKS: readonly PackNavKey[] = [...OPS_BASE, 'tasks'];

function profile(
  family: PackNavFamily,
  extras: readonly PackNavKey[],
  labels?: PackNavProfile['labels'],
): PackNavProfile {
  return { family, enabled: extras, labels };
}

/** Family templates — packs inherit; override per-pack only when needed */
const FAMILY_PROFILES: Record<PackNavFamily, PackNavProfile> = {
  general_crm: profile('general_crm', [
    ...FULL_AI,
    'chat',
    'inbox',
    ...OPS_WITH_TASKS,
    'leads',
    'team',
  ]),

  /** Clinic / beauty — vertical appointments, no CRM sales clutter */
  care: profile('care', [...SLIM_AI, ...OPS_WITH_TASKS]),

  /** Supermarket / retail / wholesale — POS & inventory focus */
  retail_ops: profile('retail_ops', [...SLIM_AI, ...OPS_BASE]),

  food_ops: profile('food_ops', [...SLIM_AI, ...OPS_WITH_TASKS]),

  /** Education / gym / photo / hotel — schedule-driven */
  schedule: profile('schedule', [...SLIM_AI, ...OPS_WITH_TASKS]),

  /** Real estate / insurance / auto — leads matter */
  sales_pipeline: profile(
    'sales_pipeline',
    [...MEDIUM_AI, 'inbox', ...OPS_WITH_TASKS, 'leads', 'team'],
    { leads: 'سرنخ‌های فروش' },
  ),

  /** Law / accounting / marketing / contracting — pipeline + team chat */
  agency: profile('agency', [
    ...FULL_AI,
    'chat',
    'inbox',
    ...OPS_WITH_TASKS,
    'leads',
    'team',
  ]),

  /** Workshop / cleaning / logistics — job board, walk-in */
  field_service: profile('field_service', [...SLIM_AI, ...OPS_WITH_TASKS]),

  travel: profile(
    'travel',
    [...SLIM_AI, 'inbox', ...OPS_WITH_TASKS, 'leads'],
    { leads: 'درخواست رزرو' },
  ),
};

const PACK_FAMILY: Record<IndustryPackId, PackNavFamily> = {
  GENERAL: 'general_crm',
  CLINIC: 'care',
  BEAUTY_SALON: 'care',
  RETAIL: 'retail_ops',
  WHOLESALE: 'retail_ops',
  DISTRIBUTION: 'retail_ops',
  AGRICULTURE: 'retail_ops',
  FOOD_SERVICE: 'food_ops',
  EDUCATION: 'schedule',
  FITNESS: 'schedule',
  PHOTOGRAPHY: 'schedule',
  HOSPITALITY: 'schedule',
  REAL_ESTATE: 'sales_pipeline',
  INSURANCE_AGENCY: 'sales_pipeline',
  AUTOMOTIVE: 'sales_pipeline',
  EVENTS: 'sales_pipeline',
  LAW_FIRM: 'agency',
  ACCOUNTING_FIRM: 'agency',
  MARKETING_AGENCY: 'agency',
  CONTRACTING: 'agency',
  WORKSHOP: 'field_service',
  CLEANING: 'field_service',
  HOME_SERVICES: 'field_service',
  PRINTING: 'field_service',
  LOGISTICS: 'field_service',
  TRAVEL_AGENCY: 'travel',
};

/** Per-pack label polish (family defaults + overrides) */
const PACK_LABEL_OVERRIDES: Partial<
  Record<IndustryPackId, PackNavProfile['labels']>
> = {
  CLINIC: { customers: 'بیماران' },
  BEAUTY_SALON: { customers: 'مراجعان' },
  REAL_ESTATE: { leads: 'متقاضیان / فایل‌ها' },
  LAW_FIRM: { leads: 'پرونده‌های بالقوه' },
  MARKETING_AGENCY: { leads: 'فرصت‌های پروژه' },
  ACCOUNTING_FIRM: { leads: 'مشتریان بالقوه' },
  TRAVEL_AGENCY: { leads: 'درخواست رزرو', customers: 'مسافران' },
  EDUCATION: { customers: 'هنرجویان' },
  FITNESS: { customers: 'اعضا' },
};

function mergeEnabled(keys: readonly PackNavKey[]): ReadonlySet<PackNavKey> {
  return new Set<PackNavKey>([...PACK_NAV_ALWAYS_ON, ...keys]);
}

export function getPackNavFamily(packId: string): PackNavFamily {
  const id = packId as IndustryPackId;
  return PACK_FAMILY[id] ?? 'general_crm';
}

export function getPackNavProfile(packId: string): PackNavProfile & {
  enabledSet: ReadonlySet<PackNavKey>;
} {
  const family = getPackNavFamily(packId);
  const base = FAMILY_PROFILES[family];
  const packIdTyped = packId as IndustryPackId;
  const labels = {
    ...base.labels,
    ...PACK_LABEL_OVERRIDES[packIdTyped],
  };
  const enabledSet = mergeEnabled(base.enabled);
  return { ...base, labels, enabledSet };
}

export function resolvePackNavKey(href: string): PackNavKey | null {
  const exact = HREF_TO_KEY[href];
  if (exact) return exact;
  const sorted = Object.entries(HREF_TO_KEY).sort((a, b) => b[0].length - a[0].length);
  for (const [path, key] of sorted) {
    if (href === path || href.startsWith(`${path}/`)) return key;
  }
  return null;
}

/** Whether a core nav href is allowed by the pack profile (pack routes → true) */
export function isCoreNavHrefEnabledForPack(packId: string, href: string): boolean {
  const key = resolvePackNavKey(href);
  if (!key) return true;
  return getPackNavProfile(packId).enabledSet.has(key);
}

export function isPackNavKeyEnabled(packId: string, key: PackNavKey): boolean {
  return getPackNavProfile(packId).enabledSet.has(key);
}

export function getPackNavItemLabel(
  packId: string,
  key: 'leads' | 'tasks' | 'customers',
  fallback: string,
): string {
  const profileLabels = getPackNavProfile(packId).labels;
  if (key === 'customers') {
    return (
      profileLabels?.customers ??
      PACK_REGISTRY[packId as IndustryPackId]?.labels.customers ??
      fallback
    );
  }
  return profileLabels?.[key] ?? fallback;
}

/** Every IndustryPackId must have an explicit family mapping */
export function assertAllPacksHaveNavFamily(): IndustryPackId[] {
  return (Object.keys(PACK_REGISTRY) as IndustryPackId[]).filter(
    (id) => !(id in PACK_FAMILY),
  );
}
