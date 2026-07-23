import { FlatList, StyleSheet, Text } from 'react-native';
import { useRouter } from 'expo-router';

import { apiPost } from '@/api/client';
import { useAuthCredentials } from '@/auth/AuthContext';
import { ListRow, OfflineBanner, PrimaryButton } from '@/components/ui';
import { EmptyState, ErrorState, LoadingState, Screen, ScreenHeader } from '@/components/Screen';
import { useCachedQuery } from '@/hooks/useCachedQuery';
import { resolveDeepLink } from '@/navigation/deeplink';
import { formatFaDate } from '@/utils/format';
import { colors, spacing } from '@/theme';

type NotificationItem = {
  id: string;
  title: string;
  body: string;
  href?: string | null;
  readAt?: string | null;
  createdAt?: string;
};

type NotificationsResponse = { items?: NotificationItem[] } | NotificationItem[];

export default function NotificationsScreen() {
  const auth = useAuthCredentials();
  const router = useRouter();
  const { data, loading, error, reload, fromCache, cachedAt } =
    useCachedQuery<NotificationsResponse>('/api/notifications', auth);

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

  async function markAllRead() {
    if (!auth) return;
    try {
      await apiPost('/api/notifications', auth, { action: 'read-all' });
    } catch {
      // some APIs use PATCH — ignore and reload
    }
    await reload();
  }

  return (
    <Screen>
      <ScreenHeader title="اعلان‌ها" />
      <OfflineBanner visible={fromCache} cachedAt={cachedAt} />
      <PrimaryButton label="تازه‌سازی" onPress={() => void reload()} />
      <FlatList
        data={items}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.list}
        renderItem={({ item }) => (
          <ListRow
            title={item.title}
            subtitle={item.body}
            meta={item.readAt ? undefined : 'جدید'}
            onPress={() => {
              if (item.href) router.push(resolveDeepLink(item.href) as never);
            }}
          />
        )}
        ListEmptyComponent={<EmptyState message="اعلانی نیست." />}
        ListHeaderComponent={
          items.some((i) => !i.readAt) ? (
            <Text style={styles.hint} onPress={() => void markAllRead()}>
              علامت‌گذاری همه به‌عنوان خوانده‌شده
            </Text>
          ) : null
        }
      />
    </Screen>
  );
}

const styles = StyleSheet.create({
  list: { marginTop: spacing.md },
  hint: { color: colors.primary, textAlign: 'center', marginBottom: spacing.sm },
});
