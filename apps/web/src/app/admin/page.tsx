import Link from 'next/link';
import { INDUSTRY_PACK_LABELS, toPersianDigits } from '@kesbyar/shared';

import { getAdminStats } from '@/server/admin/admin.service';

function relativeFa(date: Date): string {
  const mins = Math.round((Date.now() - date.getTime()) / 60000);
  if (mins < 1) return 'همین الان';
  if (mins < 60) return `${toPersianDigits(mins)} دقیقه پیش`;
  const hours = Math.round(mins / 60);
  if (hours < 24) return `${toPersianDigits(hours)} ساعت پیش`;
  const days = Math.round(hours / 24);
  return `${toPersianDigits(days)} روز پیش`;
}

export default async function AdminDashboardPage() {
  const stats = await getAdminStats();

  const metrics = [
    {
      label: 'کل کاربران',
      value: stats.users,
      foot: 'ثبت‌شده روی پلتفرم',
      tone: 'sky' as const,
    },
    {
      label: 'سازمان‌ها',
      value: stats.organizations,
      foot: 'فعال روی پلتفرم',
      tone: 'blush' as const,
    },
    {
      label: 'عضویت‌های فعال',
      value: stats.activeMemberships,
      foot: 'نقش‌دار و متصل',
      tone: 'sage' as const,
    },
    {
      label: 'ثبت‌نام امروز',
      value: stats.signupsToday,
      foot: 'از نیمه‌شب تا الان',
      tone: 'butter' as const,
    },
  ];

  const packOrder = [
    'CLINIC',
    'RETAIL',
    'TRAVEL_AGENCY',
    'BEAUTY_SALON',
    'FOOD_SERVICE',
    'EDUCATION',
    'FITNESS',
    'REAL_ESTATE',
    'WORKSHOP',
    'LAW_FIRM',
    'ACCOUNTING_FIRM',
    'INSURANCE_AGENCY',
    'MARKETING_AGENCY',
    'CONTRACTING',
    'PHOTOGRAPHY',
    'CLEANING',
    'PRINTING',
    'GENERAL',
  ] as const;
  const packItems = packOrder.map((key) => ({
    key,
    label: INDUSTRY_PACK_LABELS[key] ?? key,
    count: stats.packs[key] ?? 0,
  }));

  type ActivityItem = {
    title: string;
    detail: string;
    at: Date;
    tone: 'blush' | 'sage' | 'sky';
  };

  const activity: ActivityItem[] = [
    ...stats.recentOrganizations.map((org) => ({
      title: `سازمان جدید: ${org.name}`,
      detail: `بسته ${INDUSTRY_PACK_LABELS[org.industryPack] ?? org.industryPack}`,
      at: org.createdAt,
      tone: 'blush' as const,
    })),
    ...stats.recentUsers.map((user) => ({
      title: `ثبت‌نام کاربر: ${user.name}`,
      detail: user.email,
      at: user.createdAt,
      tone: 'sage' as const,
    })),
  ]
    .sort((a, b) => b.at.getTime() - a.at.getTime())
    .slice(0, 5);

  return (
    <div className="space-y-4">
      <header className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <div className="admin-eyebrow mb-2.5 inline-flex items-center gap-2 rounded-full px-3 py-1.5 text-xs font-semibold">
            پلتفرم زنده
          </div>
          <h1 className="text-3xl font-bold tracking-tight sm:text-4xl">
            نبض کسب‌یار را از یک نگاه ببین
          </h1>
          <p className="mt-2 max-w-md text-[15px] leading-8 text-foreground/65">
            کاربران، سازمان‌ها و ثبت‌نام‌های تازه — با دسترسی سریع به کنترل نقش‌ها و
            بسته‌های صنفی.
          </p>
        </div>
        <div className="flex flex-wrap gap-2.5">
          <Link
            href="/dashboard"
            className="inline-flex h-11 items-center justify-center rounded-full border border-border/80 bg-white/65 px-4 text-sm font-semibold backdrop-blur transition hover:-translate-y-px hover:shadow-md"
          >
            بازگشت به اپ
          </Link>
          <Link
            href="/admin/users"
            className="admin-btn-primary inline-flex h-11 items-center justify-center rounded-full px-4 text-sm font-semibold text-white transition hover:-translate-y-px"
          >
            مدیریت کاربران
          </Link>
        </div>
      </header>

      <section
        className="grid gap-3.5 sm:grid-cols-2 xl:grid-cols-4"
        aria-label="شاخص‌های کلیدی"
      >
        {metrics.map((metric) => (
          <article
            key={metric.label}
            className={`admin-metric admin-metric-${metric.tone} relative min-h-[132px] overflow-hidden rounded-[22px] border border-white/80 p-5 shadow-[0_18px_44px_rgba(120,140,170,0.14)]`}
          >
            <p className="mb-4 text-xs font-semibold opacity-65">{metric.label}</p>
            <p className="text-4xl font-bold tracking-tight tabular-nums sm:text-[46px] sm:leading-none">
              {toPersianDigits(metric.value)}
            </p>
            <p className="mt-3.5 text-xs opacity-70">{metric.foot}</p>
          </article>
        ))}
      </section>

      <section className="grid gap-3.5 lg:grid-cols-[1.35fr_0.85fr]">
        <div className="rounded-[22px] border border-white/85 bg-white/70 p-5 shadow-[0_18px_44px_rgba(120,140,170,0.14)]">
          <div className="mb-4 flex items-center justify-between gap-3">
            <h2 className="text-lg font-bold">فعالیت اخیر پلتفرم</h2>
            <span className="admin-chip rounded-full px-2.5 py-1 text-[11px] font-semibold">
              زنده
            </span>
          </div>
          {activity.length === 0 ? (
            <p className="text-sm text-foreground/55">هنوز فعالیتی ثبت نشده است.</p>
          ) : (
            <ul className="divide-y divide-border/70">
              {activity.map((item) => (
                <li
                  key={`${item.title}-${item.at.toISOString()}`}
                  className="grid grid-cols-[18px_1fr_auto] items-start gap-3 py-3.5 first:pt-0 last:pb-0"
                >
                  <span className={`admin-pulse admin-pulse-${item.tone} mt-1.5`} />
                  <div>
                    <p className="text-sm font-semibold">{item.title}</p>
                    <p className="text-xs text-foreground/55">{item.detail}</p>
                  </div>
                  <time className="whitespace-nowrap text-[11px] text-foreground/40">
                    {relativeFa(item.at)}
                  </time>
                </li>
              ))}
            </ul>
          )}
        </div>

        <div className="rounded-[22px] border border-white/85 bg-white/70 p-5 shadow-[0_18px_44px_rgba(120,140,170,0.14)]">
          <h2 className="mb-4 text-lg font-bold">اقدام سریع</h2>
          <div className="grid gap-2.5">
            {[
              {
                href: '/admin/users',
                title: 'کاربران و نقش‌ها',
                detail: 'سوپرادمین، مالک، مدیر، کارمند',
              },
              {
                href: '/admin/organizations',
                title: 'سازمان‌ها و بسته صنفی',
                detail: 'کلینیک · خرده‌فروشی · سفر · عمومی',
              },
              {
                href: '/admin/settings',
                title: 'تنظیمات پلتفرم',
                detail: 'ثبت‌نام خودکار و نقش پیش‌فرض',
              },
            ].map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className="admin-quick flex items-center justify-between rounded-2xl border border-border/70 px-4 py-4 transition hover:-translate-x-1"
              >
                <div>
                  <p className="text-sm font-semibold">{item.title}</p>
                  <p className="text-xs text-foreground/55">{item.detail}</p>
                </div>
                <span className="admin-arrow grid h-7 w-7 place-items-center rounded-full text-sm text-white">
                  ←
                </span>
              </Link>
            ))}
          </div>
        </div>
      </section>

      <section
        className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4"
        aria-label="توزیع بسته‌های صنفی"
      >
        {packItems.map((pack, index) => (
          <div
            key={pack.key}
            className={`admin-pack admin-pack-${index + 1} rounded-[18px] border border-dashed border-foreground/10 p-4`}
          >
            <p className="text-xs text-foreground/55">{pack.label}</p>
            <p className="mt-2 text-[22px] font-bold tabular-nums">
              {toPersianDigits(pack.count)}
            </p>
            <p className="text-xs text-foreground/55">سازمان</p>
          </div>
        ))}
      </section>
    </div>
  );
}
