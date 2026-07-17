import { z } from 'zod';

const logLevelSchema = z.enum(['debug', 'info', 'warn', 'error']);

const serverEnvSchema = z.object({
  APP_ENV: z.enum(['development', 'staging', 'production', 'test']).optional(),
  DATABASE_URL: z.string().min(1, 'DATABASE_URL الزامی است'),
  SESSION_SECRET: z
    .string()
    .min(16, 'SESSION_SECRET باید حداقل ۱۶ کاراکتر باشد')
    .optional(),
  AI_SERVICE_URL: z.string().url().optional(),
  AI_SERVICE_TOKEN: z.string().min(1).optional(),
  UPLOAD_DIR: z.string().optional(),
  MAX_UPLOAD_SIZE_MB: z.coerce.number().positive().optional(),
  UPSTASH_REDIS_REST_URL: z.string().url().optional(),
  UPSTASH_REDIS_REST_TOKEN: z.string().min(1).optional(),
  LOG_LEVEL: logLevelSchema.optional(),
  NODE_ENV: z.enum(['development', 'test', 'production']).optional(),
  SENTRY_DSN: z.string().url().optional().or(z.literal('')),
  SENTRY_ENVIRONMENT: z.string().optional(),
  ALLOW_SEED: z
    .string()
    .optional()
    .transform((v) => v === 'true' || v === '1'),
  DEMO_MODE: z
    .string()
    .optional()
    .transform((v) => v === 'true' || v === '1'),
});

export type ServerEnv = z.infer<typeof serverEnvSchema>;

let cached: ServerEnv | null = null;

export function getServerEnv(): ServerEnv {
  if (cached) return cached;

  const parsed = serverEnvSchema.safeParse(process.env);
  if (!parsed.success) {
    const message = parsed.error.errors.map((e) => e.message).join('؛ ');
    throw new Error(`پیکربندی محیط نامعتبر: ${message}`);
  }

  cached = parsed.data;
  return cached;
}

export function getAppEnv(): 'development' | 'staging' | 'production' | 'test' {
  const env = getServerEnv();
  if (env.APP_ENV) return env.APP_ENV;
  if (env.NODE_ENV === 'production') return 'production';
  if (env.NODE_ENV === 'test') return 'test';
  return 'development';
}

export function isProduction(): boolean {
  return getAppEnv() === 'production';
}

export function shouldUseSecureCookies(): boolean {
  const env = getAppEnv();
  return env === 'production' || env === 'staging';
}

export function isSeedAllowed(): boolean {
  if (!isProduction()) return true;
  return getServerEnv().ALLOW_SEED === true;
}

export function getSessionSecret(): string {
  return (
    process.env.SESSION_SECRET ??
    (isProduction()
      ? (() => {
          throw new Error('SESSION_SECRET در production الزامی است');
        })()
      : 'dev-only-session-secret-change-me')
  );
}

export function getLogLevel(): 'debug' | 'info' | 'warn' | 'error' {
  const env = getServerEnv();
  if (env.LOG_LEVEL) return env.LOG_LEVEL;
  return isProduction() ? 'info' : 'debug';
}

const PRODUCTION_REQUIRED: Array<{ key: string; present: () => boolean }> = [
  { key: 'SESSION_SECRET', present: () => Boolean(process.env.SESSION_SECRET?.length) },
];

/**
 * Fail fast on dangerous production configuration. Called from instrumentation at startup.
 */
export function validateServerEnvAtStartup(): void {
  getServerEnv();

  if (!isProduction()) return;

  const missing = PRODUCTION_REQUIRED.filter((item) => !item.present()).map((item) => item.key);
  if (missing.length > 0) {
    throw new Error(
      `پیکربندی production ناقص است — متغیرهای الزامی: ${missing.join(', ')}`,
    );
  }

  if (getServerEnv().ALLOW_SEED === true) {
    console.warn(
      '[security] ALLOW_SEED=true در production — عملیات مخرب دیتابیس مجاز است',
    );
  }

  if (getServerEnv().DEMO_MODE === true) {
    console.warn('[security] DEMO_MODE=true در production — فقط برای محیط فروش اختصاصی');
  }
}
