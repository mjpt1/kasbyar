import { useState } from 'react';
import { FlatList, StyleSheet, Text, View } from 'react-native';
import { useRouter } from 'expo-router';

import { apiPost } from '@/api/client';
import { useAuthCredentials } from '@/auth/AuthContext';
import {
  ChipRow,
  ListRow,
  OfflineBanner,
  PrimaryButton,
  TextField,
} from '@/components/ui';
import { EmptyState, ErrorState, LoadingState, Screen, ScreenHeader } from '@/components/Screen';
import { useCachedQuery } from '@/hooks/useCachedQuery';
import { LEAD_STATUS_LABELS } from '@/utils/format';
import { colors, spacing } from '@/theme';

type LeadItem = {
  id: string;
  title: string;
  status?: string;
  contactName?: string | null;
  contactPhone?: string | null;
  value?: number | null;
};

type LeadsResponse = { items?: LeadItem[] };

const STATUS_OPTIONS = Object.entries(LEAD_STATUS_LABELS).map(([value, label]) => ({
  value,
  label,
}));

export default function LeadsScreen() {
  const auth = useAuthCredentials();
  const router = useRouter();
  const { data, loading, error, reload, fromCache, cachedAt } = useCachedQuery<LeadsResponse>(
    '/api/leads?page=1',
    auth,
  );
  const [creating, setCreating] = useState(false);
  const [title, setTitle] = useState('');
  const [contactName, setContactName] = useState('');
  const [contactPhone, setContactPhone] = useState('');
  const [status, setStatus] = useState('NEW');
  const [saving, setSaving] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);

  async function createLead() {
    if (!auth) return;
    setSaving(true);
    setFormError(null);
    try {
      await apiPost('/api/leads', auth, {
        title: title.trim(),
        contactName: contactName.trim() || undefined,
        contactPhone: contactPhone.trim() || undefined,
        status,
        source: 'OTHER',
      });
      setTitle('');
      setContactName('');
      setContactPhone('');
      setStatus('NEW');
      setCreating(false);
      await reload();
    } catch (err) {
      setFormError(err instanceof Error ? err.message : 'ثبت ناموفق');
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
        <ScreenHeader title="سرنخ جدید" subtitle="ثبت سریع از موبایل" />
        <TextField label="عنوان" value={title} onChangeText={setTitle} />
        <TextField label="نام مخاطب" value={contactName} onChangeText={setContactName} />
        <TextField
          label="موبایل"
          value={contactPhone}
          onChangeText={setContactPhone}
          keyboardType="phone-pad"
        />
        <Text style={styles.label}>وضعیت</Text>
        <ChipRow options={STATUS_OPTIONS} value={status} onChange={setStatus} />
        {formError ? <Text style={styles.error}>{formError}</Text> : null}
        <PrimaryButton
          label={saving ? 'در حال ذخیره…' : 'ذخیره'}
          onPress={createLead}
          disabled={saving || title.trim().length < 2}
        />
        <Text style={styles.link} onPress={() => setCreating(false)}>
          انصراف
        </Text>
      </Screen>
    );
  }

  const items = data?.items ?? [];

  return (
    <Screen>
      <ScreenHeader title="سرنخ‌های فروش" subtitle="ایجاد و پیگیری سریع" />
      <OfflineBanner visible={fromCache} cachedAt={cachedAt} />
      <PrimaryButton label="سرنخ جدید" onPress={() => setCreating(true)} />
      <FlatList
        data={items}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.list}
        renderItem={({ item }) => (
          <ListRow
            title={item.title}
            subtitle={[item.contactName, item.contactPhone].filter(Boolean).join(' · ') || undefined}
            meta={LEAD_STATUS_LABELS[item.status ?? ''] ?? item.status}
            onPress={() => router.push(`/(app)/leads/${item.id}`)}
          />
        )}
        ListEmptyComponent={<EmptyState message="سرنخی ثبت نشده است." />}
      />
    </Screen>
  );
}

const styles = StyleSheet.create({
  list: { marginTop: spacing.md, paddingBottom: spacing.xl },
  label: {
    color: colors.textMuted,
    fontSize: 13,
    textAlign: 'right',
    marginBottom: spacing.xs,
  },
  error: { color: colors.danger, textAlign: 'center', marginBottom: spacing.sm },
  link: { color: colors.primary, textAlign: 'center', marginTop: spacing.md },
});
