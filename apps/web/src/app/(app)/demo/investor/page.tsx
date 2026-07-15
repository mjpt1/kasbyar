import Link from 'next/link';
import { redirect } from 'next/navigation';

import { DemoScenarioSwitcher } from '@/components/demo/demo-walkthrough';
import { PageHeader } from '@/components/layout/page-header';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
  DEMO_INVESTOR_ORDER,
  INVESTOR_WALKTHROUGH_INTRO,
} from '@kesbyar/shared';
import { canShowDemoControls } from '@/lib/demo';

const PLATFORM_PILLARS = [
  {
    title: 'هسته مشترک',
    body: 'CRM، مالی، وظایف و گزارش — یک پلتفرم برای هر SMB ایرانی',
  },
  {
    title: 'بسته‌های عمودی',
    body: 'کلینیک، مسافرتی، خرده‌فروشی — توسعه بدون شکستن معماری',
  },
  {
    title: 'monetization',
    body: 'طرح اشتراک، سقف استفاده و قفل قابلیت — آماده درگاه پرداخت',
  },
  {
    title: 'دستیار عملیاتی',
    body: 'خلاصه و پاسخ از داده واقعی workspace — نه چت عمومی',
  },
];

export default async function DemoInvestorPage() {
  if (!canShowDemoControls()) {
    redirect('/dashboard');
  }

  return (
    <div className="space-y-8">
      <PageHeader
        title="نمای سرمایه‌گذار"
        description="پلتفرم، عمق عمودی و آمادگی تجاری — روی محصول واقعی"
        actions={
          <Button asChild variant="outline" size="sm">
            <Link href="/demo">مرکز نمایش</Link>
          </Button>
        }
      />

      <div className="grid gap-4 md:grid-cols-2">
        {PLATFORM_PILLARS.map((p) => (
          <Card key={p.title}>
            <CardHeader className="pb-2">
              <CardTitle className="text-base">{p.title}</CardTitle>
            </CardHeader>
            <CardContent className="text-sm text-muted-foreground">{p.body}</CardContent>
          </Card>
        ))}
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">مسیر نمایش ۱۰ دقیقه‌ای</CardTitle>
        </CardHeader>
        <CardContent className="space-y-2">
          {INVESTOR_WALKTHROUGH_INTRO.map((step, i) => (
            <div key={step.id} className="flex justify-between rounded-md border p-3 text-sm">
              <span>
                {i + 1}. {step.title} — {step.description}
              </span>
              <Button asChild variant="link" size="sm">
                <Link href={step.href}>برو</Link>
              </Button>
            </div>
          ))}
        </CardContent>
      </Card>

      <div>
        <h2 className="mb-4 text-lg font-semibold">سناریوهای عمودی (ترتیب پیشنهادی)</h2>
        <DemoScenarioSwitcher scenarios={DEMO_INVESTOR_ORDER} />
      </div>
    </div>
  );
}
