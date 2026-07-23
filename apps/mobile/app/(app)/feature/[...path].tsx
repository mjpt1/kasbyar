import { ScrollView, StyleSheet, Text, View } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';

import { useAuthCredentials } from '@/auth/AuthContext';
import { OfflineBanner } from '@/components/ui';
import { ErrorState, LoadingState, Screen, ScreenHeader } from '@/components/Screen';
import { featureApiPath } from '@/navigation/menu';
import { useCachedQuery } from '@/hooks/useCachedQuery';
import { colors, spacing } from '@/theme';

function ViewBlock({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <View style={styles.block}>
      <Text style={styles.blockTitle}>{title}</Text>
      {children}
    </View>
  );
}

function renderValue(value: unknown): React.ReactNode {
  if (value == null) return <Text style={styles.muted}>—</Text>;
  if (typeof value === 'string' || typeof value === 'number' || typeof value === 'boolean') {
    return <Text style={styles.value}>{String(value)}</Text>;
  }
  if (Array.isArray(value)) {
    if (value.length === 0) return <Text style={styles.muted}>خالی</Text>;
    return (
      <>
        {value.slice(0, 20).map((item, i) => (
          <ViewBlock key={i} title={`#${i + 1}`}>
            {renderValue(item)}
          </ViewBlock>
        ))}
      </>
    );
  }
  if (typeof value === 'object') {
    return (
      <>
        {Object.entries(value as Record<string, unknown>)
          .slice(0, 30)
          .map(([k, v]) => (
            <ViewBlock key={k} title={k}>
              {renderValue(v)}
            </ViewBlock>
          ))}
      </>
    );
  }
  return <Text style={styles.muted}>{String(value)}</Text>;
}

export default function FeatureScreen() {
  const params = useLocalSearchParams<{ path: string | string[] }>();
  const segments = Array.isArray(params.path) ? params.path : params.path ? [params.path] : [];
  const webPath = `/${segments.map(decodeURIComponent).join('/')}`;
  const auth = useAuthCredentials();
  const router = useRouter();
  const apiPath = featureApiPath(webPath);

  const { data, loading, error, reload, fromCache, cachedAt } = useCachedQuery<unknown>(
    apiPath,
    auth,
  );

  const title = segments.map(decodeURIComponent).join(' / ') || 'امکان';

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

  return (
    <Screen>
      <ScrollView>
        <Text style={styles.back} onPress={() => router.back()}>
          ← بازگشت
        </Text>
        <ScreenHeader title={title} subtitle="داده زنده سازمان" />
        <OfflineBanner visible={fromCache} cachedAt={cachedAt} />
        {renderValue(data)}
      </ScrollView>
    </Screen>
  );
}

const styles = StyleSheet.create({
  back: { color: colors.primary, textAlign: 'right', marginBottom: spacing.sm },
  block: {
    backgroundColor: colors.surface,
    borderRadius: 10,
    padding: spacing.md,
    marginBottom: spacing.sm,
    borderWidth: 1,
    borderColor: colors.border,
  },
  blockTitle: {
    color: colors.primary,
    fontWeight: '700',
    textAlign: 'right',
    marginBottom: spacing.xs,
  },
  value: { color: colors.text, textAlign: 'right' },
  muted: { color: colors.textMuted, textAlign: 'right' },
});
