import { afterEach, describe, expect, it, vi } from 'vitest';

const envSnapshot = { ...process.env };

function withBaseEnv() {
  process.env.DATABASE_URL ??= 'postgresql://test:test@localhost:5432/test';
  process.env.SESSION_SECRET ??= 'test-session-secret-min-16';
}

afterEach(() => {
  process.env = { ...envSnapshot };
  vi.resetModules();
});

async function loadDemoModule() {
  withBaseEnv();
  return import('./demo');
}

describe('demo mode gating', () => {
  it('is disabled when DEMO_MODE is unset', async () => {
    withBaseEnv();
    delete process.env.DEMO_MODE;
    const { isDemoModeEnabled, canShowDemoControls } = await loadDemoModule();
    expect(isDemoModeEnabled()).toBe(false);
    expect(canShowDemoControls()).toBe(false);
  });

  it('enables server demo in development when DEMO_MODE=true', async () => {
    process.env.DEMO_MODE = 'true';
    process.env.APP_ENV = 'development';
    const { isDemoModeEnabled } = await loadDemoModule();
    expect(isDemoModeEnabled()).toBe(true);
  });

  it('blocks server demo in production without ALLOW_SEED', async () => {
    withBaseEnv();
    process.env.DEMO_MODE = 'true';
    process.env.APP_ENV = 'production';
    delete process.env.ALLOW_SEED;
    const { isDemoModeEnabled, canResetDemoData } = await loadDemoModule();
    expect(isDemoModeEnabled()).toBe(false);
    expect(canResetDemoData()).toBe(false);
  });

  it('allows reset only when demo mode and seed are allowed', async () => {
    process.env.DEMO_MODE = 'true';
    process.env.APP_ENV = 'development';
    process.env.ALLOW_SEED = 'true';
    const { canResetDemoData } = await loadDemoModule();
    expect(canResetDemoData()).toBe(true);
  });

  it('shows client controls when NEXT_PUBLIC_DEMO_MODE is true', async () => {
    withBaseEnv();
    delete process.env.DEMO_MODE;
    process.env.NEXT_PUBLIC_DEMO_MODE = 'true';
    const { canShowDemoControls, isPublicDemoMode } = await loadDemoModule();
    expect(isPublicDemoMode()).toBe(true);
    expect(canShowDemoControls()).toBe(true);
  });
});
