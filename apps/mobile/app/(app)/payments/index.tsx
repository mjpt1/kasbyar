import { FlatList } from 'react-native';

import { useAuthCredentials } from '@/auth/AuthContext';
import { ListRow, OfflineBanner } from '@/components/ui';
import { EmptyState, ErrorState, LoadingState, Screen, ScreenHeader } from '@/components/Screen';
import { useCachedQuery } from '@/hooks/useCachedQuery';
import { formatFaDate, formatFaNumber } from '@/utils/format';

type PaymentItem = {
  id: string;
  amount: number;
  method?: string;
  paidAt?: string;
  customer?: { name?: string } | null;
};

type PaymentsResponse = { items?: PaymentItem[] } | PaymentItem[];

export default function PaymentsScreen() {
  const auth = useAuthCredentials();
  const { data, loading, error, reload, fromCache, cachedAt } =
    useCachedQuery<PaymentsResponse>('/api/payments', auth);

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

  const items = Array.isArray(data) ? data : (data?.items ?? []);

  return (
    <Screen>
      <ScreenHeader title="پرداخت‌ها" subtitle="تراکنش‌های ثبت‌شده" />
      <OfflineBanner visible={fromCache} cachedAt={cachedAt} />
      <FlatList
        data={items}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <ListRow
            title={formatFaNumber(item.amount)}
            subtitle={item.customer?.name ?? item.method}
            meta={item.paidAt ? formatFaDate(item.paidAt) : undefined}
          />
        )}
        ListEmptyComponent={<EmptyState message="پرداختی ثبت نشده." />}
      />
    </Screen>
  );
}
