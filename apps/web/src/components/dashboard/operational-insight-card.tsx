import { Sparkles } from 'lucide-react';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { getOperationalInsight } from '@/server/intelligence/intelligence.service';

interface OperationalInsightCardProps {
  organizationId: string;
}

export async function OperationalInsightCard({
  organizationId,
}: OperationalInsightCardProps) {
  const insight = await getOperationalInsight(organizationId);

  return (
    <Card>
      <CardHeader className="pb-2">
        <CardTitle className="flex items-center gap-2 text-base">
          <Sparkles className="h-5 w-5 text-primary" />
          خلاصه وضعیت امروز
          {insight.degraded ? (
            <span className="rounded-full bg-amber-100 px-2 py-0.5 text-xs font-normal text-amber-800">
              حالت آفلاین
            </span>
          ) : null}
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        <p className="whitespace-pre-line text-sm leading-relaxed">{insight.summary}</p>
        {insight.highlights.length > 0 ? (
          <ul className="space-y-1 text-xs text-muted-foreground">
            {insight.highlights.map((item) => (
              <li key={item}>• {item}</li>
            ))}
          </ul>
        ) : null}
      </CardContent>
    </Card>
  );
}
