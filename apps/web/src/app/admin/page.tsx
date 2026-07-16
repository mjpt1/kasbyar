import Link from 'next/link';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { getAdminStats } from '@/server/admin/admin.service';

export default async function AdminDashboardPage() {
  const stats = await getAdminStats();

  const cards = [
    { label: 'کل کاربران', value: stats.users },
    { label: 'سازمان‌ها', value: stats.organizations },
    { label: 'عضویت‌های فعال', value: stats.activeMemberships },
    { label: 'ثبت‌نام امروز', value: stats.signupsToday },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold">خلاصه پلتفرم</h2>
        <p className="text-sm text-muted-foreground">
          مدیریت کاربران، نقش‌ها و پیشخوان هر سازمان از اینجا انجام می‌شود.
        </p>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {cards.map((card) => (
          <Card key={card.label}>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                {card.label}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-3xl font-bold">{card.value}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">راهنمای دسترسی</CardTitle>
        </CardHeader>
        <CardContent className="space-y-2 text-sm text-muted-foreground">
          <p>
            هر کاربر فقط سازمان‌هایی را می‌بیند که عضو آن است. پیشخوان (کلینیک،
            خرده‌فروشی، عمومی و…) از{' '}
            <strong className="text-foreground">بسته صنعتی سازمان</strong> تعیین
            می‌شود.
          </p>
          <p>
            نقش داخل سازمان (مالک، مدیر، کارمند، …) تعیین می‌کند چه منوهایی در
            sidebar دیده شود — مثلاً کارمند اتوماسیون و گزارش‌های مدیریتی را
            نمی‌بیند.
          </p>
          <div className="flex flex-wrap gap-2 pt-2">
            <Link href="/admin/users" className="text-primary hover:underline">
              مدیریت کاربران و نقش‌ها
            </Link>
            <span>·</span>
            <Link
              href="/admin/organizations"
              className="text-primary hover:underline"
            >
              تغییر بسته صنعتی سازمان
            </Link>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
