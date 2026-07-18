'use client';

import {
  type ColumnDef,
  flexRender,
  getCoreRowModel,
  useReactTable,
} from '@tanstack/react-table';

import { cn } from '../lib/utils';

interface DataTableProps<TData> {
  columns: ColumnDef<TData, unknown>[];
  data: TData[];
  emptyMessage?: string;
  className?: string;
}

export function DataTable<TData>({
  columns,
  data,
  emptyMessage = 'داده‌ای یافت نشد',
  className,
}: DataTableProps<TData>) {
  const table = useReactTable({
    data,
    columns,
    getCoreRowModel: getCoreRowModel(),
  });

  if (data.length === 0) {
    return (
      <div className={cn('rounded-md border p-8 text-center text-sm text-muted-foreground', className)}>
        {emptyMessage}
      </div>
    );
  }

  const headerLabels = table.getHeaderGroups()[0]?.headers.map((header) => {
    if (header.isPlaceholder) return '';
    const def = header.column.columnDef.header;
    return typeof def === 'string' ? def : header.column.id;
  }) ?? [];

  return (
    <div className={cn(className)}>
      {/* Mobile: stacked cards */}
      <div className="space-y-3 md:hidden">
        {table.getRowModel().rows.map((row) => (
          <div key={row.id} className="rounded-xl border bg-card p-3 shadow-sm">
            <dl className="space-y-2.5">
              {row.getVisibleCells().map((cell, index) => (
                <div
                  key={cell.id}
                  className="flex items-start justify-between gap-3 border-b border-border/60 pb-2 last:border-0 last:pb-0"
                >
                  <dt className="shrink-0 text-xs text-muted-foreground">
                    {headerLabels[index] || cell.column.id}
                  </dt>
                  <dd className="min-w-0 text-end text-sm">{flexRender(cell.column.columnDef.cell, cell.getContext())}</dd>
                </div>
              ))}
            </dl>
          </div>
        ))}
      </div>

      {/* Desktop / tablet: classic table */}
      <div className="hidden overflow-x-auto rounded-md border md:block">
        <table className="w-full text-sm">
          <thead>
            {table.getHeaderGroups().map((headerGroup) => (
              <tr key={headerGroup.id} className="border-b bg-muted/50">
                {headerGroup.headers.map((header) => (
                  <th key={header.id} className="p-3 text-right font-medium text-foreground">
                    {header.isPlaceholder
                      ? null
                      : flexRender(header.column.columnDef.header, header.getContext())}
                  </th>
                ))}
              </tr>
            ))}
          </thead>
          <tbody>
            {table.getRowModel().rows.map((row) => (
              <tr key={row.id} className="border-b transition-colors hover:bg-muted/30">
                {row.getVisibleCells().map((cell) => (
                  <td key={cell.id} className="p-3 align-middle">
                    {flexRender(cell.column.columnDef.cell, cell.getContext())}
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
