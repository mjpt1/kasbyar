import { ScrollView, StyleSheet, Text, View } from 'react-native';
import { useRouter } from 'expo-router';

import { useAuthCredentials, useSession } from '@/auth/AuthContext';
import { Card, OfflineBanner } from '@/components/ui';
import { ErrorState, LoadingState, Screen, ScreenHeader } from '@/components/Screen';
import { useCachedQuery } from '@/hooks/useCachedQuery';
import { formatFaNumber } from '@/utils/format';
import { colors, spacing } from '@/theme';

type DashboardData = {
  stats?: {
    todaySales?: number;
    openInvoices?: number;
    overdueReceivables?: number;
    activeLeads?: number;
    pendingTasks?: number;
    newCustomersThisMonth?: number;
  };
};

export default function DashboardScreen() {
  const auth = useAuthCredentials();
  const session = useSession();
  const router = useRouter();
  const { data, loading, error, reload, fromCache, cachedAt } = useCachedQuery<DashboardData>(
    '/api/dashboard',
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

  const stats = data?.stats;

  return (
    <Screen>
      <ScrollView showsVerticalScrollIndicator={false}>
        <ScreenHeader
          title={`سلام ${session?.user.name ?? ''}`}
          subtitle={session?.organizationName}
        />
        <OfflineBanner visible={fromCache} cachedAt={cachedAt} />

        <View style={styles.grid}>
          <Card title="فروش امروز" value={formatFaNumber(stats?.todaySales)} />
          <Card title="فاکتور باز" value={formatFaNumber(stats?.openInvoices)} />
          <Card title="مطالبات معوق" value={formatFaNumber(stats?.overdueReceivables)} />
          <Card title="سرنخ فعال" value={formatFaNumber(stats?.activeLeads)} />
          <Card title="وظایف باز" value={formatFaNumber(stats?.pendingTasks)} />
          <Card
            title="مشتری جدید (ماه)"
            value={formatFaNumber(stats?.newCustomersThisMonth)}
          />
        </View>

        <Text style={styles.section}>دسترسی سریع</Text>
        <Card
          title="گفتگوی تیم"
          subtitle="پیام‌های تیم سازمان"
          onPress={() => router.push('/(app)/chat')}
        />
        <Card
          title="دستیار هوشمند"
          subtitle="پرسش و پاسخ کسب‌وکار"
          onPress={() => router.push('/(app)/conversation')}
        />
        <Card
          title="اعلان‌ها"
          subtitle="خبرهای سازمان"
          onPress={() => router.push('/(app)/notifications')}
        />
        <Card
          title="همه امکانات"
          subtitle="منوی کامل برنامه"
          onPress={() => router.push('/(app)/more')}
        />
      </ScrollView>
    </Screen>
  );
}

const styles = StyleSheet.create({
  grid: {
    gap: spacing.sm,
  },
  section: {
    color: colors.text,
    fontSize: 18,
    fontWeight: '700',
    marginTop: spacing.lg,
    marginBottom: spacing.sm,
    textAlign: 'right',
  },
});
