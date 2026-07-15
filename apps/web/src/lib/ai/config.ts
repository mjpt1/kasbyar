import { getServerEnv } from '@/lib/env';

export interface AiServiceConfig {
  baseUrl: string;
  token: string;
  timeoutMs: number;
  retries: number;
}

const DEFAULTS = {
  baseUrl: 'http://localhost:8000',
  token: 'internal-dev-token-change-in-production',
  timeoutMs: 8_000,
  retries: 1,
} as const;

export function getAiServiceConfig(): AiServiceConfig {
  const env = getServerEnv();
  const timeoutRaw = process.env.AI_SERVICE_TIMEOUT_MS;
  const retriesRaw = process.env.AI_SERVICE_RETRIES;

  return {
    baseUrl: env.AI_SERVICE_URL ?? DEFAULTS.baseUrl,
    token: env.AI_SERVICE_TOKEN ?? DEFAULTS.token,
    timeoutMs: timeoutRaw ? Number(timeoutRaw) : DEFAULTS.timeoutMs,
    retries: retriesRaw ? Math.max(0, Number(retriesRaw)) : DEFAULTS.retries,
  };
}
