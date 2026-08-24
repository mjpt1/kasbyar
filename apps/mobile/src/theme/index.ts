import { getPackTheme } from '@kesbyar/shared';

export const colors = {
  background: '#0f172a',
  surface: '#1e293b',
  surfaceAlt: '#334155',
  border: '#475569',
  primary: '#38bdf8',
  primaryDark: '#0ea5e9',
  text: '#f8fafc',
  textMuted: '#94a3b8',
  success: '#4ade80',
  warning: '#fbbf24',
  danger: '#f87171',
} as const;

export const spacing = {
  xs: 4,
  sm: 8,
  md: 16,
  lg: 24,
  xl: 32,
} as const;

export const radius = {
  sm: 8,
  md: 12,
  lg: 16,
} as const;

const DENSITY_RADIUS: Record<string, typeof radius> = {
  compact: { sm: 4, md: 8, lg: 10 },
  comfortable: { sm: 8, md: 12, lg: 16 },
  airy: { sm: 10, md: 16, lg: 22 },
};

/** Resolve pack-aware mobile palette (same source as web data-pack themes). */
export function getPackMobileTheme(packId: string) {
  const theme = getPackTheme(packId);
  return {
    colors: {
      ...colors,
      primary: theme.mobile.primary,
      primaryDark: theme.mobile.primaryDark,
      accent: theme.mobile.accent,
      surface: theme.mobile.surface,
      surfaceAlt: theme.mobile.surfaceAlt,
      background: theme.mobile.surface,
    },
    radius: DENSITY_RADIUS[theme.density] ?? radius,
    themeId: theme.id,
    layout: theme.layout,
    density: theme.density,
  };
}
