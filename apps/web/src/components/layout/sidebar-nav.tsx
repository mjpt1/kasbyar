'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Presentation, Settings } from 'lucide-react';

import { AUTH_NAV, getNavItems } from '@/config/navigation';
import { LogoutButton } from '@/components/layout/logout-button';
import { cn } from '@/lib/utils';

interface SidebarNavProps {
  organizationName: string;
  userName: string;
  industryPack: string;
  industrySpecialty?: string | null;
  role: string;
  isSuperAdmin?: boolean;
  onNavigate?: () => void;
  className?: string;
}

export function SidebarNav({
  organizationName,
  userName,
  industryPack,
  industrySpecialty = null,
  role,
  isSuperAdmin = false,
  onNavigate,
  className,
}: SidebarNavProps) {
  const pathname = usePathname();
  const navItems = getNavItems(industryPack, role, industrySpecialty);
  const showDemoNav = process.env.NEXT_PUBLIC_DEMO_MODE === 'true';

  return (
    <div className={cn('flex h-full flex-col', className)}>
      <div className="border-b p-4">
        <div className="flex items-center gap-2.5">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src="/brand/logo.svg"
            alt=""
            width={36}
            height={36}
            className="h-9 w-9 shrink-0 rounded-[10px]"
          />
          <div className="min-w-0">
            <div className="text-lg font-bold text-primary">کسب‌یار</div>
            <div className="truncate text-sm text-muted-foreground">{organizationName}</div>
          </div>
        </div>
      </div>

      <nav className="flex-1 space-y-1 overflow-y-auto p-3" aria-label="منوی اصلی">
        {navItems.map((item, index) => {
          const Icon = item.icon;
          const active = pathname === item.href || pathname.startsWith(`${item.href}/`);
          const prev = navItems[index - 1];
          const showPackDivider =
            item.packOnly && (index === 0 || !prev?.packOnly);
          const showSectionDivider =
            Boolean(item.section) && item.section !== prev?.section;

          return (
            <div key={item.href}>
              {showPackDivider ? (
                <p className="mb-1 mt-3 px-3 text-xs font-medium text-muted-foreground">
                  بسته تخصصی
                </p>
              ) : null}
              {showSectionDivider ? (
                <p className="mb-1 mt-3 px-3 text-xs font-medium text-muted-foreground">
                  {item.section}
                </p>
              ) : null}
              <Link
                href={item.href}
                onClick={onNavigate}
                className={cn(
                  'flex items-center gap-3 rounded-md px-3 py-2 text-sm transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring',
                  active
                    ? 'bg-primary/10 font-medium text-primary'
                    : 'text-muted-foreground hover:bg-accent hover:text-foreground',
                  item.packOnly && !active && 'border-s-2 border-primary/30',
                )}
                aria-current={active ? 'page' : undefined}
              >
                <Icon className="h-4 w-4 shrink-0" aria-hidden />
                {item.label}
              </Link>
            </div>
          );
        })}
        {showDemoNav ? (
          <Link
            href="/demo"
            onClick={onNavigate}
            className={cn(
              'flex items-center gap-3 rounded-md px-3 py-2 text-sm transition-colors',
              pathname.startsWith('/demo')
                ? 'bg-primary/10 font-medium text-primary'
                : 'text-muted-foreground hover:bg-accent hover:text-foreground',
            )}
          >
            <Presentation className="h-4 w-4" aria-hidden />
            مرکز نمایش
          </Link>
        ) : null}
        {isSuperAdmin ? (
          <Link
            href="/admin"
            onClick={onNavigate}
            className={cn(
              'flex items-center gap-3 rounded-md px-3 py-2 text-sm transition-colors',
              pathname.startsWith('/admin')
                ? 'bg-amber-500/10 font-medium text-amber-700 dark:text-amber-400'
                : 'text-muted-foreground hover:bg-accent hover:text-foreground',
            )}
          >
            <Settings className="h-4 w-4 shrink-0" aria-hidden />
            پنل سوپرادمین
          </Link>
        ) : null}
      </nav>

      <div className="border-t p-3">
        <div className="mb-2 truncate px-3 text-sm text-muted-foreground">{userName}</div>
        <Link
          href={AUTH_NAV.workspaceSelect.href}
          onClick={onNavigate}
          className="mb-2 block truncate px-3 text-xs text-primary hover:underline"
        >
          تغییر فضای کاری
        </Link>
        <LogoutButton />
      </div>
    </div>
  );
}
