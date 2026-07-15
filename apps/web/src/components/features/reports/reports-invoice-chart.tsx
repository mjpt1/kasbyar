'use client';

import {
  Bar,
  BarChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts';

import { formatCurrency } from '@kesbyar/shared';

interface ReportsChartProps {
  data: { status: string; label: string; count: number; total: number }[];
}

export function ReportsInvoiceChart({ data }: ReportsChartProps) {
  if (data.length === 0) {
    return (
      <p className="py-8 text-center text-sm text-muted-foreground">داده‌ای برای نمودار نیست.</p>
    );
  }

  return (
    <div className="h-64 w-full" dir="ltr">
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={data} margin={{ top: 8, right: 8, left: 8, bottom: 8 }}>
          <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
          <XAxis dataKey="label" tick={{ fontSize: 11 }} />
          <YAxis tick={{ fontSize: 11 }} />
          <Tooltip
            formatter={(value: number, name: string) =>
              name === 'total' ? formatCurrency(value) : value
            }
            labelFormatter={(label) => `وضعیت: ${label}`}
          />
          <Bar dataKey="count" name="تعداد" fill="hsl(var(--primary))" radius={[4, 4, 0, 0]} />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}
