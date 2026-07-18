import type { IndustryPackId } from '../packs/types';
import type { SpecialtyId } from '../packs/specialties';
import type { PlanCode } from '../billing/types';

export const DEMO_SCENARIO_IDS = [
  'general',
  'clinic',
  'travel',
  'retail',
  'medical-office',
  'hospital',
  'treatment-center',
  'supermarket',
  'pharmacy',
  'contracting',
  'education-center',
  'beauty-salon',
  'restaurant',
  'cafe',
  'bakery',
  'mobile-shop',
  'electronics-store',
  'flower-shop',
  'pet-shop',
  'real-estate',
  'law-office',
  'accounting-office',
  'gym',
  'auto-repair',
  'optician',
  'stationery-store',
  'bookstore',
  'hardware-store',
  'cosmetics-store',
  'tailor-shop',
  'jewelry-store',
  'cleaning-services',
  'marketing-agency',
  'printing-shop',
  'insurance-agency',
  'appliance-repair',
  'photography-studio',
  'daycare-center',
  'computer-service',
  'veterinary-clinic',
] as const;

export type DemoScenarioId = (typeof DEMO_SCENARIO_IDS)[number] | SpecialtyId;

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
