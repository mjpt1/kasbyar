import type { LucideIcon } from 'lucide-react';
import {
  Activity,
  BadgeCheck,
  BarChart3,
  BookOpen,
  Boxes,
  Brain,
  Building2,
  Calculator,
  Calendar,
  Camera,
  CheckSquare,
  ClipboardList,
  Compass,
  Dumbbell,
  FolderOpen,
  GraduationCap,
  HardHat,
  HeartPulse,
  Home,
  LayoutDashboard,
  LineChart,
  Luggage,
  Megaphone,
  MessageSquare,
  Package,
  Plane,
  Presentation,
  Printer,
  Puzzle,
  Radio,
  Receipt,
  Scale,
  Settings,
  Shield,
  Sparkles,
  SprayCan,
  Stethoscope,
  Store,
  Target,
  TrendingUp,
  Users,
  UtensilsCrossed,
  Wallet,
  Workflow,
  Wrench,
} from 'lucide-react';

import { getPackDefinition, getPackNavItems, getSpecialty, type IndustryPackId } from '@kesbyar/shared';
import type { MembershipRole } from '@prisma/client';

import { canAccessPath } from '@/lib/permissions';

export interface NavItem {
  href: string;
  label: string;
  icon: LucideIcon;
  /** Pack-only items are visually grouped */
  packOnly?: boolean;
  /** Optional sidebar section heading (shown before first item in the section) */
  section?: string;
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
  Scale,
  Calculator,
  Shield,
  Megaphone,
  HardHat,
  Camera,
  SprayCan,
  Printer,
};

const AI_SECTION = 'هوشمند';

/** AI OS pages — kept near top of sidebar so they are not buried under pack/CRM links */
const AI_NAV_ITEMS: NavItem[] = [
  { href: '/command', label: 'اتاق فرمان', icon: Radio, section: AI_SECTION },
  { href: '/conversation', label: 'دستیار', icon: MessageSquare, section: AI_SECTION },
  { href: '/memory', label: 'حافظه شرکت', icon: Brain, section: AI_SECTION },
  { href: '/forecast', label: 'پیش‌بینی', icon: LineChart, section: AI_SECTION },
  { href: '/strategy', label: 'استراتژی', icon: Compass, section: AI_SECTION },
  { href: '/simulation', label: 'شبیه‌سازی', icon: Calculator, section: AI_SECTION },
  { href: '/meetings', label: 'جلسات', icon: Presentation, section: AI_SECTION },
  { href: '/growth', label: 'رشد و بازار', icon: TrendingUp, section: AI_SECTION },
  { href: '/twin', label: 'دوقلوی دیجیتال', icon: Building2, section: AI_SECTION },
  { href: '/platform', label: 'پلتفرم و افزونه‌ها', icon: Puzzle, section: AI_SECTION },
  { href: '/automation', label: 'اتوماسیون', icon: Workflow, section: AI_SECTION },
  { href: '/help', label: 'راهنما', icon: BookOpen, section: AI_SECTION },
];

const CORE_OPS_ITEMS: NavItem[] = [
  { href: '/customers', label: 'مشتریان', icon: Users },
  { href: '/leads', label: 'لیدها', icon: Target },
  { href: '/invoices', label: 'فاکتورها', icon: Receipt },
  { href: '/payments', label: 'پرداخت‌ها', icon: Wallet },
  { href: '/tasks', label: 'وظایف', icon: CheckSquare },
  { href: '/reports', label: 'گزارش‌ها', icon: BarChart3 },
  { href: '/activity', label: 'فعالیت‌ها', icon: Activity },
  { href: '/files', label: 'فایل‌ها', icon: FolderOpen },
  { href: '/settings', label: 'تنظیمات', icon: Settings },
];

const CORE_NAV_ITEMS: NavItem[] = [
  { href: '/dashboard', label: 'داشبورد', icon: LayoutDashboard },
  ...AI_NAV_ITEMS,
  ...CORE_OPS_ITEMS,
];

/** @deprecated Use getNavItems(industryPack) */
export const APP_NAV_ITEMS = CORE_NAV_ITEMS;

export function getNavItems(
  industryPack: string,
  role?: string,
  industrySpecialty?: string | null,
): NavItem[] {
  const specialty = getSpecialty(industrySpecialty);
  const specialtyItem: NavItem[] = specialty
    ? [
        {
          href: specialty.homePath,
          label: specialty.label,
          icon: PACK_ICON_MAP[specialty.icon] ?? LayoutDashboard,
          packOnly: true,
        },
      ]
    : [];

  const packItems = getPackNavItems(industryPack).map((item) => ({
    href: item.href,
    label: item.label,
    icon: PACK_ICON_MAP[item.icon] ?? LayoutDashboard,
    packOnly: true,
  }));

  // Dashboard + AI first (always visible), then specialty/pack, then CRM/ops
  const items: NavItem[] = [
    CORE_NAV_ITEMS[0]!,
    ...AI_NAV_ITEMS,
    ...specialtyItem,
    ...packItems,
    ...CORE_OPS_ITEMS,
  ];

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
