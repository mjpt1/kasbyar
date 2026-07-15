/** Vertical pack identifiers — mirrors Prisma IndustryPack enum. */
export type IndustryPackId = 'GENERAL' | 'CLINIC' | 'TRAVEL_AGENCY' | 'RETAIL';

export interface PackNavItemDef {
  href: string;
  label: string;
  /** Lucide icon name — resolved in web app */
  icon: string;
}

export interface PackDefinition {
  id: IndustryPackId;
  label: string;
  description: string;
  /** Pack-specific navigation items (core nav is always shown) */
  navItems: PackNavItemDef[];
  /** Dashboard route for pack landing */
  homeRoute: string | null;
  /** Core entity label overrides */
  labels: {
    customer: string;
    customers: string;
  };
}

export interface PackDashboardSignals {
  packId: IndustryPackId;
  widgets: PackDashboardWidget[];
}

export interface PackDashboardWidget {
  key: string;
  title: string;
  value: string | number;
  href?: string;
  variant?: 'default' | 'warning' | 'success';
}
