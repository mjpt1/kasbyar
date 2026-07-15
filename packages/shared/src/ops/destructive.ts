export type AppEnvironment = 'development' | 'staging' | 'production' | 'test';

export function getAppEnvironment(): AppEnvironment {
  const raw = process.env.APP_ENV ?? process.env.NODE_ENV ?? 'development';
  if (raw === 'production' || raw === 'staging' || raw === 'test') {
    return raw;
  }
  return 'development';
}

export function isProductionEnvironment(): boolean {
  return getAppEnvironment() === 'production';
}

/** seed / reset / reseed — در production فقط با ALLOW_SEED=true */
export function isDestructiveDbAllowed(): boolean {
  if (!isProductionEnvironment()) return true;
  return process.env.ALLOW_SEED === 'true' || process.env.ALLOW_SEED === '1';
}

/** restore — سخت‌گیرتر از seed */
export function isRestoreAllowed(): boolean {
  if (!isProductionEnvironment()) {
    return process.env.CONFIRM_RESTORE === 'true' || process.env.CONFIRM_RESTORE === '1';
  }
  return (
    (process.env.ALLOW_RESTORE === 'true' || process.env.ALLOW_RESTORE === '1') &&
    (process.env.CONFIRM_RESTORE === 'true' || process.env.CONFIRM_RESTORE === '1')
  );
}

export function parseDatabaseUrl(url: string): {
  host: string;
  port: string;
  user: string;
  password: string;
  database: string;
} {
  const parsed = new URL(url);
  return {
    host: parsed.hostname,
    port: parsed.port || '5432',
    user: decodeURIComponent(parsed.username),
    password: decodeURIComponent(parsed.password),
    database: parsed.pathname.replace(/^\//, '').split('?')[0] ?? 'kesbyar',
  };
}
