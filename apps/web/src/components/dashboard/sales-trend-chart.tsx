'use client';

import { formatCurrency } from '@kesbyar/shared';
import {
  Bar,
  BarChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts';

interface SalesTrendChartProps {
  data: { label: string; amount: number }[];
}

export function SalesTrendChart({ data }: SalesTrendChartProps) {
  return (
    <div className="h-72 w-full" dir="ltr">
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={data} margin={{ top: 8, right: 8, left: 0, bottom: 0 }}>
          <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
          <XAxis dataKey="label" tick={{ fontSize: 11 }} interval={0} angle={-20} textAnchor="end" height={50} />
          <YAxis tick={{ fontSize: 11 }} tickFormatter={(v) => `${Math.round(v / 1_000_000)}M`} />
          <Tooltip
            formatter={(value: number) => [formatCurrency(value), 'فروش']}
            labelStyle={{ direction: 'rtl', textAlign: 'right' }}
            contentStyle={{ direction: 'rtl' }}
          />
          <Bar dataKey="amount" fill="hsl(221 83% 53%)" radius={[4, 4, 0, 0]} />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}
