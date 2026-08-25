import type { ReactNode } from 'react';

interface PageHeaderProps {
  title: string;
  description?: string;
  actions?: ReactNode;
}

export function PageHeader({ title, description, actions }: PageHeaderProps) {
  return (
    <div className="mb-4 flex flex-col gap-3 sm:mb-6 sm:flex-row sm:items-start sm:justify-between sm:gap-4">
      <div className="min-w-0 flex-1">
        <div className="flex items-center gap-2.5">
          <span
            className="h-6 w-1 shrink-0 rounded-full bg-gradient-to-b from-primary to-primary/50 shadow-[0_0_0_3px_hsl(var(--primary)/0.12)] sm:h-7"
            aria-hidden
          />
          <h1 className="truncate text-xl font-bold tracking-tight sm:text-2xl">{title}</h1>
        </div>
        {description ? (
          <p className="mt-1.5 text-sm leading-6 text-muted-foreground sm:ps-[calc(0.25rem+0.625rem)]">
            {description}
          </p>
        ) : null}
      </div>
      {actions ? (
        <div className="flex w-full flex-wrap items-center gap-2 sm:w-auto sm:justify-end">
          {actions}
        </div>
      ) : null}
    </div>
  );
}
