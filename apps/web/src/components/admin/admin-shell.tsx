'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Menu, X } from 'lucide-react';
import { useState } from 'react';

import { LogoutButton } from '@/components/layout/logout-button';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

const ADMIN_NAV: { href: string; label: string; exact?: boolean }[] = [
  { href: '/admin', label: 'خلاصه پلتفرم', exact: true },
  { href: '/admin/users', label: 'کاربران' },
  { href: '/admin/organizations', label: 'سازمان‌ها' },
  { href: '/admin/settings', label: 'تنظیمات پلتفرم' },
];

function AdminNav({
  pathname,
  onNavigate,
}: {
  pathname: string;
  onNavigate?: () => void;
}) {
  return (
    <nav className="flex flex-1 flex-col gap-1.5" aria-label="منوی سوپرادمین">
      {ADMIN_NAV.map((item) => {
        const active = item.exact ? pathname === item.href : pathname.startsWith(item.href);
        return (
          <Link
            key={item.href}
            href={item.href}
            onClick={onNavigate}
            className={cn(
              'flex items-center gap-2.5 rounded-[14px] px-3.5 py-3 text-sm text-foreground/70 transition hover:bg-white/45 hover:text-foreground',
              active && 'admin-nav-active text-foreground',
            )}
          >
            <span
              className={cn(
                'h-2 w-2 rounded-full bg-current opacity-45',
                active && 'admin-nav-dot opacity-100',
              )}
            />
            {item.label}
          </Link>
        );
      })}
    </nav>
  );
}

function AdminBrand() {
  return (
    <div className="flex items-center gap-3 px-2">
      <div className="admin-brand-mark grid h-11 w-11 place-items-center rounded-[14px] text-lg font-extrabold">
        ک
      </div>
      <div>
        <p className="text-[11px] tracking-wide text-foreground/55">CONTROL TOWER</p>
        <p className="text-[15px] font-bold">سوپرادمین کسب‌یار</p>
      </div>
    </div>
  );
}

export function AdminShell({
  email,
  children,
}: {
  email: string;
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const [mobileOpen, setMobileOpen] = useState(false);

  return (
    <div className="admin-pastel min-h-[100dvh]">
      <div className="mx-auto grid min-h-[100dvh] max-w-[1400px] lg:grid-cols-[260px_1fr]">
        <aside className="admin-rail hidden flex-col gap-7 p-5 lg:sticky lg:top-0 lg:flex lg:h-screen">
          <AdminBrand />
          <AdminNav pathname={pathname} />
          <div className="space-y-3 rounded-2xl border border-white/70 bg-white/50 p-3.5 text-xs leading-relaxed text-foreground/70">
            <p>
              وضعیت سرویس‌ها پایدار است.
              <br />
              آخرین همگام‌سازی: چند لحظه پیش
            </p>
            <p className="truncate text-[11px] text-foreground/50" title={email}>
              {email}
            </p>
            <LogoutButton />
          </div>
        </aside>

        {mobileOpen ? (
          <div className="fixed inset-0 z-50 lg:hidden" role="dialog" aria-modal="true">
            <button
              type="button"
              className="absolute inset-0 bg-black/40"
              aria-label="بستن منو"
              onClick={() => setMobileOpen(false)}
            />
            <aside className="admin-rail absolute inset-y-0 right-0 flex w-[min(100%,18rem)] flex-col gap-6 p-4 shadow-xl">
              <div className="flex items-center justify-between gap-2">
                <AdminBrand />
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  aria-label="بستن"
                  onClick={() => setMobileOpen(false)}
                >
                  <X className="h-5 w-5" />
                </Button>
              </div>
              <AdminNav pathname={pathname} onNavigate={() => setMobileOpen(false)} />
              <div className="mt-auto space-y-3 rounded-2xl border border-white/70 bg-white/50 p-3.5 text-xs">
                <p className="truncate text-[11px] text-foreground/50" title={email}>
                  {email}
                </p>
                <LogoutButton />
              </div>
            </aside>
          </div>
        ) : null}

        <div className="flex min-w-0 flex-col">
          <div className="sticky top-0 z-40 flex items-center gap-3 border-b border-white/50 bg-background/80 px-4 py-3 backdrop-blur-md lg:hidden">
            <Button
              type="button"
              variant="outline"
              size="icon"
              aria-label="باز کردن منو"
              aria-expanded={mobileOpen}
              onClick={() => setMobileOpen(true)}
            >
              <Menu className="h-5 w-5" />
            </Button>
            <p className="text-sm font-bold">سوپرادمین کسب‌یار</p>
          </div>
          <main className="px-4 py-5 pb-[max(1.25rem,env(safe-area-inset-bottom))] sm:px-8 sm:py-7">
            {children}
          </main>
        </div>
      </div>
    </div>
  );
}
