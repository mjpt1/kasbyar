import type { LucideIcon } from 'lucide-react';
import { ChevronLeft } from 'lucide-react';
import Link from 'next/link';

import { Card } from '@/components/ui/card';
import { cn } from '@/lib/utils';

export function StatCard({
  title,
  value,
  subtitle,
  href,
  icon: Icon,
}: {
  title: string;
  value: string;
  subtitle?: string;
  href?: string;
  icon?: LucideIcon;
}) {
  const content = (
    <Card className={cn('ky-pack-card ky-metric h-full')}>
      <div className="flex items-start gap-3 p-4 sm:p-5">
        {Icon ? (
          <span className="ky-metric-icon" aria-hidden>
            <Icon className="size-[1.05rem]" />
          </span>
        ) : null}
        <div className="min-w-0 flex-1">
          <p className="truncate text-xs font-medium text-muted-foreground">{title}</p>
          <p className="ky-metric-value mt-1.5">{value}</p>
          {subtitle ? (
            <p className="mt-1 line-clamp-2 text-xs leading-5 text-muted-foreground/90">
              {subtitle}
            </p>
          ) : null}
        </div>
        {href ? (
          <ChevronLeft
            className="mt-0.5 size-4 shrink-0 text-muted-foreground/50 transition-colors group-hover:text-primary"
            aria-hidden
          />
        ) : null}
      </div>
    </Card>
  );

  if (href) {
    return (
      <Link
        href={href}
        className="ky-metric-link group block rounded-[var(--radius)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
      >
        {content}
      </Link>
    );
  }

  return content;
}
