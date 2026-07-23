import { useState } from 'react';
import { ScrollView, StyleSheet, Text } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';

import { apiPatch } from '@/api/client';
import { useAuthCredentials } from '@/auth/AuthContext';
import { ChipRow, OfflineBanner, PrimaryButton, TextField } from '@/components/ui';
import { ErrorState, LoadingState, Screen, ScreenHeader } from '@/components/Screen';
import { useCachedQuery } from '@/hooks/useCachedQuery';
import { LEAD_STATUS_LABELS, formatFaNumber } from '@/utils/format';
import { colors, spacing } from '@/theme';

type LeadDetail = {
  id: string;
  title: string;
  status?: string;
  contactName?: string | null;
  contactPhone?: string | null;
  contactEmail?: string | null;
  description?: string | null;
  value?: number | null;
};

const STATUS_OPTIONS = Object.entries(LEAD_STATUS_LABELS).map(([value, label]) => ({
  value,
  label,
}));

export default function LeadDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const auth = useAuthCredentials();
  const router = useRouter();
  const { data, loading, error, reload, fromCache, cachedAt } = useCachedQuery<LeadDetail>(
    id ? `/api/leads/${id}` : null,
    auth,
  );
  const [status, setStatus] = useState<string | null>(null);
  const [note, setNote] = useState('');
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
        <ErrorState message={error ?? 'سرنخ پیدا نشد'} onRetry={reload} />
      </Screen>
    );
  }

  const currentStatus = status ?? data.status ?? 'NEW';

  async function save() {
    if (!auth || !id) return;
    setSaving(true);
    setMsg(null);
    try {
      await apiPatch(`/api/leads/${id}`, auth, {
        status: currentStatus,
        description: note.trim() || undefined,
      });
      setMsg('ذخیره شد');
      await reload();
    } catch (err) {
      setMsg(err instanceof Error ? err.message : 'خطا در ذخیره');
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
        <ScreenHeader title={data.title} subtitle={data.contactName ?? undefined} />
        <OfflineBanner visible={fromCache} cachedAt={cachedAt} />
        <Text style={styles.meta}>
          {[data.contactPhone, data.contactEmail].filter(Boolean).join(' · ')}
        </Text>
        {data.value != null ? (
          <Text style={styles.meta}>ارزش: {formatFaNumber(data.value)}</Text>
        ) : null}
        {data.description ? <Text style={styles.body}>{data.description}</Text> : null}

        <Text style={styles.label}>وضعیت</Text>
        <ChipRow
          options={STATUS_OPTIONS}
          value={currentStatus}
          onChange={setStatus}
        />
        <TextField
          label="یادداشت / توضیحات"
          value={note}
          onChangeText={setNote}
          multiline
          placeholder={data.description ?? ''}
        />
        {msg ? <Text style={styles.msg}>{msg}</Text> : null}
        <PrimaryButton label={saving ? 'در حال ذخیره…' : 'ذخیره تغییرات'} onPress={save} disabled={saving} />
      </ScrollView>
    </Screen>
  );
}

const styles = StyleSheet.create({
  back: { color: colors.primary, textAlign: 'right', marginBottom: spacing.sm },
  meta: { color: colors.textMuted, textAlign: 'right', marginBottom: spacing.xs },
  body: { color: colors.text, textAlign: 'right', marginVertical: spacing.md, lineHeight: 22 },
  label: { color: colors.textMuted, textAlign: 'right', marginBottom: spacing.xs, marginTop: spacing.md },
  msg: { color: colors.primary, textAlign: 'center', marginBottom: spacing.sm },
});
