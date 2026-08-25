import type { LucideIcon } from 'lucide-react';
import {
  Activity,
  BadgeCheck,
  BarChart3,
  BookOpen,
  Boxes,
  Brain,
  Briefcase,
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
  Hotel,
  House,
  Inbox,
  LayoutDashboard,
  LineChart,
  Luggage,
  Megaphone,
  MessageSquare,
  MessagesSquare,
  Package,
  PartyPopper,
  Plane,
  Presentation,
  Printer,
  Puzzle,
  Radio,
  Receipt,
  Route,
  Scale,
  Settings,
  Shield,
  Sparkles,
  SprayCan,
  Sprout,
  LifeBuoy,
  Stethoscope,
  Store,
  Target,
  TrendingUp,
  Truck,
  Car,
  Users,
  UsersRound,
  UtensilsCrossed,
  Wallet,
  Warehouse,
  Workflow,
  Wrench,
} from 'lucide-react';

import {
  getPackDefinition,
  getPackHomeHref,
  getPackNavItemLabel,
  getPackNavItems,
  getSpecialty,
  isVerticalPack,
  LEAD_LABELS,
  type IndustryPackId,
  isCoreNavHrefEnabledForPack,
  isNavHrefModuleEnabled,
} from '@kesbyar/shared';
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
  Briefcase,
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
  Truck,
  Car,
  Hotel,
  Warehouse,
  PartyPopper,
  Sprout,
  House,
  Route,
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

const COLLAB_SECTION = 'همکاری';

const COLLAB_NAV_ITEMS: NavItem[] = [
  { href: '/chat', label: 'گفتگوی تیم', icon: MessagesSquare, section: COLLAB_SECTION },
  { href: '/inbox', label: 'صندوق پیام', icon: Inbox, section: COLLAB_SECTION },
  { href: '/support', label: 'پشتیبانی', icon: LifeBuoy, section: COLLAB_SECTION },
];

function getCoreOpsItems(industryPack: string, industrySpecialty?: string | null): NavItem[] {
  const specialty = getSpecialty(industrySpecialty);
  const customersLabel =
    specialty?.labels.customers ??
    getPackNavItemLabel(
      industryPack,
      'customers',
      getPackDefinition(industryPack as IndustryPackId).labels.customers,
    );
  const leadsLabel = getPackNavItemLabel(industryPack, 'leads', LEAD_LABELS.plural);
  const tasksLabel = getPackNavItemLabel(industryPack, 'tasks', 'وظایف');

  return [
    { href: '/customers', label: customersLabel, icon: Users },
    { href: '/leads', label: leadsLabel, icon: Target },
    { href: '/invoices', label: 'فاکتورها', icon: Receipt },
    { href: '/payments', label: 'پرداخت‌ها', icon: Wallet },
    { href: '/tasks', label: tasksLabel, icon: CheckSquare },
    { href: '/reports', label: 'گزارش‌ها', icon: BarChart3 },
    { href: '/team', label: 'عملکرد تیم', icon: UsersRound },
    { href: '/activity', label: 'فعالیت‌ها', icon: Activity },
    { href: '/files', label: 'فایل‌ها', icon: FolderOpen },
    { href: '/settings', label: 'تنظیمات', icon: Settings },
  ];
}

/** @deprecated Use getNavItems(industryPack) — snapshot without pack labels */
export const APP_NAV_ITEMS: NavItem[] = [
  { href: '/dashboard', label: 'داشبورد', icon: LayoutDashboard },
  ...AI_NAV_ITEMS,
  ...getCoreOpsItems('GENERAL'),
];

export function getNavItems(
  industryPack: string,
  role?: string,
  industrySpecialty?: string | null,
  moduleToggles?: Record<string, boolean>,
): NavItem[] {
  const specialty = getSpecialty(industrySpecialty);
  const packDef = getPackDefinition(industryPack as IndustryPackId);
  const packHomeHref = getPackHomeHref(industryPack);
  // Specialty preview is the better landing when set; else vertical pack home.
  const homeHref = specialty?.homePath ?? packHomeHref;
  const homeLabel =
    specialty?.label ??
    (isVerticalPack(industryPack)
      ? (packDef.navItems[0]?.label ?? 'پیشخوان')
      : 'داشبورد');
  const homeIcon = specialty
    ? (PACK_ICON_MAP[specialty.icon] ?? LayoutDashboard)
    : (PACK_ICON_MAP[packDef.navItems[0]?.icon ?? ''] ?? LayoutDashboard);

  const specialtyItem: NavItem[] =
    specialty && specialty.homePath !== homeHref
      ? [
          {
            href: specialty.homePath,
            label: specialty.label,
            icon: PACK_ICON_MAP[specialty.icon] ?? LayoutDashboard,
            packOnly: true,
            section: 'بسته تخصصی',
          },
        ]
      : [];

  // Only the active org's industry pack — never other verticals; skip home duplicate
  const packItems = getPackNavItems(industryPack)
    .filter((item) => item.href !== homeHref)
    .map((item) => ({
      href: item.href,
      label: item.label,
      icon: PACK_ICON_MAP[item.icon] ?? LayoutDashboard,
      packOnly: true,
      section: specialty ? undefined : 'بسته تخصصی',
    }));

  const items: NavItem[] = [
    { href: homeHref, label: homeLabel, icon: homeIcon },
    ...AI_NAV_ITEMS,
    ...COLLAB_NAV_ITEMS,
    ...specialtyItem,
    ...packItems,
    ...getCoreOpsItems(industryPack, industrySpecialty),
  ];

  // Pack profile ∩ org module toggles ∩ role
  const filteredByPack = items.filter((item) =>
    isCoreNavHrefEnabledForPack(industryPack, item.href),
  );

  const filteredByModule = moduleToggles
    ? filteredByPack.filter((item) => isNavHrefModuleEnabled(moduleToggles, item.href))
    : filteredByPack;

  if (!role) return filteredByModule;

  return filteredByModule.filter((item) =>
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
