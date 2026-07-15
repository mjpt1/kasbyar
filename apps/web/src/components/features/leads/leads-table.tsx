'use client';

import type { ColumnDef } from '@tanstack/react-table';
import { formatCurrency, formatJalali } from '@kesbyar/shared';
import Link from 'next/link';

import { LeadStatusBadge } from '@/components/shared/status-badges';
import { DataTable } from '@kesbyar/ui';

export interface LeadRow {
  id: string;
  title: string;
  contactName: string | null;
  contactPhone: string | null;
  status: string;
  stageName: string | null;
  value: number | null;
  nextFollowUpAt: string | null;
  createdAt: string;
}

const columns: ColumnDef<LeadRow>[] = [
  {
    accessorKey: 'title',
    header: 'عنوان',
    cell: ({ row }) => (
      <Link
        href={`/leads/${row.original.id}`}
        className="font-medium text-primary hover:underline"
      >
        {row.original.title}
      </Link>
    ),
  },
  {
    accessorKey: 'contactName',
    header: 'تماس',
    cell: ({ row }) => (
      <div>
        <div>{row.original.contactName ?? '—'}</div>
        {row.original.contactPhone ? (
          <div className="text-xs text-muted-foreground" dir="ltr">
            {row.original.contactPhone}
          </div>
        ) : null}
      </div>
    ),
  },
  {
    accessorKey: 'status',
    header: 'وضعیت',
    cell: ({ row }) => <LeadStatusBadge status={row.original.status} />,
  },
  {
    accessorKey: 'stageName',
    header: 'مرحله',
    cell: ({ row }) => row.original.stageName ?? '—',
  },
  {
    accessorKey: 'value',
    header: 'ارزش',
    cell: ({ row }) =>
      row.original.value ? formatCurrency(row.original.value) : '—',
  },
  {
    accessorKey: 'nextFollowUpAt',
    header: 'پیگیری بعدی',
    cell: ({ row }) =>
      row.original.nextFollowUpAt
        ? formatJalali(row.original.nextFollowUpAt)
        : '—',
  },
  {
    accessorKey: 'createdAt',
    header: 'تاریخ ثبت',
    cell: ({ row }) => formatJalali(row.original.createdAt),
  },
];

export function LeadsTable({ data }: { data: LeadRow[] }) {
  return <DataTable columns={columns} data={data} emptyMessage="لیدی یافت نشد" />;
}
