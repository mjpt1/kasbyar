import type { IndustryPackId } from './types';
import { WAVE4_PACK_IDS } from './types';
import { getPackDefinition } from './registry';

export type Wave4PackId = (typeof WAVE4_PACK_IDS)[number];

export function isWave4Pack(pack: string): pack is Wave4PackId {
  return (WAVE4_PACK_IDS as readonly string[]).includes(pack);
}

export function wave4Slug(pack: Wave4PackId): string {
  return getPackDefinition(pack).homeRoute?.replace(/^\//, '') ?? pack.toLowerCase();
}

export function wave4JobsHref(pack: Wave4PackId): string {
  return `${getPackDefinition(pack).homeRoute}/jobs`;
}

export function wave4ListLabel(pack: Wave4PackId): string {
  const labels: Record<Wave4PackId, string> = {
    LOGISTICS: 'محموله‌ها',
    AUTOMOTIVE: 'پرونده‌ها',
    HOSPITALITY: 'رزروها',
    WHOLESALE: 'سفارش‌ها',
    EVENTS: 'رویدادها',
    AGRICULTURE: 'سفارش‌ها',
    HOME_SERVICES: 'سفارش‌ها',
    DISTRIBUTION: 'مسیرها / سفارش‌ها',
  };
  return labels[pack];
}

export const WAVE4_PACK_PATHS: Record<Wave4PackId, string> = {
  LOGISTICS: '/logistics',
  AUTOMOTIVE: '/automotive',
  HOSPITALITY: '/hospitality',
  WHOLESALE: '/wholesale',
  EVENTS: '/events',
  AGRICULTURE: '/agriculture',
  HOME_SERVICES: '/home-services',
  DISTRIBUTION: '/distribution',
};

export function packFromPathSegment(segment: string): Wave4PackId | null {
  const entry = Object.entries(WAVE4_PACK_PATHS).find(([, path]) => path === `/${segment}`);
  return (entry?.[0] as Wave4PackId | undefined) ?? null;
}

export type { IndustryPackId };
