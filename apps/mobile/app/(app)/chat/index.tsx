import { FlatList, StyleSheet, Text, View } from 'react-native';
import { useState } from 'react';

import { useAuthCredentials } from '@/auth/AuthContext';
import { apiPost } from '@/api/client';
import { ListRow, PrimaryButton, TextField } from '@/components/ui';
import { EmptyState, ErrorState, LoadingState, Screen, ScreenHeader } from '@/components/Screen';
import { useApiQuery } from '@/hooks/useApiQuery';
import { colors, spacing } from '@/theme';

type Conversation = {
  id: string;
  title?: string;
  lastMessageAt?: string;
};

type ConversationsResponse = Conversation[] | { items?: Conversation[] };

export default function ChatScreen() {
  const auth = useAuthCredentials();
  const { data, loading, error, reload } = useApiQuery<ConversationsResponse>(
    '/api/chat/conversations',
    auth,
  );
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [message, setMessage] = useState('');
  const [sending, setSending] = useState(false);
  const [sendError, setSendError] = useState<string | null>(null);

  const conversations = Array.isArray(data) ? data : (data?.items ?? []);

  async function sendMessage() {
    if (!auth || !selectedId || !message.trim()) return;
    setSending(true);
    setSendError(null);
    try {
      await apiPost(`/api/chat/conversations/${selectedId}/messages`, auth, {
        content: message.trim(),
      });
      setMessage('');
      await reload();
    } catch (err) {
      setSendError(err instanceof Error ? err.message : 'ارسال ناموفق');
    } finally {
      setSending(false);
    }
  }

  if (loading) {
    return (
      <Screen>
        <LoadingState />
      </Screen>
    );
  }

  if (error) {
    return (
      <Screen>
        <ErrorState message={error} onRetry={reload} />
      </Screen>
    );
  }

  if (selectedId) {
    return (
      <Screen>
        <ScreenHeader title="گفتگوی تیم" subtitle="ارسال پیام" />
        <Text style={styles.back} onPress={() => setSelectedId(null)}>
          ← بازگشت به لیست
        </Text>
        <TextField label="پیام" value={message} onChangeText={setMessage} />
        {sendError ? <Text style={styles.error}>{sendError}</Text> : null}
        <PrimaryButton
          label={sending ? 'در حال ارسال…' : 'ارسال پیام'}
          onPress={sendMessage}
          disabled={sending || !message.trim()}
        />
      </Screen>
    );
  }

  return (
    <Screen>
      <ScreenHeader title="گفتگوی تیم" subtitle="همگام با وب" />
      <FlatList
        data={conversations}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <ListRow
            title={item.title ?? 'گفتگو'}
            subtitle={item.lastMessageAt ? formatDate(item.lastMessageAt) : undefined}
            onPress={() => setSelectedId(item.id)}
          />
        )}
        ListEmptyComponent={<EmptyState message="گفتگویی وجود ندارد." />}
      />
    </Screen>
  );
}

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

const styles = StyleSheet.create({
  back: {
    color: colors.primary,
    marginBottom: spacing.md,
    textAlign: 'right',
  },
  error: {
    color: colors.danger,
    marginBottom: spacing.sm,
    textAlign: 'center',
  },
});
