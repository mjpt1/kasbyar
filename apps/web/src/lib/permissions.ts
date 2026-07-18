import { getSpecialty } from '@kesbyar/shared';
import type { MembershipRole } from '@prisma/client';

const ROLE_HIERARCHY: Record<MembershipRole, number> = {
  VIEWER: 1,
  STAFF: 2,
  MANAGER: 3,
  ADMIN: 4,
  OWNER: 5,
};

/** Minimum org role required per app route prefix */
export const ROUTE_MIN_ROLE: Record<string, MembershipRole> = {
  '/dashboard': 'VIEWER',
  '/customers': 'STAFF',
  '/leads': 'STAFF',
  '/invoices': 'STAFF',
  '/payments': 'STAFF',
  '/tasks': 'STAFF',
  '/conversation': 'STAFF',
  '/reports': 'MANAGER',
  '/activity': 'STAFF',
  '/automation': 'MANAGER',
  '/files': 'STAFF',
  '/help': 'VIEWER',
  '/settings': 'STAFF',
  '/settings/audit': 'ADMIN',
  '/settings/billing': 'MANAGER',
  '/settings/members': 'ADMIN',
  '/clinic': 'STAFF',
  '/travel': 'STAFF',
  '/retail': 'STAFF',
  '/beauty': 'STAFF',
  '/food': 'STAFF',
  '/education': 'STAFF',
  '/fitness': 'STAFF',
  '/real-estate': 'STAFF',
  '/workshop': 'STAFF',
  '/law': 'STAFF',
  '/accounting': 'STAFF',
  '/insurance': 'STAFF',
  '/agency': 'STAFF',
  '/contracting': 'STAFF',
  '/photography': 'STAFF',
  '/cleaning': 'STAFF',
  '/printing': 'STAFF',
  '/v': 'STAFF',
  '/demo': 'STAFF',
  '/workspace': 'VIEWER',
};

export function hasMinRole(
  userRole: MembershipRole,
  required: MembershipRole,
): boolean {
  return ROLE_HIERARCHY[userRole] >= ROLE_HIERARCHY[required];
}

export function canManageMembers(role: MembershipRole): boolean {
  return hasMinRole(role, 'ADMIN');
}

export function canManageBilling(role: MembershipRole): boolean {
  return hasMinRole(role, 'MANAGER');
}

export function canManageSettings(role: MembershipRole): boolean {
  return hasMinRole(role, 'ADMIN');
}

export function getMinRoleForPath(pathname: string): MembershipRole {
  const sorted = Object.keys(ROUTE_MIN_ROLE).sort((a, b) => b.length - a.length);
  for (const prefix of sorted) {
    if (pathname === prefix || pathname.startsWith(`${prefix}/`)) {
      return ROUTE_MIN_ROLE[prefix]!;
    }
  }
  return 'STAFF';
}

export function canAccessPath(role: MembershipRole, pathname: string): boolean {
  return hasMinRole(role, getMinRoleForPath(pathname));
}

export function filterNavHrefs(role: MembershipRole, hrefs: string[]): string[] {
  return hrefs.filter((href) => canAccessPath(role, href));
}

/** Home redirect after login — staff lands on tasks, others on dashboard */
export function getDefaultHomePath(
  role: MembershipRole,
  industryPack: string,
  industrySpecialty?: string | null,
): string {
  const specialty = getSpecialty(industrySpecialty);
  if (specialty && role !== 'VIEWER' && role !== 'STAFF') {
    return specialty.homePath;
  }

  if (role === 'VIEWER') return '/dashboard';
  if (role === 'STAFF') return '/tasks';

  const packHome: Record<string, string> = {
    CLINIC: '/clinic',
    TRAVEL_AGENCY: '/travel',
    RETAIL: '/retail',
    BEAUTY_SALON: '/beauty',
    FOOD_SERVICE: '/food',
    EDUCATION: '/education',
    FITNESS: '/fitness',
    REAL_ESTATE: '/real-estate',
    WORKSHOP: '/workshop',
    LAW_FIRM: '/law',
    ACCOUNTING_FIRM: '/accounting',
    INSURANCE_AGENCY: '/insurance',
    MARKETING_AGENCY: '/agency',
    CONTRACTING: '/contracting',
    PHOTOGRAPHY: '/photography',
    CLEANING: '/cleaning',
    PRINTING: '/printing',
  };
  return packHome[industryPack] ?? '/dashboard';
}
