import { useState } from 'react';
import { FlatList, StyleSheet, Text } from 'react-native';
import { useRouter } from 'expo-router';

import { apiPost } from '@/api/client';
import { useAuthCredentials } from '@/auth/AuthContext';
import { ListRow, OfflineBanner, PrimaryButton, TextField } from '@/components/ui';
import { EmptyState, ErrorState, LoadingState, Screen, ScreenHeader } from '@/components/Screen';
import { useCachedQuery } from '@/hooks/useCachedQuery';
import { colors, spacing } from '@/theme';

type CustomerItem = {
  id: string;
  name: string;
  phone?: string | null;
  email?: string | null;
  company?: string | null;
};

type CustomersResponse = { items?: CustomerItem[] };

export default function CustomersScreen() {
  const auth = useAuthCredentials();
  const router = useRouter();
  const { data, loading, error, reload, fromCache, cachedAt } =
    useCachedQuery<CustomersResponse>('/api/customers?page=1', auth);
  const [creating, setCreating] = useState(false);
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [company, setCompany] = useState('');
  const [saving, setSaving] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);

  async function createCustomer() {
    if (!auth) return;
    setSaving(true);
    setFormError(null);
    try {
      await apiPost('/api/customers', auth, {
        name: name.trim(),
        phone: phone.trim() || undefined,
        company: company.trim() || undefined,
      });
      setName('');
      setPhone('');
      setCompany('');
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
        <ScreenHeader title="مشتری جدید" />
        <TextField label="نام" value={name} onChangeText={setName} />
        <TextField
          label="موبایل"
          value={phone}
          onChangeText={setPhone}
          keyboardType="phone-pad"
        />
        <TextField label="شرکت" value={company} onChangeText={setCompany} />
        {formError ? <Text style={styles.error}>{formError}</Text> : null}
        <PrimaryButton
          label={saving ? 'در حال ذخیره…' : 'ذخیره'}
          onPress={createCustomer}
          disabled={saving || name.trim().length < 2}
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
      <ScreenHeader title="مشتریان" subtitle="لیست و ثبت سریع" />
      <OfflineBanner visible={fromCache} cachedAt={cachedAt} />
      <PrimaryButton label="مشتری جدید" onPress={() => setCreating(true)} />
      <FlatList
        data={items}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.list}
        renderItem={({ item }) => (
          <ListRow
            title={item.name}
            subtitle={[item.company, item.phone, item.email].filter(Boolean).join(' · ') || undefined}
            onPress={() => router.push(`/(app)/customers/${item.id}`)}
          />
        )}
        ListEmptyComponent={<EmptyState message="مشتری ثبت نشده است." />}
      />
    </Screen>
  );
}

const styles = StyleSheet.create({
  list: { marginTop: spacing.md, paddingBottom: spacing.xl },
  error: { color: colors.danger, textAlign: 'center', marginBottom: spacing.sm },
  link: { color: colors.primary, textAlign: 'center', marginTop: spacing.md },
});
