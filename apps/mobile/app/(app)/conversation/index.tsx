import { useState } from 'react';
import { FlatList, StyleSheet, Text, View } from 'react-native';

import { apiPost } from '@/api/client';
import { useAuthCredentials } from '@/auth/AuthContext';
import { OfflineBanner, PrimaryButton, TextField } from '@/components/ui';
import { ErrorState, LoadingState, Screen, ScreenHeader } from '@/components/Screen';
import { useCachedQuery } from '@/hooks/useCachedQuery';
import { colors, spacing } from '@/theme';

type Message = {
  id?: string;
  role: 'user' | 'assistant' | 'system';
  content: string;
};

type ConversationData = {
  messages?: Message[];
  reply?: string;
};

export default function ConversationScreen() {
  const auth = useAuthCredentials();
  const { data, loading, error, reload, fromCache, cachedAt } =
    useCachedQuery<ConversationData>('/api/conversation', auth);
  const [input, setInput] = useState('');
  const [localMessages, setLocalMessages] = useState<Message[]>([]);
  const [sending, setSending] = useState(false);
  const [sendError, setSendError] = useState<string | null>(null);

  const messages = [
    ...(data?.messages ?? []),
    ...localMessages,
  ];

  async function send() {
    if (!auth || !input.trim()) return;
    const text = input.trim();
    setInput('');
    setSending(true);
    setSendError(null);
    setLocalMessages((prev) => [...prev, { role: 'user', content: text }]);
    try {
      const result = await apiPost<ConversationData>('/api/conversation', auth, {
        message: text,
      });
      const reply =
        result.reply ??
        result.messages?.filter((m) => m.role === 'assistant').at(-1)?.content;
      if (reply) {
        setLocalMessages((prev) => [...prev, { role: 'assistant', content: reply }]);
      }
      await reload();
      setLocalMessages([]);
    } catch (err) {
      setSendError(err instanceof Error ? err.message : 'ارسال ناموفق');
    } finally {
      setSending(false);
    }
  }

  if (loading && !data && messages.length === 0) {
    return (
      <Screen>
        <LoadingState />
      </Screen>
    );
  }

  if (error && !data && messages.length === 0) {
    return (
      <Screen>
        <ErrorState message={error} onRetry={reload} />
      </Screen>
    );
  }

  return (
    <Screen>
      <ScreenHeader title="دستیار هوشمند" subtitle="گفتگو با کسب‌یار" />
      <OfflineBanner visible={fromCache} cachedAt={cachedAt} />
      <FlatList
        data={messages}
        keyExtractor={(_, i) => String(i)}
        style={styles.list}
        renderItem={({ item }) => (
          <View
            style={[
              styles.bubble,
              item.role === 'user' ? styles.userBubble : styles.assistantBubble,
            ]}
          >
            <Text style={styles.bubbleText}>{item.content}</Text>
          </View>
        )}
        ListEmptyComponent={
          <Text style={styles.empty}>سوال کسب‌وکارتان را بپرسید…</Text>
        }
      />
      <TextField
        label="پیام"
        value={input}
        onChangeText={setInput}
        multiline
        placeholder="مثلاً: خلاصه فروش امروز"
      />
      {sendError ? <Text style={styles.error}>{sendError}</Text> : null}
      <PrimaryButton
        label={sending ? 'در حال پاسخ…' : 'ارسال'}
        onPress={send}
        disabled={sending || !input.trim()}
      />
    </Screen>
  );
}

const styles = StyleSheet.create({
  list: { flex: 1, marginBottom: spacing.md },
  bubble: {
    borderRadius: 12,
    padding: spacing.md,
    marginBottom: spacing.sm,
    maxWidth: '90%',
  },
  userBubble: {
    backgroundColor: colors.primaryDark,
    alignSelf: 'flex-start',
  },
  assistantBubble: {
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
    alignSelf: 'flex-end',
  },
  bubbleText: { color: colors.text, textAlign: 'right', lineHeight: 22 },
  empty: { color: colors.textMuted, textAlign: 'center', marginTop: spacing.xl },
  error: { color: colors.danger, textAlign: 'center', marginBottom: spacing.sm },
});
