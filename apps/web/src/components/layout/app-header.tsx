import type { ReactNode } from 'react';

import Link from 'next/link';

import { AUTH_NAV } from '@/config/navigation';
import { ConversationNavLink } from '@/components/layout/conversation-nav-link';
import { Button } from '@/components/ui/button';

interface AppHeaderProps {
  title?: string;
  description?: string;
  organizationName: string;
  demoToolbar?: ReactNode;
}

export function AppHeader({
  title,
  description,
  organizationName,
  demoToolbar,
}: AppHeaderProps) {
  return (
    <header className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
      <div>
        {title ? (
          <h1 className="text-xl font-bold">{title}</h1>
        ) : (
          <h1 className="text-xl font-bold">{organizationName}</h1>
        )}
        {description ? (
          <p className="mt-1 text-sm text-muted-foreground">{description}</p>
        ) : null}
      </div>
      <div className="flex flex-wrap items-center gap-2">
        {demoToolbar}
        <ConversationNavLink />
        <Button variant="outline" size="sm" asChild>
          <Link href={AUTH_NAV.workspaceSelect.href}>تغییر فضا</Link>
        </Button>
      </div>
    </header>
  );
}
