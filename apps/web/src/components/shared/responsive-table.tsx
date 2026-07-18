import type { ReactNode } from 'react';

import { cn } from '@/lib/utils';

export interface ResponsiveTableColumn {
  key: string;
  header: string;
  className?: string;
  /** Hide this field on mobile cards (still shown in desktop table) */
  hideOnMobile?: boolean;
}

export interface ResponsiveTableRow {
  id: string;
  cells: Record<string, ReactNode>;
}

interface ResponsiveTableProps {
  columns: ResponsiveTableColumn[];
  rows: ResponsiveTableRow[];
  className?: string;
}

/** Desktop table + mobile stacked cards for hand-rolled list pages. */
export function ResponsiveTable({ columns, rows, className }: ResponsiveTableProps) {
  const mobileColumns = columns.filter((c) => !c.hideOnMobile);

  return (
    <div className={cn(className)}>
      <div className="space-y-3 md:hidden">
        {rows.map((row) => (
          <div key={row.id} className="rounded-xl border bg-card p-3 shadow-sm">
            <dl className="space-y-2.5">
              {mobileColumns.map((col) => (
                <div
                  key={col.key}
                  className="flex items-start justify-between gap-3 border-b border-border/60 pb-2 last:border-0 last:pb-0"
                >
                  <dt className="shrink-0 text-xs text-muted-foreground">{col.header}</dt>
                  <dd className={cn('min-w-0 text-end text-sm', col.className)}>{row.cells[col.key]}</dd>
                </div>
              ))}
            </dl>
          </div>
        ))}
      </div>

      <div className="hidden overflow-x-auto md:block">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b bg-muted/50">
              {columns.map((col) => (
                <th key={col.key} className="p-3 text-right font-medium">
                  {col.header}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {rows.map((row) => (
              <tr key={row.id} className="border-b hover:bg-muted/30">
                {columns.map((col) => (
                  <td key={col.key} className={cn('p-3 align-middle', col.className)}>
                    {row.cells[col.key]}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
