import Link from 'next/link';

import { StatCard } from '@/components/dashboard/stat-card';
import { getPackDashboardWidgets } from '@/server/packs/pack-dashboard.service';

export async function PackDashboardWidgets({
  organizationId,
}: {
  organizationId: string;
}) {
  const widgets = await getPackDashboardWidgets(organizationId);
  if (widgets.length === 0) return null;

  return (
    <div className="space-y-3">
      <h2 className="text-sm font-medium text-muted-foreground">سیگنال‌های عمودی</h2>
      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        {widgets.map((widget) => {
          const card = (
            <StatCard key={widget.key} title={widget.title} value={String(widget.value)} />
          );

          if (widget.href) {
            return (
              <Link key={widget.key} href={widget.href} className="block transition-opacity hover:opacity-90">
                {card}
              </Link>
            );
          }

          return card;
        })}
      </div>
    </div>
  );
}
