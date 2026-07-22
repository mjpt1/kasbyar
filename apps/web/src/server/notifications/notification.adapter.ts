import {
  INTEGRATION_FAILURE_CODES,
  KILL_SWITCHES,
  PROVIDER_IDS,
  integrationFailure,
  type NotificationAdapter,
  type SendNotificationCommand,
} from '@kesbyar/shared';

import { APP_LOG_EVENTS, logger } from '@/lib/logger';
import { isKillSwitchActive } from '@/lib/flags';
import { resolveSmsCredentials } from '@/server/integrations/org-credentials.service';

import { createKavenegarAdapter } from './providers/kavenegar';

/**
 * No-op notification adapter — records intent without external dispatch.
 */
class NoopNotificationAdapter implements NotificationAdapter {
  readonly id = PROVIDER_IDS.NOTIFICATION_NOOP;
  readonly supportedChannels = ['sms', 'email'] as const;

  async send(command: SendNotificationCommand) {
    logger.info(APP_LOG_EVENTS.NOTIFICATION_QUEUED, {
      organizationId: command.organizationId,
      channel: command.channel,
      provider: this.id,
    });
    return {
      status: 'queued' as const,
      providerRef: `noop-${Date.now()}`,
    };
  }
}

const noop = new NoopNotificationAdapter();

/**
 * Resolve SMS adapter for an organization (org key → env fallback → noop).
 */
export async function getNotificationAdapterForOrg(
  organizationId: string,
): Promise<NotificationAdapter> {
  if (isKillSwitchActive(KILL_SWITCHES.EXTERNAL_NOTIFICATIONS)) {
    return noop;
  }

  const creds = await resolveSmsCredentials(organizationId);
  if (creds.apiKey) {
    return createKavenegarAdapter(creds.apiKey, creds.sender ?? undefined);
  }

  const requested = (
    process.env.NOTIFICATION_PROVIDER ??
    process.env.SMS_PROVIDER ??
    ''
  ).toLowerCase();
  if (requested === PROVIDER_IDS.SMS_KAVENEGAR || requested === PROVIDER_IDS.EMAIL_RESEND) {
    logger.warn(APP_LOG_EVENTS.INTEGRATION_NOT_CONFIGURED, {
      organizationId,
      requestedProvider: requested,
      fallback: PROVIDER_IDS.NOTIFICATION_NOOP,
    });
  }

  return noop;
}

/** @deprecated Env-only; prefer getNotificationAdapterForOrg */
export function getNotificationAdapter(): NotificationAdapter {
  if (isKillSwitchActive(KILL_SWITCHES.EXTERNAL_NOTIFICATIONS)) {
    return noop;
  }

  const apiKey =
    process.env.SMS_KAVENEGAR_API_KEY ?? process.env.KAVENEGAR_API_KEY ?? undefined;
  const sender = process.env.SMS_KAVENEGAR_SENDER ?? process.env.KAVENEGAR_SENDER;

  if (apiKey) {
    return createKavenegarAdapter(apiKey, sender);
  }

  return noop;
}

/** @deprecated Prefer isSmsProviderConfiguredForOrg */
export function isSmsProviderConfigured(): boolean {
  return Boolean(process.env.SMS_KAVENEGAR_API_KEY ?? process.env.KAVENEGAR_API_KEY);
}

export async function isSmsProviderConfiguredForOrg(organizationId: string): Promise<boolean> {
  const creds = await resolveSmsCredentials(organizationId);
  return Boolean(creds.apiKey);
}

export async function sendNotification(command: SendNotificationCommand) {
  const adapter = await getNotificationAdapterForOrg(command.organizationId);
  if (!adapter.supportedChannels.includes(command.channel)) {
    return {
      status: 'failed' as const,
      failure: integrationFailure(
        INTEGRATION_FAILURE_CODES.NOT_CONFIGURED,
        'کانال اعلان برای این ارائه‌دهنده پیکربندی نشده است',
        { provider: adapter.id, category: 'notification' },
      ),
    };
  }
  try {
    return await adapter.send(command);
  } catch (error) {
    logger.warn(APP_LOG_EVENTS.INTEGRATION_PROVIDER_FAILED, {
      organizationId: command.organizationId,
      provider: adapter.id,
      channel: command.channel,
      message: error instanceof Error ? error.message : String(error),
    });
    return {
      status: 'failed' as const,
      failure: integrationFailure(
        INTEGRATION_FAILURE_CODES.UNKNOWN,
        'ارسال اعلان ناموفق بود',
        { provider: adapter.id, category: 'notification', retryable: true },
      ),
    };
  }
}

/** Reset cache — for tests (no longer caches; kept for API compat) */
export function resetNotificationAdapterCache() {
  /* no-op: adapters are created per request from org/env credentials */
}
