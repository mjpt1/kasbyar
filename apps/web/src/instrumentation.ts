export async function register() {
  if (process.env.NEXT_RUNTIME === 'nodejs') {
    const { validateServerEnvAtStartup } = await import('@/lib/env');
    validateServerEnvAtStartup();
    const { initMonitoring } = await import('@/lib/monitoring');
    initMonitoring();
  }
}
