import Link from 'next/link';
import { redirect } from 'next/navigation';

import { DemoResetButton } from '@/components/demo/demo-banner';
import {
  DemoScenarioSwitcher,
  DemoWalkthroughPanel,
} from '@/components/demo/demo-walkthrough';
import { PageHeader } from '@/components/layout/page-header';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
  DEMO_PERSONAS,
  DEMO_SCENARIO_LIST,
  SALES_WALKTHROUGH_INTRO,
  getScenarioByOrgSlug,
  getWalkthroughForScenario,
} from '@kesbyar/shared';
import { requireSession } from '@/lib/auth/session';
import { canShowDemoControls } from '@/lib/demo';
import { prisma } from '@/lib/prisma';

export default async function DemoHubPage() {
  if (!canShowDemoControls()) {
    redirect('/dashboard');
  }

  const session = await requireSession();
  const org = await prisma.organization.findUnique({
    where: { id: session.organizationId },
    select: { slug: true, isDemo: true },
  });

  const activeScenario = org?.slug ? getScenarioByOrgSlug(org.slug) : null;

  return (
    <div className="space-y-8">
      <PageHeader
        title="مرکز نمایش محصول"
        description="سناریوهای فروش، راهنمای گام‌به‌گام و بازنشانی دمو"
        actions={
          <div className="flex gap-2">
            <Button asChild variant="outline" size="sm">
              <Link href="/demo/investor">نمای سرمایه‌گذار</Link>
            </Button>
            <DemoResetButton />
          </div>
        }
      />

      <Card>
        <CardHeader>
          <CardTitle className="text-base">ترتیب پیشنهادی فروش</CardTitle>
        </CardHeader>
        <CardContent className="space-y-2 text-sm">
          {SALES_WALKTHROUGH_INTRO.map((step, i) => (
            <div key={step.id} className="ky-list-row p-3">
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
        <h2 className="mb-4 text-lg font-semibold">انتخاب سناریو کسب‌وکار</h2>
        <DemoScenarioSwitcher scenarios={DEMO_SCENARIO_LIST} activeSlug={org?.slug} />
      </div>

      {activeScenario ? (
        <DemoWalkthroughPanel
          scenario={activeScenario}
          steps={getWalkthroughForScenario(activeScenario.id)}
          currentSlug={org?.slug}
        />
      ) : null}

      <Card>
        <CardHeader>
          <CardTitle className="text-base">شخصیت‌های دمو</CardTitle>
        </CardHeader>
        <CardContent className="grid gap-3 sm:grid-cols-3">
          {DEMO_PERSONAS.map((p) => (
            <div key={p.id} className="rounded-md border p-3 text-sm">
              <div className="font-medium">{p.name}</div>
              <Badge variant="secondary" className="mt-1">
                {p.title}
              </Badge>
              <p className="mt-2 text-muted-foreground">{p.description}</p>
              <p className="mt-1 font-mono text-xs" dir="ltr">
                {p.email}
              </p>
            </div>
          ))}
        </CardContent>
      </Card>
    </div>
  );
}
