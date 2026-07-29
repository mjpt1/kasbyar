export type InboxChannel = 'WHATSAPP' | 'SMS' | 'EMAIL' | 'PHONE' | 'TELEGRAM' | 'INSTAGRAM' | 'INTERNAL';

export const INBOX_CHANNEL_LABELS: Record<InboxChannel, string> = {
  WHATSAPP: 'واتساپ',
  SMS: 'پیامک',
  EMAIL: 'ایمیل',
  PHONE: 'تماس',
  TELEGRAM: 'تلگرام',
  INSTAGRAM: 'دایرکت اینستاگرام',
  INTERNAL: 'داخلی',
};

export interface InboxThreadSummary {
  id: string;
  channel: InboxChannel;
  externalPhone: string | null;
  externalEmail: string | null;
  customerId: string | null;
  customerName: string | null;
  leadId: string | null;
  leadTitle: string | null;
  assigneeId: string | null;
  assigneeName: string | null;
  lastMessageAt: string | null;
  lastMessagePreview: string | null;
  unreadCount: number;
}

export interface InboxMessageItem {
  id: string;
  direction: 'INBOUND' | 'OUTBOUND';
  content: string;
  sentAt: string;
  senderName: string | null;
  externalId: string | null;
  status: 'sent' | 'delivered' | 'failed' | 'received';
  /** VoIP call metadata when available */
  recordingUrl?: string | null;
  durationSeconds?: number | null;
  agentExtension?: string | null;
}
