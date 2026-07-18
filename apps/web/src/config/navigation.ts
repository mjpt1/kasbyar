import type { LucideIcon } from 'lucide-react';
import {
  Activity,
  BadgeCheck,
  BarChart3,
  BookOpen,
  Boxes,
  Building2,
  Calendar,
  CheckSquare,
  ClipboardList,
  Dumbbell,
  FolderOpen,
  GraduationCap,
  HeartPulse,
  HelpCircle,
  Home,
  LayoutDashboard,
  Luggage,
  MessageSquare,
  Package,
  Plane,
  Receipt,
  Settings,
  Sparkles,
  Stethoscope,
  Store,
  Target,
  Users,
  UtensilsCrossed,
  Wallet,
  Workflow,
  Wrench,
} from 'lucide-react';

import { getPackDefinition, getPackNavItems, type IndustryPackId } from '@kesbyar/shared';
import type { MembershipRole } from '@prisma/client';

import { canAccessPath } from '@/lib/permissions';

export interface NavItem {
  href: string;
  label: string;
  icon: LucideIcon;
  /** Pack-only items are visually grouped */
  packOnly?: boolean;
}

const PACK_ICON_MAP: Record<string, LucideIcon> = {
  Stethoscope,
  Calendar,
  HeartPulse,
  FolderOpen,
  Plane,
  Luggage,
  Store,
  Package,
  Boxes,
  Sparkles,
  UtensilsCrossed,
  ClipboardList,
  GraduationCap,
  BookOpen,
  Users,
  Dumbbell,
  BadgeCheck,
  Building2,
  Home,
  Wrench,
};

const CORE_NAV_ITEMS: NavItem[] = [
  { href: '/dashboard', label: 'داشبورد', icon: LayoutDashboard },
  { href: '/customers', label: 'مشتریان', icon: Users },
  { href: '/leads', label: 'لیدها', icon: Target },
  { href: '/invoices', label: 'فاکتورها', icon: Receipt },
  { href: '/payments', label: 'پرداخت‌ها', icon: Wallet },
  { href: '/tasks', label: 'وظایف', icon: CheckSquare },
  { href: '/conversation', label: 'دستیار', icon: MessageSquare },
  { href: '/reports', label: 'گزارش‌ها', icon: BarChart3 },
  { href: '/activity', label: 'فعالیت‌ها', icon: Activity },
  { href: '/automation', label: 'اتوماسیون', icon: Workflow },
  { href: '/files', label: 'فایل‌ها', icon: FolderOpen },
  { href: '/help', label: 'راهنما', icon: HelpCircle },
  { href: '/settings', label: 'تنظیمات', icon: Settings },
];

/** @deprecated Use getNavItems(industryPack) */
export const APP_NAV_ITEMS = CORE_NAV_ITEMS;

export function getNavItems(industryPack: string, role?: string): NavItem[] {
  const packItems = getPackNavItems(industryPack).map((item) => ({
    href: item.href,
    label: item.label,
    icon: PACK_ICON_MAP[item.icon] ?? LayoutDashboard,
    packOnly: true,
  }));

  let items: NavItem[];
  if (packItems.length === 0) {
    items = CORE_NAV_ITEMS;
  } else {
    const [dashboard, ...rest] = CORE_NAV_ITEMS;
    items = [dashboard!, ...packItems, ...rest];
  }

  if (!role) return items;

  return items.filter((item) =>
    canAccessPath(role as MembershipRole, item.href),
  );
}

export function getCustomerNavLabel(industryPack: string): string {
  return getPackDefinition(industryPack as IndustryPackId).labels.customers;
}

export const AUTH_NAV = {
  login: { href: '/login', label: 'ورود' },
  register: { href: '/register', label: 'ثبت‌نام' },
  workspaceSelect: { href: '/workspace/select', label: 'انتخاب فضای کاری' },
} as const;

export const APP_META = {
  name: 'کسب‌یار',
  tagline: 'سیستم‌عامل هوشمند کسب‌وکار',
  locale: 'fa-IR',
  direction: 'rtl' as const,
  timezone: 'Asia/Tehran',
  currency: 'IRR',
};
