import { getWalkthroughForScenario } from '@kesbyar/shared';

import { DemoWalkthroughPanel } from '@/components/demo/demo-walkthrough';
import { canShowDemoControls } from '@/lib/demo';
import { getDemoStatus } from '@/server/demo/demo.service';

export async function DemoDashboardWalkthrough({
  organizationId,
}: {
  organizationId: string;
}) {
  if (!canShowDemoControls()) return null;

  const status = await getDemoStatus(organizationId);
  if (!status?.scenario) return null;

  return (
    <DemoWalkthroughPanel
      scenario={status.scenario}
      steps={getWalkthroughForScenario(status.scenario.id)}
      currentSlug={status.organizationSlug}
    />
  );
}
