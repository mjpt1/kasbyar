import { beforeEach, describe, expect, it, vi } from 'vitest';

import { encryptSecret } from '@/lib/crypto/secrets';
import { ForbiddenError } from '@/lib/errors';

const findMany = vi.fn();
const findUnique = vi.fn();
const upsert = vi.fn();

vi.mock('@/lib/prisma', () => ({
  prisma: {
    integrationConfig: {
      findMany: (...args: unknown[]) => findMany(...args),
      upsert: (...args: unknown[]) => upsert(...args),
    },
    organization: {
      findUnique: (...args: unknown[]) => findUnique(...args),
    },
  },
}));

vi.mock('@/server/audit/audit.service', () => ({
  logAudit: vi.fn().mockResolvedValue(undefined),
}));

import {
  resolveMoadianCredentials,
  resolvePaymentCredentials,
  resolveSmsCredentials,
  updateOrgIntegrations,
} from './org-credentials.service';

const ORG = 'org_test_1';

describe('org-credentials prefer org over env', () => {
  const prevEnv = { ...process.env };

  beforeEach(() => {
    vi.clearAllMocks();
    process.env = { ...prevEnv };
    process.env.SESSION_SECRET = 'test-session-secret-min-16-chars';
    process.env.INTEGRATION_SECRETS_KEY = 'b'.repeat(64);
    delete process.env.PAYMENT_ZARINPAL_MERCHANT_ID;
    delete process.env.BILLING_ZARINPAL_MERCHANT_ID;
    delete process.env.PAYMENT_IDPAY_API_KEY;
    delete process.env.BILLING_IDPAY_API_KEY;
    delete process.env.SMS_KAVENEGAR_API_KEY;
    delete process.env.KAVENEGAR_API_KEY;
    delete process.env.MOADIAN_INTERMEDIARY_URL;
    delete process.env.MOADIAN_INTERMEDIARY_API_KEY;
    delete process.env.INVOICE_PAYMENT_PROVIDER;
    delete process.env.BILLING_PROVIDER;
  });

  it('prefers org zarinpal merchant over env', async () => {
    process.env.PAYMENT_ZARINPAL_MERCHANT_ID = 'env-merchant-AAAA';
    const orgMerchant = 'org-merchant-BBBB';
    findMany.mockResolvedValue([
      {
        provider: 'payment',
        config: {
          preferredProvider: 'zarinpal',
          sandbox: false,
          zarinpalMerchantIdEnc: encryptSecret(orgMerchant),
          zarinpalMerchantIdLast4: 'BBBB',
        },
      },
    ]);

    const creds = await resolvePaymentCredentials(ORG);
    expect(creds.zarinpalMerchantId).toBe(orgMerchant);
    expect(creds.preferredProvider).toBe('zarinpal');
    expect(creds.sandbox).toBe(false);
    expect(creds.source).toBe('org');
  });

  it('falls back to env when org has no payment config', async () => {
    process.env.PAYMENT_ZARINPAL_MERCHANT_ID = 'env-merchant-CCCC';
    process.env.INVOICE_PAYMENT_PROVIDER = 'zarinpal';
    findMany.mockResolvedValue([]);

    const creds = await resolvePaymentCredentials(ORG);
    expect(creds.zarinpalMerchantId).toBe('env-merchant-CCCC');
    expect(creds.source).toBe('env');
  });

  it('prefers org kavenegar key over env', async () => {
    process.env.SMS_KAVENEGAR_API_KEY = 'env-sms-key';
    findMany.mockResolvedValue([
      {
        provider: 'kavenegar',
        config: {
          apiKeyEnc: encryptSecret('org-sms-key'),
          apiKeyLast4: '-key',
          sender: '10001',
        },
      },
    ]);

    const creds = await resolveSmsCredentials(ORG);
    expect(creds.apiKey).toBe('org-sms-key');
    expect(creds.sender).toBe('10001');
    expect(creds.source).toBe('org');
  });

  it('prefers org moadian intermediary over env', async () => {
    process.env.MOADIAN_INTERMEDIARY_URL = 'https://env.example/moadian';
    process.env.MOADIAN_INTERMEDIARY_API_KEY = 'env-moadian';
    findMany.mockResolvedValue([
      {
        provider: 'moadian',
        config: {
          intermediaryUrl: 'https://org.example/moadian',
          apiKeyEnc: encryptSecret('org-moadian'),
          apiKeyLast4: 'dian',
        },
      },
    ]);

    const creds = await resolveMoadianCredentials(ORG);
    expect(creds.intermediaryUrl).toBe('https://org.example/moadian');
    expect(creds.apiKey).toBe('org-moadian');
    expect(creds.source).toBe('org');
  });

  it('rejects STAFF from updating integrations', async () => {
    await expect(
      updateOrgIntegrations(ORG, 'STAFF', 'user1', {
        payment: { preferredProvider: 'manual' },
      }),
    ).rejects.toBeInstanceOf(ForbiddenError);
    expect(findMany).not.toHaveBeenCalled();
  });
});
