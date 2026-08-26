import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { PackBarChart } from '@/components/dashboard/pack-bar-chart';
import { PackPieChart } from '@/components/dashboard/pack-pie-chart';
import { getPackDashboardCharts } from '@/server/packs/pack-dashboard-charts.service';

export async function PackDashboardCharts({
  organizationId,
  packId,
  specialtyId,
}: {
  organizationId: string;
  packId: string;
  specialtyId?: string | null;
}) {
  const charts = await getPackDashboardCharts(organizationId, packId, specialtyId);
  if (charts.length === 0) return null;

  return (
    <div className="grid gap-4 lg:grid-cols-2">
      {charts.map(({ def, points }) => (
        <Card key={def.key} className="ky-pack-card">
          <CardHeader className="pb-2">
            <CardTitle className="text-base">{def.titleFa}</CardTitle>
            {def.subtitleFa ? (
              <p className="text-sm text-muted-foreground">{def.subtitleFa}</p>
            ) : null}
          </CardHeader>
          <CardContent>
            {def.kind === 'pie' ? (
              <PackPieChart data={points} valueLabel={def.valueLabel} />
            ) : (
              <PackBarChart
                data={points}
                valueLabel={def.valueLabel}
                format={def.format}
              />
            )}
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
