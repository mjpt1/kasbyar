'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Settings } from 'lucide-react';

import { AUTH_NAV, getNavItems } from '@/config/navigation';
import { LogoutButton } from '@/components/layout/logout-button';
import { OrgSwitcher } from '@/components/layout/org-switcher';
import { cn } from '@/lib/utils';

interface SidebarNavProps {
  organizationName: string;
  organizationId?: string;
  userName: string;
  industryPack: string;
  industrySpecialty?: string | null;
  role: string;
  isSuperAdmin?: boolean;
  moduleToggles?: Record<string, boolean>;
  onNavigate?: () => void;
  className?: string;
}

export function SidebarNav({
  organizationName,
  organizationId,
  userName,
  industryPack,
  industrySpecialty = null,
  role,
  isSuperAdmin = false,
  moduleToggles,
  onNavigate,
  className,
}: SidebarNavProps) {
  const pathname = usePathname();
  const navItems = getNavItems(industryPack, role, industrySpecialty, moduleToggles);

  return (
    <div className={cn('flex h-full flex-col', className)}>
      <div className="border-b border-border/70 p-4">
        <div className="flex items-center gap-2.5">
          <span className="ky-brand-mark grid size-10 shrink-0 place-items-center rounded-[14px]">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src="/brand/logo.svg" alt="" width={22} height={22} className="size-[22px]" />
          </span>
          <div className="min-w-0 flex-1">
            <div className="text-base font-bold leading-tight tracking-tight text-primary">
              کسب‌یار
            </div>
            <OrgSwitcher
              currentOrganizationId={organizationId}
              currentOrganizationName={organizationName}
              className="-mx-2 mt-0.5"
            />
          </div>
        </div>
      </div>

      <nav className="flex-1 space-y-0.5 overflow-y-auto p-3" aria-label="منوی اصلی">
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
              {showPackDivider ? <p className="ky-nav-eyebrow">بسته تخصصی</p> : null}
              {showSectionDivider ? (
                <p className="ky-nav-eyebrow">{item.section}</p>
              ) : null}
              <Link
                href={item.href}
                onClick={onNavigate}
                data-active={active}
                className="ky-nav-item focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                aria-current={active ? 'page' : undefined}
              >
                <span className="ky-nav-icon">
                  <Icon className="size-4" aria-hidden />
                </span>
                <span className="min-w-0 truncate">{item.label}</span>
              </Link>
            </div>
          );
        })}
        {isSuperAdmin ? (
          <>
            <p className="ky-nav-eyebrow">مدیریت سامانه</p>
            <Link
              href="/admin"
              onClick={onNavigate}
              className={cn(
                'flex items-center gap-2.5 rounded-md px-3 py-2 text-sm transition-colors',
                pathname.startsWith('/admin')
                  ? 'bg-amber-500/10 font-semibold text-amber-700 dark:text-amber-400'
                  : 'text-muted-foreground hover:bg-accent hover:text-foreground',
              )}
            >
              <span className="grid size-7 shrink-0 place-items-center rounded-md bg-amber-500/15 text-amber-700 dark:text-amber-400">
                <Settings className="size-4" aria-hidden />
              </span>
              پنل سوپرادمین
            </Link>
          </>
        ) : null}
      </nav>

      <div className="border-t border-border/70 p-3">
        <div className="mb-2.5 flex items-center gap-2.5 px-1">
          <span className="ky-avatar-chip" aria-hidden>
            {userName.trim().slice(0, 1) || '؟'}
          </span>
          <div className="min-w-0 flex-1">
            <p className="truncate text-sm font-medium leading-tight">{userName}</p>
            <Link
              href={AUTH_NAV.workspaceSelect.href}
              onClick={onNavigate}
              className="truncate text-xs text-muted-foreground transition-colors hover:text-primary"
            >
              تغییر فضای کاری
            </Link>
          </div>
        </div>
        <LogoutButton />
      </div>
    </div>
  );
}
