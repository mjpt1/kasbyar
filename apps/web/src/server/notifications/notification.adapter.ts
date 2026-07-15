import {
  INTEGRATION_FAILURE_CODES,
  PROVIDER_IDS,
  integrationFailure,
  resolveProviderId,
  type NotificationAdapter,
  type SendNotificationCommand,
} from '@kesbyar/shared';

import { APP_LOG_EVENTS, logger } from '@/lib/logger';

/**
 * No-op notification adapter — records intent without external dispatch (V1).
 * Replace with Kavenegar/Resend adapters without changing automation.service.
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

const ALLOWED_NOTIFICATION_PROVIDERS = [
  PROVIDER_IDS.NOTIFICATION_NOOP,
  PROVIDER_IDS.SMS_KAVENEGAR,
  PROVIDER_IDS.EMAIL_RESEND,
] as const;

let cached: NotificationAdapter | null = null;

export function getNotificationAdapter(): NotificationAdapter {
  if (cached) {
    return cached;
  }

  const id = resolveProviderId(
    null,
    process.env.NOTIFICATION_PROVIDER ?? process.env.SMS_PROVIDER,
    PROVIDER_IDS.NOTIFICATION_NOOP,
    ALLOWED_NOTIFICATION_PROVIDERS,
  );

  switch (id) {
    case PROVIDER_IDS.SMS_KAVENEGAR:
    case PROVIDER_IDS.EMAIL_RESEND:
      // post-V1: channel-specific adapters
      logger.warn(APP_LOG_EVENTS.INTEGRATION_NOT_CONFIGURED, {
        requestedProvider: id,
        fallback: PROVIDER_IDS.NOTIFICATION_NOOP,
      });
      cached = new NoopNotificationAdapter();
      return cached;
    default:
      cached = new NoopNotificationAdapter();
      return cached;
  }
}

export async function sendNotification(command: SendNotificationCommand) {
  const adapter = getNotificationAdapter();
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
