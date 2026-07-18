'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useState } from 'react';
import { toast } from 'sonner';

import type { DemoScenario } from '@kesbyar/shared';

import { DemoResetButton } from '@/components/demo/demo-banner';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';

interface DemoWalkthroughPanelProps {
  scenario: DemoScenario | null;
  steps: Array<{ id: string; title: string; description: string; href: string; tip?: string }>;
  currentSlug?: string;
}

export function DemoWalkthroughPanel({ scenario, steps, currentSlug }: DemoWalkthroughPanelProps) {
  if (!scenario) return null;

  return (
    <Card className="border-primary/20 bg-primary/5">
      <CardHeader className="pb-3">
        <CardTitle className="text-base">راهنمای نمایش — {scenario.title}</CardTitle>
        <CardDescription>{scenario.valueProposition}</CardDescription>
      </CardHeader>
      <CardContent className="space-y-3">
        <ul className="space-y-2 text-sm">
          {steps.map((step, i) => (
            <li key={step.id} className="rounded-md border bg-card p-3">
              <div className="flex items-start justify-between gap-2">
                <div>
                  <span className="font-medium">
                    {i + 1}. {step.title}
                  </span>
                  <p className="mt-1 text-muted-foreground">{step.description}</p>
                  {step.tip ? (
                    <p className="mt-1 text-xs text-primary">💡 {step.tip}</p>
                  ) : null}
                </div>
                <Button asChild variant="outline" size="sm">
                  <Link href={step.href}>برو</Link>
                </Button>
              </div>
            </li>
          ))}
        </ul>
        <div className="flex flex-wrap gap-2 border-t pt-3">
          {scenario.showcaseLinks.map((link) => (
            <Button key={link.href} asChild variant="secondary" size="sm">
              <Link href={link.href}>{link.label}</Link>
            </Button>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}

export function DemoScenarioSwitcher({
  scenarios,
  activeSlug,
}: {
  scenarios: DemoScenario[];
  activeSlug?: string;
}) {
  const router = useRouter();
  const [loading, setLoading] = useState<string | null>(null);

  async function switchScenario(scenarioId: string) {
    setLoading(scenarioId);
    try {
      const res = await fetch('/api/demo/switch', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ scenarioId }),
      });
      const data = await res.json();
      if (!data.success) {
        toast.error(data.error?.message ?? 'تغییر سناریو ناموفق');
        return;
      }
      toast.success(`سناریو «${data.data.organizationName}» فعال شد`);
      router.push(data.data.redirectTo);
      router.refresh();
    } catch {
      toast.error('خطا در تغییر سناریو');
    } finally {
      setLoading(null);
    }
  }

  return (
    <div className="grid gap-3 sm:grid-cols-2">
      {scenarios.map((s) => (
        <Card
          key={s.id}
          className={s.orgSlug === activeSlug ? 'border-primary ring-1 ring-primary' : undefined}
        >
          <CardHeader className="pb-2">
            <CardTitle className="text-base">{s.title}</CardTitle>
            <CardDescription>{s.subtitle}</CardDescription>
          </CardHeader>
          <CardContent className="space-y-2">
            <p className="text-xs text-muted-foreground">
              طرح: {s.planLabel} · {s.personaTitle}
            </p>
            <Button
              className="w-full"
              size="sm"
              variant={s.orgSlug === activeSlug ? 'secondary' : 'default'}
              disabled={loading === s.id}
              onClick={() => switchScenario(s.id)}
            >
              {loading === s.id ? 'در حال تغییر...' : s.orgSlug === activeSlug ? 'فعال' : 'نمایش این سناریو'}
            </Button>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}

export function DemoToolbarActions() {
  return (
    <div className="hidden items-center gap-1 sm:flex">
      <Button asChild variant="ghost" size="sm" className="h-8">
        <Link href="/demo">نمایش</Link>
      </Button>
      <DemoResetButton />
    </div>
  );
}
