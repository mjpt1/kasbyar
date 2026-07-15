/**
 * Notification channel adapter — SMS, email unified command.
 */
import type { ProviderId } from './categories';
import type { IntegrationFailure } from './errors';

export type NotificationChannel = 'sms' | 'email';

export interface SendNotificationCommand {
  organizationId: string;
  channel: NotificationChannel;
  /** E.164 mobile or RFC5322 email — validated before adapter */
  recipient: string;
  subject?: string;
  body: string;
  /** Opaque metadata for provider templates — no vendor keys in business layer */
  tags?: Record<string, string>;
}

export type NotificationDispatchStatus = 'sent' | 'queued' | 'failed';

export interface NotificationDispatchResult {
  status: NotificationDispatchStatus;
  providerRef?: string;
  failure?: IntegrationFailure;
}

export interface NotificationAdapter {
  readonly id: ProviderId | string;
  readonly supportedChannels: readonly NotificationChannel[];
  send(command: SendNotificationCommand): Promise<NotificationDispatchResult>;
}
