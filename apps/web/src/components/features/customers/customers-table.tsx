'use client';

import type { ColumnDef } from '@tanstack/react-table';
import { formatJalali } from '@kesbyar/shared';
import Link from 'next/link';

import { DataTable } from '@kesbyar/ui';

export interface CustomerRow {
  id: string;
  name: string;
  phone: string | null;
  email: string | null;
  city: string | null;
  invoiceCount: number;
  createdAt: string;
}

const columns: ColumnDef<CustomerRow>[] = [
  {
    accessorKey: 'name',
    header: 'نام',
    cell: ({ row }) => (
      <Link
        href={`/customers/${row.original.id}`}
        className="font-medium text-primary hover:underline"
      >
        {row.original.name}
      </Link>
    ),
  },
  { accessorKey: 'phone', header: 'تلفن', cell: ({ row }) => row.original.phone ?? '—' },
  { accessorKey: 'email', header: 'ایمیل', cell: ({ row }) => row.original.email ?? '—' },
  { accessorKey: 'city', header: 'شهر', cell: ({ row }) => row.original.city ?? '—' },
  {
    accessorKey: 'invoiceCount',
    header: 'فاکتورها',
    cell: ({ row }) => row.original.invoiceCount,
  },
  {
    accessorKey: 'createdAt',
    header: 'تاریخ ثبت',
    cell: ({ row }) => formatJalali(row.original.createdAt),
  },
];

export function CustomersTable({ data }: { data: CustomerRow[] }) {
  return <DataTable columns={columns} data={data} emptyMessage="هنوز مشتری ثبت نشده" />;
}
