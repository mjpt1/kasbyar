import { useState } from 'react';
import { FlatList, StyleSheet, Text, View } from 'react-native';
import { useRouter } from 'expo-router';

import { apiPost } from '@/api/client';
import { useAuthCredentials } from '@/auth/AuthContext';
import { ListRow, OfflineBanner, PrimaryButton, TextField } from '@/components/ui';
import { EmptyState, ErrorState, LoadingState, Screen, ScreenHeader } from '@/components/Screen';
import { useCachedQuery } from '@/hooks/useCachedQuery';
import { INVOICE_STATUS_LABELS, formatFaNumber } from '@/utils/format';
import { colors, spacing } from '@/theme';

type InvoiceItem = {
  id: string;
  number?: string;
  status?: string;
  totalAmount?: number;
  customerName?: string | null;
  customer?: { name?: string } | null;
};

type InvoicesResponse = { items?: InvoiceItem[] };
type CustomersResponse = { items?: { id: string; name: string }[] };

export default function InvoicesScreen() {
  const auth = useAuthCredentials();
  const router = useRouter();
  const { data, loading, error, reload, fromCache, cachedAt } =
    useCachedQuery<InvoicesResponse>('/api/invoices?page=1', auth);
  const customersQuery = useCachedQuery<CustomersResponse>('/api/customers?page=1', auth);

  const [creating, setCreating] = useState(false);
  const [customerId, setCustomerId] = useState('');
  const [description, setDescription] = useState('خدمات');
  const [quantity, setQuantity] = useState('1');
  const [unitPrice, setUnitPrice] = useState('');
  const [saving, setSaving] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);

  async function createInvoice() {
    if (!auth) return;
    setSaving(true);
    setFormError(null);
    try {
      await apiPost('/api/invoices', auth, {
        customerId,
        kind: 'SALE',
        items: [
          {
            description: description.trim() || 'آیتم',
            quantity: Number(quantity) || 1,
            unitPrice: Number(unitPrice) || 0,
          },
        ],
      });
      setCreating(false);
      setCustomerId('');
      setUnitPrice('');
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
    const customers = customersQuery.data?.items ?? [];
    return (
      <Screen>
        <ScreenHeader title="فاکتور جدید" subtitle="ثبت سریع یک‌آیتمی" />
        <Text style={styles.label}>مشتری</Text>
        <FlatList
          data={customers}
          keyExtractor={(c) => c.id}
          style={{ maxHeight: 180 }}
          renderItem={({ item }) => (
            <ListRow
              title={item.name}
              meta={customerId === item.id ? '✓' : undefined}
              onPress={() => setCustomerId(item.id)}
            />
          )}
          ListEmptyComponent={<EmptyState message="ابتدا مشتری ثبت کنید." />}
        />
        <TextField label="شرح" value={description} onChangeText={setDescription} />
        <TextField
          label="تعداد"
          value={quantity}
          onChangeText={setQuantity}
          keyboardType="numeric"
        />
        <TextField
          label="مبلغ واحد (ریال)"
          value={unitPrice}
          onChangeText={setUnitPrice}
          keyboardType="numeric"
        />
        {formError ? <Text style={styles.error}>{formError}</Text> : null}
        <PrimaryButton
          label={saving ? 'در حال ذخیره…' : 'ثبت فاکتور'}
          onPress={createInvoice}
          disabled={saving || !customerId || !unitPrice}
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
      <ScreenHeader title="فاکتورها" subtitle="ایجاد و مشاهده" />
      <OfflineBanner visible={fromCache} cachedAt={cachedAt} />
      <PrimaryButton label="فاکتور جدید" onPress={() => setCreating(true)} />
      <FlatList
        data={items}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.list}
        renderItem={({ item }) => (
          <ListRow
            title={item.number ? `فاکتور ${item.number}` : item.id.slice(0, 8)}
            subtitle={item.customerName ?? item.customer?.name ?? undefined}
            meta={
              item.totalAmount !== undefined
                ? formatFaNumber(item.totalAmount)
                : INVOICE_STATUS_LABELS[item.status ?? ''] ?? item.status
            }
            onPress={() => router.push(`/(app)/invoices/${item.id}`)}
          />
        )}
        ListEmptyComponent={<EmptyState message="فاکتوری ثبت نشده است." />}
      />
    </Screen>
  );
}

const styles = StyleSheet.create({
  list: { marginTop: spacing.md, paddingBottom: spacing.xl },
  label: { color: colors.textMuted, textAlign: 'right', marginBottom: spacing.xs },
  error: { color: colors.danger, textAlign: 'center', marginBottom: spacing.sm },
  link: { color: colors.primary, textAlign: 'center', marginTop: spacing.md },
});
