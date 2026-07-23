import { useState } from 'react';
import { ScrollView, StyleSheet, Text, View } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import * as Linking from 'expo-linking';

import { apiPost } from '@/api/client';
import { useAuthCredentials } from '@/auth/AuthContext';
import { OfflineBanner, PrimaryButton } from '@/components/ui';
import { ErrorState, LoadingState, Screen, ScreenHeader } from '@/components/Screen';
import { useCachedQuery } from '@/hooks/useCachedQuery';
import { INVOICE_STATUS_LABELS, formatFaDate, formatFaNumber } from '@/utils/format';
import { colors, spacing } from '@/theme';

type InvoiceDetail = {
  id: string;
  number?: string;
  status?: string;
  totalAmount?: number;
  notes?: string | null;
  dueDate?: string | null;
  customer?: { name?: string; phone?: string } | null;
  items?: { description: string; quantity: number; unitPrice: number }[];
};

export default function InvoiceDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const auth = useAuthCredentials();
  const router = useRouter();
  const { data, loading, error, reload, fromCache, cachedAt } =
    useCachedQuery<InvoiceDetail>(id ? `/api/invoices/${id}` : null, auth);
  const [busy, setBusy] = useState(false);
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
        <ErrorState message={error ?? 'فاکتور پیدا نشد'} onRetry={reload} />
      </Screen>
    );
  }

  async function createPaymentLink() {
    if (!auth || !id) return;
    setBusy(true);
    setMsg(null);
    try {
      const result = await apiPost<{ url?: string; token?: string }>(
        `/api/invoices/${id}/payment-link`,
        auth,
        { provider: 'ZARINPAL' },
      );
      if (result.url) {
        await Linking.openURL(result.url);
      } else if (result.token) {
        router.push(`/(app)/pay/${result.token}`);
      } else {
        setMsg('لینک پرداخت ساخته شد');
      }
      await reload();
    } catch (err) {
      setMsg(err instanceof Error ? err.message : 'خطا در ساخت لینک');
    } finally {
      setBusy(false);
    }
  }

  return (
    <Screen>
      <ScrollView>
        <Text style={styles.back} onPress={() => router.back()}>
          ← بازگشت
        </Text>
        <ScreenHeader
          title={data.number ? `فاکتور ${data.number}` : 'فاکتور'}
          subtitle={data.customer?.name}
        />
        <OfflineBanner visible={fromCache} cachedAt={cachedAt} />

        <View style={styles.box}>
          <Text style={styles.row}>
            وضعیت: {INVOICE_STATUS_LABELS[data.status ?? ''] ?? data.status}
          </Text>
          <Text style={styles.row}>مبلغ: {formatFaNumber(data.totalAmount)}</Text>
          {data.dueDate ? <Text style={styles.row}>سررسید: {formatFaDate(data.dueDate)}</Text> : null}
        </View>

        {(data.items ?? []).map((item, idx) => (
          <View key={idx} style={styles.item}>
            <Text style={styles.itemTitle}>{item.description}</Text>
            <Text style={styles.itemMeta}>
              {formatFaNumber(item.quantity)} × {formatFaNumber(item.unitPrice)}
            </Text>
          </View>
        ))}

        {msg ? <Text style={styles.msg}>{msg}</Text> : null}
        <PrimaryButton
          label={busy ? '…' : 'ساخت لینک پرداخت'}
          onPress={createPaymentLink}
          disabled={busy}
        />
      </ScrollView>
    </Screen>
  );
}

const styles = StyleSheet.create({
  back: { color: colors.primary, textAlign: 'right', marginBottom: spacing.sm },
  box: {
    backgroundColor: colors.surface,
    borderRadius: 12,
    padding: spacing.md,
    marginBottom: spacing.md,
    borderWidth: 1,
    borderColor: colors.border,
  },
  row: { color: colors.text, textAlign: 'right', marginBottom: spacing.xs },
  item: {
    backgroundColor: colors.surface,
    borderRadius: 8,
    padding: spacing.md,
    marginBottom: spacing.sm,
    borderWidth: 1,
    borderColor: colors.border,
  },
  itemTitle: { color: colors.text, textAlign: 'right' },
  itemMeta: { color: colors.textMuted, textAlign: 'right', marginTop: 4 },
  msg: { color: colors.primary, textAlign: 'center', marginVertical: spacing.sm },
});
