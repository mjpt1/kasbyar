'use client';

import { Cell, Pie, PieChart, ResponsiveContainer, Tooltip } from 'recharts';

import type { PackChartPoint } from '@kesbyar/shared';

const SLICE_COLORS = [
  'hsl(var(--primary))',
  'hsl(200 38% 58%)',
  'hsl(160 45% 45%)',
  'hsl(38 80% 55%)',
  'hsl(280 35% 55%)',
];

interface PackPieChartProps {
  data: PackChartPoint[];
  valueLabel?: string;
}

export function PackPieChart({ data, valueLabel = 'مورد' }: PackPieChartProps) {
  if (data.length === 0) {
    return (
      <p className="py-8 text-center text-sm text-muted-foreground">داده‌ای برای نمودار نیست.</p>
    );
  }

  const chartData = data.map((d) => ({ name: d.label, value: d.value }));

  return (
    <div className="h-56 w-full sm:h-64" dir="ltr">
      <ResponsiveContainer width="100%" height="100%">
        <PieChart>
          <Pie
            data={chartData}
            dataKey="value"
            nameKey="name"
            cx="50%"
            cy="50%"
            innerRadius={48}
            outerRadius={80}
            paddingAngle={2}
          >
            {chartData.map((_, index) => (
              <Cell key={index} fill={SLICE_COLORS[index % SLICE_COLORS.length]} />
            ))}
          </Pie>
          <Tooltip
            formatter={(value: number) => [value, valueLabel]}
            labelStyle={{ direction: 'rtl', textAlign: 'right' }}
            contentStyle={{ direction: 'rtl' }}
          />
        </PieChart>
      </ResponsiveContainer>
      <div className="mt-2 flex flex-wrap justify-center gap-x-4 gap-y-1" dir="rtl">
        {chartData.map((item, index) => (
          <div key={item.name} className="flex items-center gap-1.5 text-xs text-muted-foreground">
            <span
              className="inline-block h-2.5 w-2.5 rounded-full"
              style={{ backgroundColor: SLICE_COLORS[index % SLICE_COLORS.length] }}
            />
            {item.name}
          </div>
        ))}
      </div>
    </div>
  );
}
