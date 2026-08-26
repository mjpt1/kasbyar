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

import type { PackChartPoint } from '@kesbyar/shared';

interface PackBarChartProps {
  data: PackChartPoint[];
  valueLabel?: string;
  format?: 'number' | 'currency';
}

export function PackBarChart({ data, valueLabel = 'مقدار', format = 'number' }: PackBarChartProps) {
  if (data.length === 0) {
    return (
      <p className="py-8 text-center text-sm text-muted-foreground">داده‌ای برای نمودار نیست.</p>
    );
  }

  const chartData = data.map((d) => ({ label: d.label, value: d.value }));

  return (
    <div className="h-56 w-full sm:h-64" dir="ltr">
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={chartData} margin={{ top: 8, right: 4, left: -8, bottom: 0 }}>
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
            width={40}
            tick={{ fontSize: 10 }}
            tickFormatter={(v) =>
              format === 'currency' ? `${Math.round(v / 1_000_000)}M` : String(v)
            }
          />
          <Tooltip
            formatter={(value: number) => [
              format === 'currency' ? formatCurrency(value) : value,
              valueLabel,
            ]}
            labelStyle={{ direction: 'rtl', textAlign: 'right' }}
            contentStyle={{ direction: 'rtl' }}
          />
          <Bar dataKey="value" fill="hsl(var(--primary))" radius={[4, 4, 0, 0]} />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}
