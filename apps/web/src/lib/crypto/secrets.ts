import { createCipheriv, createDecipheriv, createHash, randomBytes, scryptSync } from 'crypto';

const ENC_PREFIX = 'enc:v1:';

/**
 * Resolve AES-256 key: INTEGRATION_SECRETS_KEY (64 hex / 44 base64 / raw 32 bytes)
 * or derive from SESSION_SECRET.
 */
export function resolveSecretsKey(env: NodeJS.ProcessEnv = process.env): Buffer {
  const explicit = env.INTEGRATION_SECRETS_KEY?.trim();
  if (explicit) {
    if (/^[0-9a-fA-F]{64}$/.test(explicit)) {
      return Buffer.from(explicit, 'hex');
    }
    try {
      const b64 = Buffer.from(explicit, 'base64');
      if (b64.length === 32) return b64;
    } catch {
      /* fall through */
    }
    return createHash('sha256').update(explicit, 'utf8').digest();
  }

  const session = env.SESSION_SECRET?.trim();
  if (!session || session.length < 8) {
    // Dev-safe deterministic fallback — production should set SESSION_SECRET / INTEGRATION_SECRETS_KEY
    return createHash('sha256').update('kesbyar-dev-integration-secrets', 'utf8').digest();
  }
  return scryptSync(session, 'kesbyar-integration-v1', 32);
}

/** Encrypt plaintext; returns enc:v1:iv:tag:ciphertext (base64 parts). */
export function encryptSecret(plaintext: string, env?: NodeJS.ProcessEnv): string {
  const key = resolveSecretsKey(env);
  const iv = randomBytes(12);
  const cipher = createCipheriv('aes-256-gcm', key, iv);
  const encrypted = Buffer.concat([cipher.update(plaintext, 'utf8'), cipher.final()]);
  const tag = cipher.getAuthTag();
  return `${ENC_PREFIX}${iv.toString('base64')}:${tag.toString('base64')}:${encrypted.toString('base64')}`;
}

/** Decrypt enc:v1 payload or return plaintext as-is (legacy / migration). */
export function decryptSecret(value: string | null | undefined, env?: NodeJS.ProcessEnv): string | null {
  if (!value) return null;
  if (!value.startsWith(ENC_PREFIX)) {
    return value;
  }
  const parts = value.slice(ENC_PREFIX.length).split(':');
  if (parts.length !== 3) {
    throw new Error('قالب رمزنگاری نامعتبر است');
  }
  const [ivB64, tagB64, dataB64] = parts;
  const key = resolveSecretsKey(env);
  const decipher = createDecipheriv('aes-256-gcm', key, Buffer.from(ivB64!, 'base64'));
  decipher.setAuthTag(Buffer.from(tagB64!, 'base64'));
  const decrypted = Buffer.concat([
    decipher.update(Buffer.from(dataB64!, 'base64')),
    decipher.final(),
  ]);
  return decrypted.toString('utf8');
}

/** Last 4 chars for UI; empty → null. */
export function secretLast4(value: string | null | undefined): string | null {
  if (!value || value.length === 0) return null;
  return value.slice(-4);
}

/** Mask for API responses — never return full secret. */
export function maskSecret(last4: string | null | undefined, configured: boolean): string | null {
  if (!configured) return null;
  if (last4 && last4.length > 0) {
    return `••••${last4}`;
  }
  return 'تنظیم شده';
}

export function isEncryptedSecret(value: string | null | undefined): boolean {
  return Boolean(value?.startsWith(ENC_PREFIX));
}
