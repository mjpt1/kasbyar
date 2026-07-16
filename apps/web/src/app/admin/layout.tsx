import Link from 'next/link';
import { redirect } from 'next/navigation';

import { LogoutButton } from '@/components/layout/logout-button';
import { requirePlatformAdmin } from '@/lib/auth/session';

const ADMIN_NAV = [
  { href: '/admin', label: 'خلاصه' },
  { href: '/admin/users', label: 'کاربران' },
  { href: '/admin/organizations', label: 'سازمان‌ها' },
  { href: '/admin/settings', label: 'تنظیمات پلتفرم' },
];

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await requirePlatformAdmin();
  if (!session) redirect('/login');

  return (
    <div className="flex min-h-screen flex-col bg-muted/30">
      <header className="border-b bg-card">
        <div className="mx-auto flex max-w-6xl flex-wrap items-center justify-between gap-4 px-4 py-4 sm:px-6">
          <div>
            <p className="text-xs font-medium text-amber-700 dark:text-amber-400">
              پنل سوپرادمین
            </p>
            <h1 className="text-lg font-bold">مدیریت پلتفرم کسب‌یار</h1>
          </div>
          <div className="flex flex-wrap items-center gap-3 text-sm">
            <span className="text-muted-foreground">{session.user.email}</span>
            <Link href="/dashboard" className="text-primary hover:underline">
              بازگشت به اپ
            </Link>
            <LogoutButton />
          </div>
        </div>
        <nav
          className="mx-auto flex max-w-6xl gap-1 overflow-x-auto px-4 pb-3 sm:px-6"
          aria-label="منوی سوپرادمین"
        >
          {ADMIN_NAV.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className="rounded-md px-3 py-1.5 text-sm text-muted-foreground hover:bg-accent hover:text-foreground"
            >
              {item.label}
            </Link>
          ))}
        </nav>
      </header>
      <main className="mx-auto w-full max-w-6xl flex-1 p-4 sm:p-6">{children}</main>
    </div>
  );
}
