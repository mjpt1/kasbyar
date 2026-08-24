import type { IndustryPackId } from './types';
import { PACK_REGISTRY } from './registry';

/**
 * Visual theme family — pack base + specialty overrides for occupation-aligned colors
 * (e.g. hospital blue/red, aesthetic clinic pink).
 */
export type PackThemeId =
  | 'general'
  | 'clinic'
  | 'hospital'
  | 'dental'
  | 'beauty'
  | 'spa'
  | 'barber'
  | 'pharmacy'
  | 'florist'
  | 'cosmetics'
  | 'jewelry'
  | 'cafe'
  | 'bakery'
  | 'retail'
  | 'food'
  | 'real_estate'
  | 'legal'
  | 'agency'
  | 'schedule'
  | 'sales'
  | 'field'
  | 'travel';

/** Dashboard / panel composition personality */
export type PackLayoutModel =
  | 'balanced'
  | 'calendar_forward'
  | 'soft_gallery'
  | 'dense_kpi'
  | 'order_board'
  | 'pipeline'
  | 'matter_list'
  | 'schedule_grid'
  | 'job_board'
  | 'booking_flow';

export type PackDensity = 'compact' | 'comfortable' | 'airy';

/** HSL channels without `hsl()` — matches apps/web CSS variables */
export interface PackThemeHsl {
  primary: string;
  primaryForeground: string;
  secondary: string;
  secondaryForeground: string;
  accent: string;
  accentForeground: string;
  muted: string;
  mutedForeground: string;
  ring: string;
  border: string;
  sidebar: string;
  sidebarForeground: string;
  panelSoft: string;
}

export interface PackThemeMobile {
  primary: string;
  primaryDark: string;
  accent: string;
  surface: string;
  surfaceAlt: string;
}

export interface PackThemeDefinition {
  id: PackThemeId;
  /** Short Persian label for docs / QA */
  labelFa: string;
  /** Color vibe (Persian) for changelog / verify docs */
  vibeFa: string;
  layout: PackLayoutModel;
  density: PackDensity;
  /** CSS length for --radius */
  radius: string;
  hsl: PackThemeHsl;
  /** Soft body glow stops (rgba) */
  glow: { a: string; b: string; c: string };
  mobile: PackThemeMobile;
}

const THEMES: Record<PackThemeId, PackThemeDefinition> = {
  general: {
    id: 'general',
    labelFa: 'عمومی',
    vibeFa: 'آسمان ملایم / نعنایی / هلویی (هویت پیش‌فرض کسب‌یار)',
    layout: 'balanced',
    density: 'comfortable',
    radius: '0.9rem',
    hsl: {
      primary: '200 38% 58%',
      primaryForeground: '0 0% 100%',
      secondary: '150 28% 92%',
      secondaryForeground: '225 16% 29%',
      accent: '5 70% 94%',
      accentForeground: '5 35% 38%',
      muted: '210 35% 95%',
      mutedForeground: '225 12% 45%',
      ring: '200 38% 58%',
      border: '210 25% 88%',
      sidebar: '0 0% 100%',
      sidebarForeground: '225 16% 29%',
      panelSoft: '200 40% 96%',
    },
    glow: {
      a: 'rgba(245, 198, 194, 0.28)',
      b: 'rgba(168, 201, 184, 0.22)',
      c: 'rgba(185, 212, 240, 0.18)',
    },
    mobile: {
      primary: '#5BA3C4',
      primaryDark: '#3D7FA0',
      accent: '#F5C6C2',
      surface: '#1e293b',
      surfaceAlt: '#334155',
    },
  },

  clinic: {
    id: 'clinic',
    labelFa: 'کلینیک',
    vibeFa: 'فیروزه‌ای بالینی / سفید سرد',
    layout: 'calendar_forward',
    density: 'comfortable',
    radius: '0.55rem',
    hsl: {
      primary: '186 42% 38%',
      primaryForeground: '0 0% 100%',
      secondary: '186 28% 92%',
      secondaryForeground: '200 25% 22%',
      accent: '195 45% 94%',
      accentForeground: '195 40% 28%',
      muted: '195 30% 95%',
      mutedForeground: '200 12% 40%',
      ring: '186 42% 38%',
      border: '195 22% 84%',
      sidebar: '195 35% 97%',
      sidebarForeground: '200 25% 22%',
      panelSoft: '186 35% 94%',
    },
    glow: {
      a: 'rgba(140, 200, 210, 0.32)',
      b: 'rgba(180, 210, 220, 0.2)',
      c: 'rgba(210, 230, 235, 0.25)',
    },
    mobile: {
      primary: '#2A8A96',
      primaryDark: '#1F6B74',
      accent: '#B8DCE2',
      surface: '#0f1c22',
      surfaceAlt: '#1a2e36',
    },
  },

  hospital: {
    id: 'hospital',
    labelFa: 'بیمارستان',
    vibeFa: 'آبی بیمارستانی / اکسنت قرمز اورژانس',
    layout: 'calendar_forward',
    density: 'compact',
    radius: '0.5rem',
    hsl: {
      primary: '214 72% 42%',
      primaryForeground: '0 0% 100%',
      secondary: '214 35% 93%',
      secondaryForeground: '214 45% 22%',
      accent: '0 72% 94%',
      accentForeground: '0 55% 38%',
      muted: '214 28% 95%',
      mutedForeground: '214 14% 40%',
      ring: '214 72% 42%',
      border: '214 22% 84%',
      sidebar: '214 40% 97%',
      sidebarForeground: '214 45% 22%',
      panelSoft: '214 45% 95%',
    },
    glow: {
      a: 'rgba(120, 160, 210, 0.32)',
      b: 'rgba(230, 150, 150, 0.18)',
      c: 'rgba(200, 220, 240, 0.22)',
    },
    mobile: {
      primary: '#1E5FA8',
      primaryDark: '#164A85',
      accent: '#E8A0A0',
      surface: '#0d1624',
      surfaceAlt: '#1a2740',
    },
  },

  dental: {
    id: 'dental',
    labelFa: 'دندانپزشکی',
    vibeFa: 'آبی روشن کلینیکی / سفید تمیز',
    layout: 'calendar_forward',
    density: 'comfortable',
    radius: '0.65rem',
    hsl: {
      primary: '199 78% 42%',
      primaryForeground: '0 0% 100%',
      secondary: '199 40% 94%',
      secondaryForeground: '199 35% 24%',
      accent: '180 30% 94%',
      accentForeground: '180 25% 30%',
      muted: '200 30% 96%',
      mutedForeground: '200 12% 42%',
      ring: '199 78% 42%',
      border: '199 22% 86%',
      sidebar: '199 45% 98%',
      sidebarForeground: '199 35% 24%',
      panelSoft: '199 50% 96%',
    },
    glow: {
      a: 'rgba(140, 200, 230, 0.3)',
      b: 'rgba(200, 230, 240, 0.22)',
      c: 'rgba(230, 240, 245, 0.2)',
    },
    mobile: {
      primary: '#1890C0',
      primaryDark: '#126E94',
      accent: '#B8E0EC',
      surface: '#0e1a22',
      surfaceAlt: '#1a2e3a',
    },
  },

  beauty: {
    id: 'beauty',
    labelFa: 'زیبایی',
    vibeFa: 'صورتی رز / کرم گرم — سالن و کلینیک زیبایی',
    layout: 'soft_gallery',
    density: 'airy',
    radius: '1.25rem',
    hsl: {
      primary: '330 58% 58%',
      primaryForeground: '0 0% 100%',
      secondary: '330 45% 95%',
      secondaryForeground: '330 30% 30%',
      accent: '15 55% 94%',
      accentForeground: '15 35% 38%',
      muted: '330 35% 96%',
      mutedForeground: '330 14% 42%',
      ring: '330 58% 58%',
      border: '330 25% 88%',
      sidebar: '330 50% 98%',
      sidebarForeground: '330 30% 30%',
      panelSoft: '330 45% 96%',
    },
    glow: {
      a: 'rgba(245, 160, 190, 0.38)',
      b: 'rgba(250, 210, 220, 0.3)',
      c: 'rgba(255, 230, 235, 0.24)',
    },
    mobile: {
      primary: '#D45A8C',
      primaryDark: '#B04070',
      accent: '#F8D0E0',
      surface: '#1f1418',
      surfaceAlt: '#332028',
    },
  },

  spa: {
    id: 'spa',
    labelFa: 'اسپا',
    vibeFa: 'سبز مریم‌گلی / آرامش طبیعی',
    layout: 'soft_gallery',
    density: 'airy',
    radius: '1.35rem',
    hsl: {
      primary: '152 28% 38%',
      primaryForeground: '0 0% 100%',
      secondary: '152 30% 93%',
      secondaryForeground: '152 25% 22%',
      accent: '40 35% 93%',
      accentForeground: '40 30% 32%',
      muted: '150 22% 95%',
      mutedForeground: '150 10% 40%',
      ring: '152 28% 38%',
      border: '152 18% 84%',
      sidebar: '152 28% 97%',
      sidebarForeground: '152 25% 22%',
      panelSoft: '152 30% 95%',
    },
    glow: {
      a: 'rgba(160, 200, 175, 0.3)',
      b: 'rgba(220, 210, 180, 0.22)',
      c: 'rgba(200, 220, 205, 0.2)',
    },
    mobile: {
      primary: '#458A68',
      primaryDark: '#346B50',
      accent: '#D4C9A8',
      surface: '#121a16',
      surfaceAlt: '#243028',
    },
  },

  barber: {
    id: 'barber',
    labelFa: 'آرایشگاه مردانه',
    vibeFa: 'زغال / نیلی کلاسیک',
    layout: 'soft_gallery',
    density: 'comfortable',
    radius: '0.55rem',
    hsl: {
      primary: '220 28% 28%',
      primaryForeground: '0 0% 98%',
      secondary: '220 18% 92%',
      secondaryForeground: '220 25% 22%',
      accent: '0 55% 92%',
      accentForeground: '0 45% 35%',
      muted: '220 15% 94%',
      mutedForeground: '220 10% 40%',
      ring: '220 28% 28%',
      border: '220 14% 82%',
      sidebar: '220 20% 96%',
      sidebarForeground: '220 25% 22%',
      panelSoft: '220 18% 94%',
    },
    glow: {
      a: 'rgba(80, 100, 130, 0.28)',
      b: 'rgba(200, 140, 140, 0.15)',
      c: 'rgba(180, 190, 210, 0.18)',
    },
    mobile: {
      primary: '#334155',
      primaryDark: '#1E293B',
      accent: '#E8B4B4',
      surface: '#0f1218',
      surfaceAlt: '#1e2430',
    },
  },

  pharmacy: {
    id: 'pharmacy',
    labelFa: 'داروخانه',
    vibeFa: 'سبز داروخانه / صلیب پزشکی',
    layout: 'dense_kpi',
    density: 'compact',
    radius: '0.5rem',
    hsl: {
      primary: '152 55% 32%',
      primaryForeground: '0 0% 100%',
      secondary: '152 35% 92%',
      secondaryForeground: '152 40% 20%',
      accent: '0 65% 94%',
      accentForeground: '0 50% 36%',
      muted: '150 25% 95%',
      mutedForeground: '150 12% 38%',
      ring: '152 55% 32%',
      border: '152 20% 82%',
      sidebar: '152 30% 97%',
      sidebarForeground: '152 40% 20%',
      panelSoft: '152 35% 94%',
    },
    glow: {
      a: 'rgba(100, 180, 130, 0.3)',
      b: 'rgba(220, 150, 150, 0.15)',
      c: 'rgba(180, 210, 190, 0.2)',
    },
    mobile: {
      primary: '#248A55',
      primaryDark: '#1A6B41',
      accent: '#E8B0B0',
      surface: '#0e1a14',
      surfaceAlt: '#1a2e24',
    },
  },

  florist: {
    id: 'florist',
    labelFa: 'گل‌فروشی',
    vibeFa: 'سبز برگ / صورتی گلبرگ',
    layout: 'soft_gallery',
    density: 'airy',
    radius: '1.1rem',
    hsl: {
      primary: '140 40% 36%',
      primaryForeground: '0 0% 100%',
      secondary: '140 35% 93%',
      secondaryForeground: '140 30% 22%',
      accent: '340 55% 94%',
      accentForeground: '340 40% 38%',
      muted: '100 25% 95%',
      mutedForeground: '140 12% 40%',
      ring: '140 40% 36%',
      border: '140 20% 84%',
      sidebar: '100 30% 97%',
      sidebarForeground: '140 30% 22%',
      panelSoft: '100 35% 95%',
    },
    glow: {
      a: 'rgba(140, 190, 140, 0.3)',
      b: 'rgba(240, 180, 200, 0.25)',
      c: 'rgba(210, 230, 200, 0.2)',
    },
    mobile: {
      primary: '#3A8F4A',
      primaryDark: '#2B6E38',
      accent: '#F0C0D0',
      surface: '#121a12',
      surfaceAlt: '#243024',
    },
  },

  cosmetics: {
    id: 'cosmetics',
    labelFa: 'لوازم آرایشی',
    vibeFa: 'سرخابی براق / فروشگاهی',
    layout: 'dense_kpi',
    density: 'comfortable',
    radius: '0.85rem',
    hsl: {
      primary: '320 55% 48%',
      primaryForeground: '0 0% 100%',
      secondary: '320 40% 94%',
      secondaryForeground: '320 30% 28%',
      accent: '280 35% 94%',
      accentForeground: '280 30% 35%',
      muted: '320 28% 96%',
      mutedForeground: '320 12% 42%',
      ring: '320 55% 48%',
      border: '320 22% 86%',
      sidebar: '320 40% 98%',
      sidebarForeground: '320 30% 28%',
      panelSoft: '320 40% 96%',
    },
    glow: {
      a: 'rgba(210, 120, 180, 0.32)',
      b: 'rgba(200, 170, 220, 0.22)',
      c: 'rgba(240, 210, 230, 0.2)',
    },
    mobile: {
      primary: '#B83D8E',
      primaryDark: '#8F2E6E',
      accent: '#E8C8E0',
      surface: '#1a1018',
      surfaceAlt: '#2e1e2a',
    },
  },

  jewelry: {
    id: 'jewelry',
    labelFa: 'طلا و جواهر',
    vibeFa: 'طلایی عمیق / مشکی لوکس',
    layout: 'dense_kpi',
    density: 'comfortable',
    radius: '0.6rem',
    hsl: {
      primary: '42 70% 42%',
      primaryForeground: '0 0% 100%',
      secondary: '42 35% 92%',
      secondaryForeground: '40 40% 20%',
      accent: '40 20% 18%',
      accentForeground: '42 40% 90%',
      muted: '40 20% 94%',
      mutedForeground: '40 12% 38%',
      ring: '42 70% 42%',
      border: '42 25% 80%',
      sidebar: '40 25% 96%',
      sidebarForeground: '40 40% 20%',
      panelSoft: '42 40% 94%',
    },
    glow: {
      a: 'rgba(210, 170, 80, 0.35)',
      b: 'rgba(80, 70, 50, 0.15)',
      c: 'rgba(230, 210, 150, 0.2)',
    },
    mobile: {
      primary: '#B8860B',
      primaryDark: '#8B6508',
      accent: '#2A2418',
      surface: '#14110c',
      surfaceAlt: '#2a2418',
    },
  },

  cafe: {
    id: 'cafe',
    labelFa: 'کافه',
    vibeFa: 'قهوه‌ای گرم / کرم شیر',
    layout: 'order_board',
    density: 'comfortable',
    radius: '0.9rem',
    hsl: {
      primary: '25 45% 32%',
      primaryForeground: '40 40% 96%',
      secondary: '35 40% 92%',
      secondaryForeground: '25 35% 22%',
      accent: '18 55% 90%',
      accentForeground: '18 40% 30%',
      muted: '30 25% 94%',
      mutedForeground: '25 12% 40%',
      ring: '25 45% 32%',
      border: '30 20% 84%',
      sidebar: '35 30% 96%',
      sidebarForeground: '25 35% 22%',
      panelSoft: '35 35% 94%',
    },
    glow: {
      a: 'rgba(160, 110, 70, 0.3)',
      b: 'rgba(220, 190, 150, 0.25)',
      c: 'rgba(200, 170, 140, 0.18)',
    },
    mobile: {
      primary: '#6B4423',
      primaryDark: '#4A2F18',
      accent: '#E8C9A8',
      surface: '#1a120c',
      surfaceAlt: '#2e2018',
    },
  },

  bakery: {
    id: 'bakery',
    labelFa: 'نانوایی',
    vibeFa: 'گندمی گرم / کره و عسل',
    layout: 'order_board',
    density: 'comfortable',
    radius: '0.85rem',
    hsl: {
      primary: '32 70% 45%',
      primaryForeground: '0 0% 100%',
      secondary: '40 50% 92%',
      secondaryForeground: '32 40% 22%',
      accent: '20 60% 92%',
      accentForeground: '20 40% 32%',
      muted: '38 35% 95%',
      mutedForeground: '32 12% 40%',
      ring: '32 70% 45%',
      border: '36 28% 84%',
      sidebar: '40 40% 97%',
      sidebarForeground: '32 40% 22%',
      panelSoft: '38 45% 95%',
    },
    glow: {
      a: 'rgba(220, 160, 80, 0.32)',
      b: 'rgba(240, 200, 140, 0.25)',
      c: 'rgba(230, 190, 150, 0.2)',
    },
    mobile: {
      primary: '#C47A1A',
      primaryDark: '#9A5E12',
      accent: '#F0D4A8',
      surface: '#1a140c',
      surfaceAlt: '#2e2418',
    },
  },

  retail: {
    id: 'retail',
    labelFa: 'خرده‌فروشی',
    vibeFa: 'کهربایی متراکم / گوشه تیزتر',
    layout: 'dense_kpi',
    density: 'compact',
    radius: '0.45rem',
    hsl: {
      primary: '28 72% 48%',
      primaryForeground: '0 0% 100%',
      secondary: '40 45% 92%',
      secondaryForeground: '28 40% 22%',
      accent: '45 70% 92%',
      accentForeground: '35 45% 30%',
      muted: '40 30% 95%',
      mutedForeground: '28 12% 40%',
      ring: '28 72% 48%',
      border: '35 22% 84%',
      sidebar: '40 40% 97%',
      sidebarForeground: '28 40% 22%',
      panelSoft: '40 50% 94%',
    },
    glow: {
      a: 'rgba(230, 170, 100, 0.28)',
      b: 'rgba(245, 210, 150, 0.22)',
      c: 'rgba(220, 200, 170, 0.18)',
    },
    mobile: {
      primary: '#D4832A',
      primaryDark: '#A8641C',
      accent: '#F5DFB8',
      surface: '#1a1610',
      surfaceAlt: '#2e261c',
    },
  },

  food: {
    id: 'food',
    labelFa: 'رستوران',
    vibeFa: 'سفالی گرم / زیتونی آشپزخانه',
    layout: 'order_board',
    density: 'comfortable',
    radius: '0.7rem',
    hsl: {
      primary: '12 55% 45%',
      primaryForeground: '0 0% 100%',
      secondary: '85 25% 90%',
      secondaryForeground: '90 30% 22%',
      accent: '85 35% 92%',
      accentForeground: '90 35% 28%',
      muted: '30 25% 95%',
      mutedForeground: '20 12% 40%',
      ring: '12 55% 45%',
      border: '25 20% 84%',
      sidebar: '25 30% 97%',
      sidebarForeground: '20 30% 22%',
      panelSoft: '20 40% 95%',
    },
    glow: {
      a: 'rgba(210, 130, 100, 0.3)',
      b: 'rgba(180, 190, 140, 0.22)',
      c: 'rgba(230, 200, 170, 0.2)',
    },
    mobile: {
      primary: '#B3533A',
      primaryDark: '#8A3E2A',
      accent: '#D4C89A',
      surface: '#1a1410',
      surfaceAlt: '#2c221c',
    },
  },

  real_estate: {
    id: 'real_estate',
    labelFa: 'املاک',
    vibeFa: 'سربی ساختمانی / آبی عمیق',
    layout: 'pipeline',
    density: 'comfortable',
    radius: '0.5rem',
    hsl: {
      primary: '215 35% 40%',
      primaryForeground: '0 0% 100%',
      secondary: '210 25% 92%',
      secondaryForeground: '215 30% 22%',
      accent: '200 30% 93%',
      accentForeground: '215 30% 28%',
      muted: '210 20% 95%',
      mutedForeground: '215 10% 42%',
      ring: '215 35% 40%',
      border: '210 18% 84%',
      sidebar: '210 22% 96%',
      sidebarForeground: '215 30% 22%',
      panelSoft: '210 28% 94%',
    },
    glow: {
      a: 'rgba(140, 165, 195, 0.3)',
      b: 'rgba(170, 185, 200, 0.2)',
      c: 'rgba(200, 210, 220, 0.18)',
    },
    mobile: {
      primary: '#42618A',
      primaryDark: '#314866',
      accent: '#B8C8D8',
      surface: '#10151c',
      surfaceAlt: '#1c2530',
    },
  },

  legal: {
    id: 'legal',
    labelFa: 'حقوقی',
    vibeFa: 'جوهر سرمه‌ای / رسمی متراکم',
    layout: 'matter_list',
    density: 'compact',
    radius: '0.4rem',
    hsl: {
      primary: '230 35% 38%',
      primaryForeground: '0 0% 100%',
      secondary: '230 18% 92%',
      secondaryForeground: '230 30% 22%',
      accent: '40 35% 93%',
      accentForeground: '40 30% 30%',
      muted: '230 15% 95%',
      mutedForeground: '230 10% 42%',
      ring: '230 35% 38%',
      border: '230 14% 84%',
      sidebar: '230 18% 96%',
      sidebarForeground: '230 30% 22%',
      panelSoft: '230 20% 94%',
    },
    glow: {
      a: 'rgba(150, 155, 190, 0.28)',
      b: 'rgba(220, 210, 180, 0.18)',
      c: 'rgba(180, 185, 210, 0.16)',
    },
    mobile: {
      primary: '#3F4578',
      primaryDark: '#2E3358',
      accent: '#E8DFC8',
      surface: '#12131c',
      surfaceAlt: '#1e2030',
    },
  },

  agency: {
    id: 'agency',
    labelFa: 'آژانس / دفتر',
    vibeFa: 'بنفش-آبی حرفه‌ای / کارت‌های منظم',
    layout: 'matter_list',
    density: 'comfortable',
    radius: '0.65rem',
    hsl: {
      primary: '250 30% 48%',
      primaryForeground: '0 0% 100%',
      secondary: '250 25% 94%',
      secondaryForeground: '250 28% 28%',
      accent: '175 30% 92%',
      accentForeground: '175 35% 28%',
      muted: '250 20% 96%',
      mutedForeground: '250 10% 42%',
      ring: '250 30% 48%',
      border: '250 16% 86%',
      sidebar: '250 22% 97%',
      sidebarForeground: '250 28% 28%',
      panelSoft: '250 28% 95%',
    },
    glow: {
      a: 'rgba(180, 170, 220, 0.28)',
      b: 'rgba(160, 200, 190, 0.2)',
      c: 'rgba(200, 195, 230, 0.16)',
    },
    mobile: {
      primary: '#6B5FA0',
      primaryDark: '#4F4680',
      accent: '#B8D9D2',
      surface: '#14121c',
      surfaceAlt: '#242030',
    },
  },

  schedule: {
    id: 'schedule',
    labelFa: 'برنامه زمانی',
    vibeFa: 'سبز انرژی / تقویم‌محور',
    layout: 'schedule_grid',
    density: 'comfortable',
    radius: '0.75rem',
    hsl: {
      primary: '152 40% 36%',
      primaryForeground: '0 0% 100%',
      secondary: '152 30% 92%',
      secondaryForeground: '152 35% 22%',
      accent: '85 40% 92%',
      accentForeground: '90 35% 28%',
      muted: '150 25% 95%',
      mutedForeground: '152 12% 40%',
      ring: '152 40% 36%',
      border: '150 20% 84%',
      sidebar: '150 30% 97%',
      sidebarForeground: '152 35% 22%',
      panelSoft: '152 35% 94%',
    },
    glow: {
      a: 'rgba(140, 200, 160, 0.3)',
      b: 'rgba(200, 220, 150, 0.2)',
      c: 'rgba(170, 210, 190, 0.18)',
    },
    mobile: {
      primary: '#2D8A5E',
      primaryDark: '#216B48',
      accent: '#C8E0A8',
      surface: '#0f1a14',
      surfaceAlt: '#1c2e24',
    },
  },

  sales: {
    id: 'sales',
    labelFa: 'فروش / بیمه / خودرو',
    vibeFa: 'آبی فولادی / قیف فروش',
    layout: 'pipeline',
    density: 'comfortable',
    radius: '0.55rem',
    hsl: {
      primary: '205 55% 42%',
      primaryForeground: '0 0% 100%',
      secondary: '205 30% 92%',
      secondaryForeground: '205 35% 22%',
      accent: '35 60% 92%',
      accentForeground: '30 40% 30%',
      muted: '205 25% 95%',
      mutedForeground: '205 12% 40%',
      ring: '205 55% 42%',
      border: '205 20% 84%',
      sidebar: '205 28% 97%',
      sidebarForeground: '205 35% 22%',
      panelSoft: '205 35% 94%',
    },
    glow: {
      a: 'rgba(120, 170, 210, 0.3)',
      b: 'rgba(230, 190, 130, 0.2)',
      c: 'rgba(160, 190, 220, 0.18)',
    },
    mobile: {
      primary: '#3080B0',
      primaryDark: '#246088',
      accent: '#F0D5A0',
      surface: '#0f1720',
      surfaceAlt: '#1a2834',
    },
  },

  field: {
    id: 'field',
    labelFa: 'خدمات میدانی',
    vibeFa: 'زیتونی کاربردی / برد کار',
    layout: 'job_board',
    density: 'compact',
    radius: '0.5rem',
    hsl: {
      primary: '75 30% 36%',
      primaryForeground: '0 0% 100%',
      secondary: '75 20% 91%',
      secondaryForeground: '75 30% 20%',
      accent: '40 45% 92%',
      accentForeground: '35 35% 28%',
      muted: '70 15% 94%',
      mutedForeground: '75 10% 38%',
      ring: '75 30% 36%',
      border: '70 15% 82%',
      sidebar: '70 18% 96%',
      sidebarForeground: '75 30% 20%',
      panelSoft: '75 22% 93%',
    },
    glow: {
      a: 'rgba(170, 180, 120, 0.28)',
      b: 'rgba(200, 180, 130, 0.2)',
      c: 'rgba(180, 185, 150, 0.16)',
    },
    mobile: {
      primary: '#6B753F',
      primaryDark: '#50582F',
      accent: '#E0D0A0',
      surface: '#141610',
      surfaceAlt: '#25281c',
    },
  },

  travel: {
    id: 'travel',
    labelFa: 'مسافرتی',
    vibeFa: 'افق آبی / فیروزه سفر',
    layout: 'booking_flow',
    density: 'airy',
    radius: '0.85rem',
    hsl: {
      primary: '198 55% 45%',
      primaryForeground: '0 0% 100%',
      secondary: '198 35% 93%',
      secondaryForeground: '198 40% 22%',
      accent: '175 40% 92%',
      accentForeground: '175 35% 28%',
      muted: '198 30% 96%',
      mutedForeground: '198 12% 40%',
      ring: '198 55% 45%',
      border: '198 22% 85%',
      sidebar: '198 40% 97%',
      sidebarForeground: '198 40% 22%',
      panelSoft: '198 40% 95%',
    },
    glow: {
      a: 'rgba(130, 200, 230, 0.32)',
      b: 'rgba(150, 210, 200, 0.22)',
      c: 'rgba(180, 220, 240, 0.2)',
    },
    mobile: {
      primary: '#3399C4',
      primaryDark: '#24789A',
      accent: '#A8D9D0',
      surface: '#0e1a20',
      surfaceAlt: '#1a2c36',
    },
  },
};

/** Explicit pack → theme mapping (every IndustryPackId must appear) */
export const PACK_THEME_MAP: Record<IndustryPackId, PackThemeId> = {
  GENERAL: 'general',
  CLINIC: 'clinic',
  BEAUTY_SALON: 'beauty',
  RETAIL: 'retail',
  WHOLESALE: 'retail',
  DISTRIBUTION: 'retail',
  AGRICULTURE: 'retail',
  FOOD_SERVICE: 'food',
  REAL_ESTATE: 'real_estate',
  LAW_FIRM: 'legal',
  ACCOUNTING_FIRM: 'agency',
  MARKETING_AGENCY: 'agency',
  CONTRACTING: 'agency',
  EDUCATION: 'schedule',
  FITNESS: 'schedule',
  PHOTOGRAPHY: 'schedule',
  HOSPITALITY: 'schedule',
  INSURANCE_AGENCY: 'sales',
  AUTOMOTIVE: 'sales',
  EVENTS: 'sales',
  WORKSHOP: 'field',
  CLEANING: 'field',
  HOME_SERVICES: 'field',
  PRINTING: 'field',
  LOGISTICS: 'field',
  TRAVEL_AGENCY: 'travel',
};

/**
 * Specialty → theme overrides so occupation colors match the job
 * (hospital ≠ aesthetic clinic even when both use CLINIC pack).
 */
export const SPECIALTY_THEME_MAP: Record<string, PackThemeId> = {
  // CLINIC
  hospital: 'hospital',
  'dental-clinic': 'dental',
  'aesthetic-laser': 'beauty',
  'dermatology-clinic': 'beauty',
  'midwifery-clinic': 'beauty',
  'psychology-clinic': 'spa',
  'physiotherapy-clinic': 'clinic',
  'veterinary-clinic': 'field',
  'medical-lab': 'clinic',
  'medical-office': 'clinic',
  'treatment-center': 'clinic',
  'optometry-clinic': 'dental',

  // BEAUTY_SALON
  'beauty-salon': 'beauty',
  'nail-salon': 'beauty',
  'makeup-studio': 'beauty',
  'barber-shop': 'barber',
  'spa-center': 'spa',

  // RETAIL
  pharmacy: 'pharmacy',
  'flower-shop': 'florist',
  'cosmetics-store': 'cosmetics',
  'jewelry-store': 'jewelry',
  supermarket: 'retail',
  'clothing-store': 'retail',
  'pet-shop': 'florist',
  optician: 'dental',

  // FOOD
  cafe: 'cafe',
  'juice-bar': 'cafe',
  bakery: 'bakery',
  restaurant: 'food',
  'fast-food': 'food',
  catering: 'food',

  // FITNESS / EDUCATION hints
  gym: 'schedule',
  'yoga-studio': 'spa',
  'pilates-studio': 'spa',
};

export function getPackThemeId(
  packId: string,
  specialtyId?: string | null,
): PackThemeId {
  if (specialtyId && SPECIALTY_THEME_MAP[specialtyId]) {
    return SPECIALTY_THEME_MAP[specialtyId];
  }
  const id = packId as IndustryPackId;
  return PACK_THEME_MAP[id] ?? 'general';
}

export function getPackTheme(
  packId: string,
  specialtyId?: string | null,
): PackThemeDefinition {
  return THEMES[getPackThemeId(packId, specialtyId)];
}

export function getPackLayoutModel(
  packId: string,
  specialtyId?: string | null,
): PackLayoutModel {
  return getPackTheme(packId, specialtyId).layout;
}

export function listPackThemes(): PackThemeDefinition[] {
  return Object.values(THEMES);
}

/** Packs missing from PACK_THEME_MAP (should always be empty) */
export function assertAllPacksHaveTheme(): IndustryPackId[] {
  return (Object.keys(PACK_REGISTRY) as IndustryPackId[]).filter(
    (id) => !(id in PACK_THEME_MAP),
  );
}

/** CSS custom-property map for applying a theme on a DOM root */
export function packThemeToCssVars(
  theme: PackThemeDefinition,
): Record<string, string> {
  const { hsl, radius, glow } = theme;
  return {
    '--primary': hsl.primary,
    '--primary-foreground': hsl.primaryForeground,
    '--secondary': hsl.secondary,
    '--secondary-foreground': hsl.secondaryForeground,
    '--accent': hsl.accent,
    '--accent-foreground': hsl.accentForeground,
    '--muted': hsl.muted,
    '--muted-foreground': hsl.mutedForeground,
    '--ring': hsl.ring,
    '--border': hsl.border,
    '--input': hsl.border,
    '--radius': radius,
    '--sidebar': hsl.sidebar,
    '--sidebar-foreground': hsl.sidebarForeground,
    '--panel-soft': hsl.panelSoft,
    '--pack-glow-a': glow.a,
    '--pack-glow-b': glow.b,
    '--pack-glow-c': glow.c,
  };
}
