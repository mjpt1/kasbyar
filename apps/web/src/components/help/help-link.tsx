import Link from 'next/link';
import { BookOpen } from 'lucide-react';

import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

type HelpLinkProps = {
  section: string;
  className?: string;
  label?: string;
};

/** Small deep-link to /help#section — use in PageHeader actions */
export function HelpLink({ section, className, label = 'راهنما' }: HelpLinkProps) {
  return (
    <Button asChild variant="ghost" size="sm" className={cn('gap-1.5 text-muted-foreground', className)}>
      <Link href={`/help#${section}`} aria-label={`${label}: ${section}`}>
        <BookOpen className="size-3.5" aria-hidden />
        {label}
      </Link>
    </Button>
  );
}
