import type { LucideIcon } from 'lucide-react';
import Link from 'next/link';

import { Button } from '@/components/ui/button';

/**
 * Full-page or list empty state — always include next-step CTA when possible.
 * @see docs/performance/ui-state-consistency-rules.md
 */

interface EmptyStateProps {
  icon: LucideIcon;
  title: string;
  description: string;
  actionLabel?: string;
  /** لینک مستقیم — مناسب صفحات سرور */
  actionHref?: string;
  /** برای کلاینت — onClick */
  onAction?: () => void;
}

export function EmptyState({
  icon: Icon,
  title,
  description,
  actionLabel,
  actionHref,
  onAction,
}: EmptyStateProps) {
  return (
    <div
      className="flex flex-col items-center justify-center rounded-[var(--radius)] border border-dashed border-border bg-card/40 px-6 py-16 text-center"
      style={{
        backgroundImage:
          'radial-gradient(ellipse 60% 50% at 50% 0%, hsl(var(--primary)/0.06), transparent 70%)',
      }}
    >
      <div className="mb-4 grid size-16 place-items-center rounded-full bg-primary/10 ring-8 ring-primary/5">
        <Icon className="size-7 text-primary/70" aria-hidden />
      </div>
      <h3 className="text-lg font-semibold tracking-tight">{title}</h3>
      <p className="mt-2 max-w-sm text-sm text-muted-foreground">{description}</p>
      {actionLabel && actionHref ? (
        <Button className="mt-6" asChild>
          <Link href={actionHref}>{actionLabel}</Link>
        </Button>
      ) : null}
      {actionLabel && onAction && !actionHref ? (
        <Button className="mt-6" type="button" onClick={onAction}>
          {actionLabel}
        </Button>
      ) : null}
    </div>
  );
}
