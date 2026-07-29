import { FlatList, StyleSheet, Text, View } from 'react-native';

import { useAuthCredentials } from '@/auth/AuthContext';
import { ListRow, OfflineBanner } from '@/components/ui';
import { EmptyState, ErrorState, LoadingState, Screen, ScreenHeader } from '@/components/Screen';
import { useCachedQuery } from '@/hooks/useCachedQuery';
import { colors, spacing } from '@/theme';

type InboxThread = {
  id: string;
  channel: string;
  customerName?: string | null;
  leadTitle?: string | null;
  externalPhone?: string | null;
  externalEmail?: string | null;
  lastMessagePreview?: string | null;
  lastMessageAt?: string | null;
  unreadCount?: number;
  assigneeName?: string | null;
};

type InboxResponse = { items?: InboxThread[] };

const CHANNEL_LABELS: Record<string, string> = {
  WHATSAPP: 'واتساپ',
  SMS: 'پیامک',
  EMAIL: 'ایمیل',
  PHONE: 'تماس',
  TELEGRAM: 'تلگرام',
  INSTAGRAM: 'اینستاگرام',
};

function threadTitle(thread: InboxThread): string {
  return (
    thread.customerName ??
    thread.leadTitle ??
    thread.externalPhone ??
    thread.externalEmail ??
    '—'
  );
}

export default function InboxScreen() {
  const auth = useAuthCredentials();
  const { data, loading, error, reload, fromCache, cachedAt } = useCachedQuery<InboxResponse>(
    '/api/inbox?page=1',
    auth,
  );

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

  const items = data?.items ?? [];

  return (
    <Screen>
      <ScreenHeader
        title="صندوق پیام"
        subtitle="مکالمات omnichannel — برای پاسخ کامل از وب‌اپ استفاده کنید"
      />
      <OfflineBanner visible={fromCache} cachedAt={cachedAt} />
      <FlatList
        data={items}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.list}
        renderItem={({ item }) => (
          <ListRow
            title={threadTitle(item)}
            subtitle={item.lastMessagePreview ?? undefined}
            meta={[
              CHANNEL_LABELS[item.channel] ?? item.channel,
              item.unreadCount ? `${item.unreadCount} خوانده‌نشده` : null,
              item.assigneeName ? `مسئول: ${item.assigneeName}` : null,
            ]
              .filter(Boolean)
              .join(' · ')}
          />
        )}
        ListEmptyComponent={
          <EmptyState message="مکالمه‌ای ثبت نشده. webhook کانال‌ها را در تنظیمات وب پیکربندی کنید." />
        }
      />
      <Text style={styles.hint}>
        ارسال پاسخ و تخصیص مسئول در نسخه وب (/inbox) در دسترس است.
      </Text>
    </Screen>
  );
}

const styles = StyleSheet.create({
  list: { marginTop: spacing.md, paddingBottom: spacing.md },
  hint: {
    color: colors.textMuted,
    fontSize: 12,
    textAlign: 'center',
    marginTop: spacing.sm,
    lineHeight: 20,
  },
});
