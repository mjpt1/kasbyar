import { useLocalSearchParams, useRouter } from 'expo-router';
import { useMemo, useState } from 'react';
import {
  FlatList,
  KeyboardAvoidingView,
  Platform,
  StyleSheet,
  Text,
  View,
} from 'react-native';

import { apiPost } from '@/api/client';
import { useAuthCredentials } from '@/auth/AuthContext';
import { PrimaryButton, TextField } from '@/components/ui';
import { EmptyState, ErrorState, LoadingState, Screen, ScreenHeader } from '@/components/Screen';
import { useApiQuery } from '@/hooks/useApiQuery';
import { colors, radius, spacing } from '@/theme';

type InboxMessage = {
  id: string;
  direction: 'INBOUND' | 'OUTBOUND';
  content: string;
  sentAt: string;
  senderName?: string | null;
  status?: string;
};

type ThreadPayload = {
  thread?: {
    id: string;
    channel?: string;
    assignee?: { name?: string | null } | null;
    externalPhone?: string | null;
    externalEmail?: string | null;
  };
  items?: InboxMessage[];
};

const CHANNEL_LABELS: Record<string, string> = {
  WHATSAPP: 'واتساپ',
  SMS: 'پیامک',
  EMAIL: 'ایمیل',
  PHONE: 'تماس',
  TELEGRAM: 'تلگرام',
  INSTAGRAM: 'اینستاگرام',
};

const REPLYABLE_CHANNELS = new Set([
  'WHATSAPP',
  'SMS',
  'EMAIL',
  'TELEGRAM',
  'INSTAGRAM',
]);

function formatDate(value: string) {
  try {
    return new Intl.DateTimeFormat('fa-IR', {
      dateStyle: 'short',
      timeStyle: 'short',
    }).format(new Date(value));
  } catch {
    return value;
  }
}

export default function InboxThreadScreen() {
  const router = useRouter();
  const auth = useAuthCredentials();
  const params = useLocalSearchParams<{ threadId: string }>();
  const threadId = Array.isArray(params.threadId) ? params.threadId[0] : params.threadId;

  const { data, loading, error, reload } = useApiQuery<ThreadPayload>(
    threadId ? `/api/inbox/${threadId}` : null,
    auth,
  );

  const [content, setContent] = useState('');
  const [subject, setSubject] = useState('');
  const [sending, setSending] = useState(false);
  const [sendError, setSendError] = useState<string | null>(null);
  const [sendHint, setSendHint] = useState<string | null>(null);

  const channel = data?.thread?.channel ?? '';
  const canReply = REPLYABLE_CHANNELS.has(channel);
  const messages = data?.items ?? [];

  const subtitle = useMemo(() => {
    const parts = [
      CHANNEL_LABELS[channel] ?? channel,
      data?.thread?.assignee?.name ? `مسئول: ${data.thread.assignee.name}` : null,
    ].filter(Boolean);
    return parts.join(' · ') || undefined;
  }, [channel, data?.thread?.assignee?.name]);

  async function sendReply() {
    if (!auth || !threadId || !content.trim() || !canReply) return;
    setSending(true);
    setSendError(null);
    setSendHint(null);
    try {
      const result = await apiPost<{
        deliveryStatus?: string;
        errorMessage?: string;
      }>(`/api/inbox/${threadId}`, auth, {
        content: content.trim(),
        ...(channel === 'EMAIL' && subject.trim() ? { subject: subject.trim() } : {}),
      });
      setContent('');
      if (result.deliveryStatus === 'failed') {
        setSendHint(result.errorMessage ?? 'پیام ثبت شد اما ارسال کانال ناموفق بود');
      }
      await reload();
    } catch (err) {
      setSendError(err instanceof Error ? err.message : 'ارسال ناموفق');
    } finally {
      setSending(false);
    }
  }

  if (loading && !data) {
    return (
      <Screen>
        <LoadingState />
      </Screen>
    );
  }

  if ((error && !data) || !threadId) {
    return (
      <Screen>
        <ErrorState message={error ?? 'مکالمه یافت نشد'} onRetry={reload} />
      </Screen>
    );
  }

  return (
    <Screen>
      <KeyboardAvoidingView
        style={styles.flex}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        keyboardVerticalOffset={24}
      >
        <ScreenHeader title="مکالمه" subtitle={subtitle} />
        <Text style={styles.back} onPress={() => router.back()}>
          ← بازگشت به صندوق
        </Text>

        <FlatList
          data={messages}
          keyExtractor={(item) => item.id}
          contentContainerStyle={styles.list}
          ListEmptyComponent={<EmptyState message="پیامی در این مکالمه ثبت نشده." />}
          renderItem={({ item }) => {
            const outbound = item.direction === 'OUTBOUND';
            return (
              <View style={[styles.bubble, outbound ? styles.outbound : styles.inbound]}>
                <Text style={styles.bubbleText}>{item.content}</Text>
                <Text style={styles.meta}>
                  {[
                    item.senderName,
                    formatDate(item.sentAt),
                    item.status === 'failed' ? 'ناموفق' : null,
                  ]
                    .filter(Boolean)
                    .join(' · ')}
                </Text>
              </View>
            );
          }}
        />

        {canReply ? (
          <View style={styles.composer}>
            {channel === 'EMAIL' ? (
              <TextField
                label="موضوع ایمیل"
                value={subject}
                onChangeText={setSubject}
                placeholder="موضوع (اختیاری)"
              />
            ) : null}
            <TextField
              label="پاسخ"
              value={content}
              onChangeText={setContent}
              multiline
              placeholder={
                channel === 'SMS'
                  ? 'متن پیامک…'
                  : channel === 'EMAIL'
                    ? 'متن ایمیل…'
                    : 'متن پاسخ…'
              }
            />
            {sendError ? <Text style={styles.error}>{sendError}</Text> : null}
            {sendHint ? <Text style={styles.hint}>{sendHint}</Text> : null}
            <PrimaryButton
              label={sending ? 'در حال ارسال…' : 'ارسال پاسخ'}
              onPress={() => void sendReply()}
              disabled={sending || !content.trim()}
            />
          </View>
        ) : (
          <Text style={styles.readOnlyHint}>
            {channel === 'PHONE'
              ? 'تماس‌های VoIP فقط از webhook ثبت می‌شوند و از اپ قابل پاسخ نیستند.'
              : 'ارسال پاسخ برای این کانال در اپ پشتیبانی نمی‌شود.'}
          </Text>
        )}
      </KeyboardAvoidingView>
    </Screen>
  );
}

const styles = StyleSheet.create({
  flex: { flex: 1 },
  back: {
    color: colors.primary,
    marginBottom: spacing.sm,
    textAlign: 'right',
  },
  list: {
    paddingBottom: spacing.md,
    flexGrow: 1,
  },
  bubble: {
    borderRadius: radius.md,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    marginBottom: spacing.sm,
    maxWidth: '88%',
  },
  outbound: {
    alignSelf: 'flex-start',
    backgroundColor: colors.surfaceAlt,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: colors.primary,
  },
  inbound: {
    alignSelf: 'flex-end',
    backgroundColor: colors.surface,
  },
  bubbleText: {
    color: colors.text,
    fontSize: 14,
    lineHeight: 22,
    textAlign: 'right',
  },
  meta: {
    marginTop: 4,
    color: colors.textMuted,
    fontSize: 11,
    textAlign: 'right',
  },
  composer: {
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: colors.border,
    paddingTop: spacing.sm,
  },
  error: {
    color: colors.danger,
    textAlign: 'center',
    marginBottom: spacing.sm,
  },
  hint: {
    color: colors.warning,
    textAlign: 'center',
    fontSize: 12,
    marginBottom: spacing.sm,
  },
  readOnlyHint: {
    color: colors.textMuted,
    fontSize: 12,
    textAlign: 'center',
    lineHeight: 20,
    marginTop: spacing.sm,
    marginBottom: spacing.md,
  },
});
