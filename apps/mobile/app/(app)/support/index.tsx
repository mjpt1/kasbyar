import { FlatList, StyleSheet, Text } from 'react-native';
import { useState } from 'react';

import { useAuthCredentials } from '@/auth/AuthContext';
import { apiPost } from '@/api/client';
import { ListRow, PrimaryButton, TextField } from '@/components/ui';
import { EmptyState, ErrorState, LoadingState, Screen, ScreenHeader } from '@/components/Screen';
import { useApiQuery } from '@/hooks/useApiQuery';
import { colors, spacing } from '@/theme';

type Ticket = {
  id: string;
  subject: string;
  status?: string;
  priority?: string;
  createdAt?: string;
};

type TicketsResponse = Ticket[] | { items?: Ticket[] };

export default function SupportScreen() {
  const auth = useAuthCredentials();
  const { data, loading, error, reload } = useApiQuery<TicketsResponse>(
    '/api/support/tickets',
    auth,
  );
  const [creating, setCreating] = useState(false);
  const [subject, setSubject] = useState('');
  const [body, setBody] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);

  const tickets = Array.isArray(data) ? data : (data?.items ?? []);

  async function createTicket() {
    if (!auth) return;
    setSubmitting(true);
    setFormError(null);
    try {
      await apiPost('/api/support/tickets', auth, {
        subject: subject.trim(),
        body: body.trim(),
      });
      setSubject('');
      setBody('');
      setCreating(false);
      await reload();
    } catch (err) {
      setFormError(err instanceof Error ? err.message : 'ثبت تیکت ناموفق');
    } finally {
      setSubmitting(false);
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

  if (creating) {
    return (
      <Screen>
        <ScreenHeader title="تیکت جدید" subtitle="پشتیبانی کسب‌یار" />
        <TextField label="موضوع" value={subject} onChangeText={setSubject} />
        <TextField label="شرح مشکل" value={body} onChangeText={setBody} />
        {formError ? <Text style={styles.error}>{formError}</Text> : null}
        <PrimaryButton
          label={submitting ? 'در حال ثبت…' : 'ثبت تیکت'}
          onPress={createTicket}
          disabled={submitting || !subject.trim() || !body.trim()}
        />
        <Text style={styles.link} onPress={() => setCreating(false)}>
          انصراف
        </Text>
      </Screen>
    );
  }

  return (
    <Screen>
      <ScreenHeader title="پشتیبانی" subtitle="تیکت‌های شما" />
      <PrimaryButton label="تیکت جدید" onPress={() => setCreating(true)} />
      <FlatList
        data={tickets}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <ListRow
            title={item.subject}
            subtitle={item.status}
            meta={item.priority}
          />
        )}
        ListEmptyComponent={<EmptyState message="تیکتی ثبت نشده است." />}
        contentContainerStyle={{ marginTop: spacing.md }}
      />
    </Screen>
  );
}

const styles = StyleSheet.create({
  error: {
    color: colors.danger,
    textAlign: 'center',
    marginBottom: spacing.sm,
  },
  link: {
    color: colors.primary,
    textAlign: 'center',
    marginTop: spacing.md,
  },
});
