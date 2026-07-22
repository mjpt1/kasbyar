import {
  INTEGRATION_FAILURE_CODES,
  PROVIDER_IDS,
  integrationFailure,
  type NotificationAdapter,
  type SendNotificationCommand,
} from '@kesbyar/shared';

import { isValidIranianMobile, normalizeIranianMobile } from '@/lib/validators/iranian';
import { APP_LOG_EVENTS, logger } from '@/lib/logger';

/**
 * Kavenegar simple send API.
 * @see https://kavenegar.com/rest.html#sms-send
 */
export function createKavenegarAdapter(apiKey: string, sender?: string): NotificationAdapter {
  const base = `https://api.kavenegar.com/v1/${apiKey}`;

  return {
    id: PROVIDER_IDS.SMS_KAVENEGAR,
    supportedChannels: ['sms'],

    async send(command: SendNotificationCommand) {
      if (command.channel !== 'sms') {
        throw new Error('Kavenegar فقط کانال پیامک را پشتیبانی می‌کند');
      }

      const receptor = normalizeIranianMobile(command.recipient);
      if (!isValidIranianMobile(receptor)) {
        return {
          status: 'failed' as const,
          failure: integrationFailure(
            INTEGRATION_FAILURE_CODES.INVALID_RECIPIENT,
            'شماره موبایل ایران نامعتبر است (09xxxxxxxxx)',
            { provider: PROVIDER_IDS.SMS_KAVENEGAR, category: 'notification' },
          ),
        };
      }

      const message = [command.subject, command.body].filter(Boolean).join('\n').trim();
      if (!message) {
        return {
          status: 'failed' as const,
          failure: integrationFailure(
            INTEGRATION_FAILURE_CODES.INVALID_PAYLOAD,
            'متن پیامک خالی است',
            { provider: PROVIDER_IDS.SMS_KAVENEGAR, category: 'notification' },
          ),
        };
      }

      const params = new URLSearchParams({
        receptor,
        message: message.slice(0, 900),
      });
      if (sender) params.set('sender', sender);

      const res = await fetch(`${base}/sms/send.json?${params.toString()}`, {
        method: 'GET',
      });
      const data = (await res.json()) as {
        return?: { status?: number; message?: string };
        entries?: { messageid?: number }[];
      };

      const status = data.return?.status;
      if (status !== 200) {
        logger.warn(APP_LOG_EVENTS.INTEGRATION_PROVIDER_FAILED, {
          provider: PROVIDER_IDS.SMS_KAVENEGAR,
          status,
          message: data.return?.message,
        });
        return {
          status: 'failed' as const,
          failure: integrationFailure(
            INTEGRATION_FAILURE_CODES.PROVIDER_UNAVAILABLE,
            data.return?.message || 'ارسال پیامک کاوه‌نگار ناموفق بود',
            { provider: PROVIDER_IDS.SMS_KAVENEGAR, category: 'notification', retryable: true },
          ),
        };
      }

      const messageId = data.entries?.[0]?.messageid;
      return {
        status: 'sent' as const,
        providerRef: messageId != null ? String(messageId) : `kavenegar-${Date.now()}`,
      };
    },
  };
}
