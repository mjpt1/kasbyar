'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';

import { LogoutButton } from '@/components/layout/logout-button';
import { cn } from '@/lib/utils';

const ADMIN_NAV = [
  { href: '/admin', label: 'خلاصه پلتفرم', exact: true },
  { href: '/admin/users', label: 'کاربران' },
  { href: '/admin/organizations', label: 'سازمان‌ها' },
  { href: '/admin/settings', label: 'تنظیمات پلتفرم' },
] as const;

export function AdminShell({
  email,
  children,
}: {
  email: string;
  children: React.ReactNode;
}) {
  const pathname = usePathname();

  return (
    <div className="admin-pastel min-h-screen">
      <div className="mx-auto grid min-h-screen max-w-[1400px] lg:grid-cols-[260px_1fr]">
        <aside className="admin-rail flex flex-col gap-7 p-5 lg:sticky lg:top-0 lg:h-screen">
          <div className="flex items-center gap-3 px-2">
            <div className="admin-brand-mark grid h-11 w-11 place-items-center rounded-[14px] text-lg font-extrabold">
              ک
            </div>
            <div>
              <p className="text-[11px] tracking-wide text-foreground/55">CONTROL TOWER</p>
              <p className="text-[15px] font-bold">سوپرادمین کسب‌یار</p>
            </div>
          </div>

          <nav className="flex flex-1 flex-col gap-1.5" aria-label="منوی سوپرادمین">
            {ADMIN_NAV.map((item) => {
              const active = item.exact
                ? pathname === item.href
                : pathname.startsWith(item.href);
              return (
                <Link
                  key={item.href}
                  href={item.href}
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

        <main className="px-4 py-6 sm:px-8 sm:py-7">{children}</main>
      </div>
    </div>
  );
}
