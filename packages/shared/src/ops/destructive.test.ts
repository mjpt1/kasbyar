import { afterEach, describe, expect, it } from 'vitest';

import {
  isDestructiveDbAllowed,
  isRestoreAllowed,
  parseDatabaseUrl,
} from './destructive';

const envSnapshot = { ...process.env };

afterEach(() => {
  process.env = { ...envSnapshot };
});

describe('destructive ops guards', () => {
  it('blocks seed in production without ALLOW_SEED', () => {
    process.env.APP_ENV = 'production';
    delete process.env.ALLOW_SEED;
    expect(isDestructiveDbAllowed()).toBe(false);
  });

  it('allows seed in production with ALLOW_SEED', () => {
    process.env.APP_ENV = 'production';
    process.env.ALLOW_SEED = 'true';
    expect(isDestructiveDbAllowed()).toBe(true);
  });

  it('requires CONFIRM_RESTORE in development', () => {
    process.env.APP_ENV = 'development';
    delete process.env.CONFIRM_RESTORE;
    expect(isRestoreAllowed()).toBe(false);
    process.env.CONFIRM_RESTORE = 'true';
    expect(isRestoreAllowed()).toBe(true);
  });

  it('parses database url', () => {
    const db = parseDatabaseUrl('postgresql://user:pass@localhost:5432/kesbyar?schema=public');
    expect(db.user).toBe('user');
    expect(db.database).toBe('kesbyar');
    expect(db.host).toBe('localhost');
  });
});
