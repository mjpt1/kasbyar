'use client';

import Link from 'next/link';
import { Lock } from 'lucide-react';

import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';

interface UpgradePromptProps {
  title?: string;
  message: string;
  suggestedPlan?: string;
  compact?: boolean;
}

export function UpgradePrompt({
  title = 'نیاز به ارتقای طرح',
  message,
  suggestedPlan,
  compact = false,
}: UpgradePromptProps) {
  const href = suggestedPlan
    ? `/settings/billing?upgrade=1&suggested=${suggestedPlan}`
    : '/settings/billing';

  if (compact) {
    return (
      <div
        className="flex items-center justify-between gap-4 rounded-md border border-amber-200 bg-amber-50/80 p-3 text-sm dark:border-amber-900 dark:bg-amber-950/30"
        role="status"
        aria-label={title}
      >
        <div className="flex items-center gap-2 text-amber-900 dark:text-amber-100">
          <Lock className="h-4 w-4 shrink-0" />
          <span>{message}</span>
        </div>
        <Button asChild size="sm" variant="outline">
          <Link href={href}>ارتقا</Link>
        </Button>
      </div>
    );
  }

  return (
    <Card
      className="border-amber-200 bg-amber-50/50 dark:border-amber-900 dark:bg-amber-950/20"
      role="status"
      aria-label={title}
    >
      <CardContent className="flex flex-col items-start gap-4 p-6 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex gap-3">
          <Lock className="mt-0.5 h-5 w-5 text-amber-600" />
          <div>
            <h3 className="font-semibold">{title}</h3>
            <p className="mt-1 text-sm text-muted-foreground">{message}</p>
          </div>
        </div>
        <Button asChild>
          <Link href={href}>مشاهده طرح‌ها و ارتقا</Link>
        </Button>
      </CardContent>
    </Card>
  );
}
