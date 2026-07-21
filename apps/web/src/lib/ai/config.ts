import { getServerEnv } from '@/lib/env';

export interface AiServiceConfig {
  baseUrl: string;
  token: string;
  timeoutMs: number;
  retries: number;
}

/** Must stay in sync with apps/ai-service default `ai_service_token`. */
export const AI_SERVICE_DEV_TOKEN = 'internal-dev-token-change-in-production';

const DEFAULTS = {
  baseUrl: 'http://localhost:8000',
  token: AI_SERVICE_DEV_TOKEN,
  timeoutMs: 45_000,
  retries: 1,
} as const;

export function getAiServiceConfig(): AiServiceConfig {
  const env = getServerEnv();
  const timeoutRaw = process.env.AI_SERVICE_TIMEOUT_MS;
  const retriesRaw = process.env.AI_SERVICE_RETRIES;
  const token = env.AI_SERVICE_TOKEN ?? DEFAULTS.token;

  if (env.AI_SERVICE_URL && token === 'dev-token') {
    console.warn(
      '[ai] AI_SERVICE_TOKEN is "dev-token" but web defaults to internal-dev-token — requests may fail with 401',
    );
  }

  return {
    baseUrl: env.AI_SERVICE_URL ?? DEFAULTS.baseUrl,
    token,
    timeoutMs: timeoutRaw ? Number(timeoutRaw) : DEFAULTS.timeoutMs,
    retries: retriesRaw ? Math.max(0, Number(retriesRaw)) : DEFAULTS.retries,
  };
}
