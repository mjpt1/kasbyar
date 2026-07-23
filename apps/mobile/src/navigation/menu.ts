import {
  LEAD_LABELS,
  getPackNavItems,
  getSpecialty,
  ORG_MODULE_NAV,
  isOrgModuleEnabled,
} from '@kesbyar/shared';
import type { SessionContext } from '@kesbyar/shared';

export type MobileMenuItem = {
  id: string;
  label: string;
  href: string;
  section?: string;
  icon: string;
};

const CORE_ITEMS: MobileMenuItem[] = [
  { id: 'dashboard', label: 'داشبورد', href: '/dashboard', icon: 'grid' },
  { id: 'command', label: 'اتاق فرمان', href: '/command', section: 'هوشمند', icon: 'radio' },
  { id: 'conversation', label: 'دستیار', href: '/conversation', section: 'هوشمند', icon: 'chatbubble' },
  { id: 'memory', label: 'حافظه شرکت', href: '/memory', section: 'هوشمند', icon: 'library' },
  { id: 'forecast', label: 'پیش‌بینی', href: '/forecast', section: 'هوشمند', icon: 'trending-up' },
  { id: 'strategy', label: 'استراتژی', href: '/strategy', section: 'هوشمند', icon: 'compass' },
  { id: 'simulation', label: 'شبیه‌سازی', href: '/simulation', section: 'هوشمند', icon: 'calculator' },
  { id: 'meetings', label: 'جلسات', href: '/meetings', section: 'هوشمند', icon: 'people' },
  { id: 'growth', label: 'رشد و بازار', href: '/growth', section: 'هوشمند', icon: 'stats-chart' },
  { id: 'twin', label: 'دوقلوی دیجیتال', href: '/twin', section: 'هوشمند', icon: 'business' },
  { id: 'platform', label: 'پلتفرم و افزونه‌ها', href: '/platform', section: 'هوشمند', icon: 'extension-puzzle' },
  { id: 'automation', label: 'اتوماسیون', href: '/automation', section: 'هوشمند', icon: 'git-network' },
  { id: 'help', label: 'راهنما', href: '/help', section: 'هوشمند', icon: 'book' },
  { id: 'chat', label: 'گفتگوی تیم', href: '/chat', section: 'همکاری', icon: 'chatbubbles' },
  { id: 'support', label: 'پشتیبانی', href: '/support', section: 'همکاری', icon: 'life-buoy' },
  { id: 'customers', label: 'مشتریان', href: '/customers', icon: 'people' },
  { id: 'leads', label: LEAD_LABELS.plural, href: '/leads', icon: 'flag' },
  { id: 'invoices', label: 'فاکتورها', href: '/invoices', icon: 'receipt' },
  { id: 'payments', label: 'پرداخت‌ها', href: '/payments', icon: 'wallet' },
  { id: 'tasks', label: 'وظایف', href: '/tasks', icon: 'checkbox' },
  { id: 'reports', label: 'گزارش‌ها', href: '/reports', icon: 'bar-chart' },
  { id: 'activity', label: 'فعالیت‌ها', href: '/activity', icon: 'pulse' },
  { id: 'files', label: 'فایل‌ها', href: '/files', icon: 'folder' },
  { id: 'settings', label: 'تنظیمات', href: '/settings', icon: 'settings' },
  { id: 'onboarding', label: 'راه‌اندازی اولیه', href: '/onboarding', icon: 'rocket' },
  { id: 'notifications', label: 'اعلان‌ها', href: '/notifications', icon: 'notifications' },
  { id: 'admin', label: 'مدیریت پلتفرم', href: '/admin', icon: 'shield' },
];

/** Maps web path to expo-router screen path. */
export function webPathToMobileRoute(href: string): string {
  if (href === '/dashboard') return '/(app)';
  const root = href.replace(/^\//, '').split('/')[0] ?? '';
  const dedicated = new Set([
    'chat',
    'support',
    'leads',
    'customers',
    'invoices',
    'more',
    'tasks',
    'payments',
    'notifications',
    'settings',
    'conversation',
    'command',
  ]);
  if (dedicated.has(root)) {
    return `/(app)/${root}`;
  }
  const trimmed = href.replace(/^\//, '');
  return `/(app)/feature/${trimmed.split('/').map(encodeURIComponent).join('/')}`;
}

export function getMobileMenuItems(
  session: SessionContext,
  moduleToggles?: Record<string, boolean>,
): MobileMenuItem[] {
  const specialty = getSpecialty(session.industrySpecialty);
  const specialtyItems: MobileMenuItem[] = specialty
    ? [
        {
          id: `specialty-${specialty.id}`,
          label: specialty.label,
          href: specialty.homePath,
          section: 'تخصص',
          icon: 'star',
        },
      ]
    : [];

  const packItems: MobileMenuItem[] = getPackNavItems(session.industryPack).map((item) => ({
    id: `pack-${item.href}`,
    label: item.label,
    href: item.href,
    section: 'بسته صنعتی',
    icon: 'layers',
  }));

  const merged = [
    CORE_ITEMS[0]!,
    ...CORE_ITEMS.filter((item) => item.section === 'هوشمند'),
    ...CORE_ITEMS.filter((item) => item.section === 'همکاری'),
    ...specialtyItems,
    ...packItems,
    ...CORE_ITEMS.filter((item) => !item.section && item.id !== 'dashboard' && item.id !== 'admin'),
  ];

  const filtered = moduleToggles
    ? merged.filter((item) => {
        const moduleKey = Object.entries(ORG_MODULE_NAV).find(([, href]) => href === item.href)?.[0];
        if (!moduleKey) return true;
        return isOrgModuleEnabled(moduleToggles, moduleKey);
      })
    : merged;

  if (session.isSuperAdmin) {
    filtered.push(CORE_ITEMS.find((i) => i.id === 'admin')!);
  }

  return filtered;
}

/** API path for a web feature route (best-effort mapping). */
export function featureApiPath(webPath: string): string {
  const map: Record<string, string> = {
    '/dashboard': '/api/dashboard',
    '/leads': '/api/leads',
    '/customers': '/api/customers',
    '/invoices': '/api/invoices',
    '/payments': '/api/payments',
    '/tasks': '/api/tasks',
    '/reports': '/api/reports',
    '/activity': '/api/audit',
    '/files': '/api/files',
    '/settings': '/api/settings',
    '/notifications': '/api/notifications',
    '/chat': '/api/chat/conversations',
    '/support': '/api/support/tickets',
    '/platform': '/api/platform',
    '/org-modules': '/api/org-modules',
    '/onboarding': '/api/onboarding',
    '/conversation': '/api/conversation',
    '/memory': '/api/memory/timeline',
    '/forecast': '/api/forecast',
    '/strategy': '/api/strategy',
    '/simulation': '/api/simulation',
    '/meetings': '/api/meetings',
    '/growth': '/api/growth',
    '/twin': '/api/twin/company',
    '/automation': '/api/automation',
    '/command': '/api/briefing/daily',
    '/members': '/api/members',
    '/billing': '/api/billing/subscription',
    '/health-scores': '/api/health/scores',
    '/sentiment': '/api/sentiment',
    '/catalog': '/api/catalog',
    '/reminders': '/api/reminders',
    '/pipeline-stages': '/api/pipeline-stages',
  };

  if (map[webPath]) return map[webPath];

  if (webPath.startsWith('/admin')) return '/api/admin/stats';

  const packMatch = webPath.match(/^\/([\w-]+)\/([\w-]+)/);
  if (packMatch) {
    const [, pack, resource] = packMatch;
    const packApiMap: Record<string, string> = {
      clinic: 'clinic',
      retail: 'retail',
      travel: 'travel',
      beauty: 'beauty',
      food: 'food',
      education: 'education',
      fitness: 'fitness',
      'real-estate': 'real-estate',
      workshop: 'workshop',
      law: 'law',
      accounting: 'accounting',
      insurance: 'insurance',
      agency: 'agency',
      contracting: 'contracting',
      photography: 'photography',
      cleaning: 'cleaning',
      printing: 'printing',
    };
    const apiPack = packApiMap[pack];
    if (apiPack) {
      return `/api/packs/${apiPack}/${resource}`;
    }
  }

  if (webPath.startsWith('/v/')) {
    return '/api/dashboard';
  }

  return '/api/dashboard';
}
