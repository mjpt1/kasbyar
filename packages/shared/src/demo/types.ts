import type { IndustryPackId } from '../packs/types';
import type { PlanCode } from '../billing/types';

export type DemoScenarioId = 'general' | 'clinic' | 'travel' | 'retail';

export interface DemoShowcaseLink {
  label: string;
  href: string;
  description?: string;
}

export interface DemoWalkthroughStep {
  id: string;
  title: string;
  description: string;
  href: string;
  tip?: string;
}

export interface DemoScenario {
  id: DemoScenarioId;
  orgSlug: string;
  title: string;
  subtitle: string;
  industryPack: IndustryPackId;
  planCode: PlanCode;
  planLabel: string;
  personaTitle: string;
  valueProposition: string;
  highlights: string[];
  salesWalkthroughOrder: number;
  investorWalkthroughOrder: number;
  firstStopHref: string;
  showcaseLinks: DemoShowcaseLink[];
}

export interface DemoPersona {
  id: string;
  email: string;
  name: string;
  title: string;
  description: string;
  recommendedScenarios: DemoScenarioId[];
}
