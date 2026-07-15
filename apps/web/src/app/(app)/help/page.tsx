import Link from 'next/link';
import { HelpCircle, LifeBuoy, Shield } from 'lucide-react';

import { PageHeader } from '@/components/layout/page-header';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

const SECTIONS = [
  {
    icon: LifeBuoy,
    title: 'شروع سریع',
    body: 'از داشبورد وضعیت روز را ببینید، مشتری و فاکتور ثبت کنید، و از دستیار برای خلاصه عملیات استفاده کنید.',
    href: '/dashboard',
    label: 'رفتن به داشبورد',
  },
  {
    icon: Shield,
    title: 'امنیت و داده',
    body: 'بایگانی مشتری حذف سخت نیست. برای بازنشانی دمو فقط در محیط نمایش از مرکز نمایش استفاده کنید.',
    href: '/settings/audit',
    label: 'گزارش ممیزی',
  },
  {
    icon: HelpCircle,
    title: 'مشکل فنی؟',
    body: 'اگر سرویس هوشمند در دسترس نبود، دستیار از حالت پشتیبان پاسخ می‌دهد. وضعیت را در صفحه دستیار ببینید.',
    href: '/conversation',
    label: 'صفحه دستیار',
  },
];

export default function HelpPage() {
  return (
    <div className="space-y-6">
      <PageHeader
        title="راهنما و پشتیبانی"
        description="نکات عملی برای استفاده روزمره از کسب‌یار"
      />

      <div className="grid gap-4 md:grid-cols-3">
        {SECTIONS.map((s) => (
          <Card key={s.title}>
            <CardHeader className="pb-2">
              <CardTitle className="flex items-center gap-2 text-base">
                <s.icon className="h-4 w-4 text-primary" aria-hidden />
                {s.title}
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4 text-sm text-muted-foreground">
              <p>{s.body}</p>
              <Button asChild variant="outline" size="sm">
                <Link href={s.href}>{s.label}</Link>
              </Button>
            </CardContent>
          </Card>
        ))}
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">تماس با تیم محصول</CardTitle>
        </CardHeader>
        <CardContent className="text-sm text-muted-foreground">
          <p>
            برای پایلوت V1، مشکلات را با اسکرین‌شات، زمان وقوع و نام فضای کاری گزارش دهید.
            مستندات فنی تیم در مخزن:{' '}
            <code className="rounded bg-muted px-1">docs/V1_LAUNCH.md</code>
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
