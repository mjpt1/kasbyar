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
    <div className="h-56 w-full sm:h-72" dir="ltr">
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={data} margin={{ top: 8, right: 4, left: -8, bottom: 0 }}>
          <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
          <XAxis
            dataKey="label"
            tick={{ fontSize: 10 }}
            interval="preserveStartEnd"
            angle={-15}
            textAnchor="end"
            height={44}
          />
          <YAxis
            width={36}
            tick={{ fontSize: 10 }}
            tickFormatter={(v) => `${Math.round(v / 1_000_000)}M`}
          />
          <Tooltip
            formatter={(value: number) => [formatCurrency(value), 'فروش']}
            labelStyle={{ direction: 'rtl', textAlign: 'right' }}
            contentStyle={{ direction: 'rtl' }}
          />
          <Bar dataKey="amount" fill="hsl(200 38% 58%)" radius={[4, 4, 0, 0]} />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}
