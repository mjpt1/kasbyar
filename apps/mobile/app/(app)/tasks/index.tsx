import { useState } from 'react';
import { FlatList, StyleSheet, Text } from 'react-native';

import { apiPost } from '@/api/client';
import { useAuthCredentials } from '@/auth/AuthContext';
import { ChipRow, ListRow, OfflineBanner, PrimaryButton, TextField } from '@/components/ui';
import { EmptyState, ErrorState, LoadingState, Screen, ScreenHeader } from '@/components/Screen';
import { useCachedQuery } from '@/hooks/useCachedQuery';
import { TASK_PRIORITY_LABELS, formatFaDate } from '@/utils/format';
import { colors, spacing } from '@/theme';

type TaskItem = {
  id: string;
  title: string;
  status?: string;
  priority?: string;
  dueDate?: string | null;
};

type TasksResponse = { items?: TaskItem[] } | TaskItem[];

export default function TasksScreen() {
  const auth = useAuthCredentials();
  const { data, loading, error, reload, fromCache, cachedAt } = useCachedQuery<TasksResponse>(
    '/api/tasks',
    auth,
  );
  const [creating, setCreating] = useState(false);
  const [title, setTitle] = useState('');
  const [priority, setPriority] = useState('MEDIUM');
  const [saving, setSaving] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);

  const items = Array.isArray(data) ? data : (data?.items ?? []);

  async function createTask() {
    if (!auth) return;
    setSaving(true);
    setFormError(null);
    try {
      await apiPost('/api/tasks', auth, { title: title.trim(), priority });
      setTitle('');
      setCreating(false);
      await reload();
    } catch (err) {
      setFormError(err instanceof Error ? err.message : 'خطا');
    } finally {
      setSaving(false);
    }
  }

  if (loading && !data) {
    return (
      <Screen>
        <LoadingState />
      </Screen>
    );
  }

  if (error && !data) {
    return (
      <Screen>
        <ErrorState message={error} onRetry={reload} />
      </Screen>
    );
  }

  if (creating) {
    return (
      <Screen>
        <ScreenHeader title="وظیفه جدید" />
        <TextField label="عنوان" value={title} onChangeText={setTitle} />
        <Text style={styles.label}>اولویت</Text>
        <ChipRow
          options={Object.entries(TASK_PRIORITY_LABELS).map(([value, label]) => ({ value, label }))}
          value={priority}
          onChange={setPriority}
        />
        {formError ? <Text style={styles.error}>{formError}</Text> : null}
        <PrimaryButton
          label={saving ? '…' : 'ذخیره'}
          onPress={createTask}
          disabled={saving || title.trim().length < 2}
        />
        <Text style={styles.link} onPress={() => setCreating(false)}>
          انصراف
        </Text>
      </Screen>
    );
  }

  return (
    <Screen>
      <ScreenHeader title="وظایف" subtitle="لیست کارهای تیم" />
      <OfflineBanner visible={fromCache} cachedAt={cachedAt} />
      <PrimaryButton label="وظیفه جدید" onPress={() => setCreating(true)} />
      <FlatList
        data={items}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.list}
        renderItem={({ item }) => (
          <ListRow
            title={item.title}
            subtitle={item.dueDate ? formatFaDate(item.dueDate) : item.status}
            meta={TASK_PRIORITY_LABELS[item.priority ?? ''] ?? item.priority}
          />
        )}
        ListEmptyComponent={<EmptyState message="وظیفه‌ای نیست." />}
      />
    </Screen>
  );
}

const styles = StyleSheet.create({
  list: { marginTop: spacing.md },
  label: { color: colors.textMuted, textAlign: 'right', marginBottom: spacing.xs },
  error: { color: colors.danger, textAlign: 'center', marginBottom: spacing.sm },
  link: { color: colors.primary, textAlign: 'center', marginTop: spacing.md },
});
