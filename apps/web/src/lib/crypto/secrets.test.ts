import { describe, expect, it } from 'vitest';

import {
  decryptSecret,
  encryptSecret,
  isEncryptedSecret,
  maskSecret,
  secretLast4,
} from './secrets';

describe('secrets crypto', () => {
  const env = {
    NODE_ENV: 'test',
    INTEGRATION_SECRETS_KEY: 'a'.repeat(64),
  } as NodeJS.ProcessEnv;

  it('encrypts and decrypts round-trip', () => {
    const plain = 'merchant-secret-xyz9';
    const enc = encryptSecret(plain, env);
    expect(isEncryptedSecret(enc)).toBe(true);
    expect(enc).not.toContain(plain);
    expect(decryptSecret(enc, env)).toBe(plain);
  });

  it('returns plaintext legacy values as-is', () => {
    expect(decryptSecret('legacy-key', env)).toBe('legacy-key');
  });

  it('masks secrets with last 4', () => {
    expect(secretLast4('abcd1234')).toBe('1234');
    expect(maskSecret('1234', true)).toBe('••••1234');
    expect(maskSecret(null, true)).toBe('تنظیم شده');
    expect(maskSecret('1234', false)).toBeNull();
  });
});
