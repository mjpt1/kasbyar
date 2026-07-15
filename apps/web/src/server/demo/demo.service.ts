import {
  DEMO_SCENARIO_LIST,
  getScenarioByOrgSlug,
  getWalkthroughForScenario,
  type DemoScenarioId,
} from '@kesbyar/shared';

import { prisma } from '@/lib/prisma';
import { canShowDemoControls } from '@/lib/demo';

export async function getDemoStatus(organizationId: string) {
  const org = await prisma.organization.findUnique({
    where: { id: organizationId },
    select: { slug: true, isDemo: true, name: true, industryPack: true },
  });

  if (!org) return null;

  const scenario = getScenarioByOrgSlug(org.slug);
  const demoControlsEnabled = canShowDemoControls();

  return {
    demoMode: demoControlsEnabled,
    isDemoWorkspace: org.isDemo,
    organizationSlug: org.slug,
    scenario: scenario ?? null,
    walkthrough: scenario ? getWalkthroughForScenario(scenario.id) : [],
  };
}

export async function resolveOrganizationByScenario(scenarioId: DemoScenarioId) {
  const scenario = DEMO_SCENARIO_LIST.find((s) => s.id === scenarioId);
  if (!scenario) return null;

  return prisma.organization.findUnique({
    where: { slug: scenario.orgSlug },
    select: { id: true, name: true, slug: true, isDemo: true },
  });
}

export async function listDemoOrganizations() {
  return prisma.organization.findMany({
    where: { isDemo: true },
    select: { id: true, name: true, slug: true, industryPack: true },
    orderBy: { name: 'asc' },
  });
}
