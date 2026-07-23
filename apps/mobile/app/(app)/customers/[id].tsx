import { useState } from 'react';
import { ScrollView, StyleSheet, Text } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';

import { apiPatch } from '@/api/client';
import { useAuthCredentials } from '@/auth/AuthContext';
import { OfflineBanner, PrimaryButton, TextField } from '@/components/ui';
import { ErrorState, LoadingState, Screen, ScreenHeader } from '@/components/Screen';
import { useCachedQuery } from '@/hooks/useCachedQuery';
import { colors, spacing } from '@/theme';

type CustomerDetail = {
  id: string;
  name: string;
  phone?: string | null;
  email?: string | null;
  company?: string | null;
  address?: string | null;
  notes?: string | null;
};

export default function CustomerDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const auth = useAuthCredentials();
  const router = useRouter();
  const { data, loading, error, reload, fromCache, cachedAt } =
    useCachedQuery<CustomerDetail>(id ? `/api/customers/${id}` : null, auth);

  const [name, setName] = useState<string | null>(null);
  const [phone, setPhone] = useState<string | null>(null);
  const [notes, setNotes] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const [msg, setMsg] = useState<string | null>(null);

  if (loading && !data) {
    return (
      <Screen>
        <LoadingState />
      </Screen>
    );
  }

  if ((error && !data) || !data) {
    return (
      <Screen>
        <ErrorState message={error ?? 'مشتری پیدا نشد'} onRetry={reload} />
      </Screen>
    );
  }

  async function save() {
    if (!auth || !id || !data) return;
    setSaving(true);
    setMsg(null);
    try {
      await apiPatch(`/api/customers/${id}`, auth, {
        name: (name ?? data.name).trim(),
        phone: (phone ?? data.phone ?? '') || undefined,
        notes: (notes ?? data.notes ?? '') || undefined,
      });
      setMsg('ذخیره شد');
      await reload();
    } catch (err) {
      setMsg(err instanceof Error ? err.message : 'خطا');
    } finally {
      setSaving(false);
    }
  }

  return (
    <Screen>
      <ScrollView>
        <Text style={styles.back} onPress={() => router.back()}>
          ← بازگشت
        </Text>
        <ScreenHeader title="ویرایش مشتری" subtitle={data.company ?? undefined} />
        <OfflineBanner visible={fromCache} cachedAt={cachedAt} />
        <TextField label="نام" value={name ?? data.name} onChangeText={setName} />
        <TextField
          label="موبایل"
          value={phone ?? data.phone ?? ''}
          onChangeText={setPhone}
          keyboardType="phone-pad"
        />
        <TextField
          label="یادداشت"
          value={notes ?? data.notes ?? ''}
          onChangeText={setNotes}
          multiline
        />
        {msg ? <Text style={styles.msg}>{msg}</Text> : null}
        <PrimaryButton label={saving ? '…' : 'ذخیره'} onPress={save} disabled={saving} />
      </ScrollView>
    </Screen>
  );
}

const styles = StyleSheet.create({
  back: { color: colors.primary, textAlign: 'right', marginBottom: spacing.sm },
  msg: { color: colors.primary, textAlign: 'center', marginBottom: spacing.sm },
});
