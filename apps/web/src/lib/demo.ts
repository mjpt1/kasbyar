import { isProduction, isSeedAllowed } from '@/lib/env';

/**
 * Server-side demo mode — set DEMO_MODE=true in local/staging/sales environments.
 * Never enabled in production unless ALLOW_SEED is also explicitly true.
 */
export function isDemoModeEnabled(): boolean {
  const flag = process.env.DEMO_MODE === 'true' || process.env.DEMO_MODE === '1';
  if (!flag) return false;
  if (isProduction() && !isSeedAllowed()) return false;
  return true;
}

/** Client-visible demo UI (banner, toolbar, showcase). */
export function isPublicDemoMode(): boolean {
  return process.env.NEXT_PUBLIC_DEMO_MODE === 'true';
}

export function canShowDemoControls(): boolean {
  return isDemoModeEnabled() || isPublicDemoMode();
}

export function canResetDemoData(): boolean {
  return isDemoModeEnabled() && isSeedAllowed();
}
