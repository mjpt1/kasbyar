import type { MembershipRole } from '@prisma/client';

const ROLE_HIERARCHY: Record<MembershipRole, number> = {
  VIEWER: 1,
  STAFF: 2,
  MANAGER: 3,
  ADMIN: 4,
  OWNER: 5,
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
