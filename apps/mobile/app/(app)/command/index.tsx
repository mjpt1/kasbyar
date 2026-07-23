import { ScrollView, StyleSheet, Text, View } from 'react-native';

import { useAuthCredentials } from '@/auth/AuthContext';
import { Card, OfflineBanner, PrimaryButton } from '@/components/ui';
import { ErrorState, LoadingState, Screen, ScreenHeader } from '@/components/Screen';
import { useCachedQuery } from '@/hooks/useCachedQuery';
import { colors, spacing } from '@/theme';

type BriefingData = {
  summary?: string;
  highlights?: string[];
  actions?: string[];
  date?: string;
  content?: string;
};

export default function CommandScreen() {
  const auth = useAuthCredentials();
  const { data, loading, error, reload, fromCache, cachedAt } =
    useCachedQuery<BriefingData>('/api/briefing/daily', auth);

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

  const highlights = data?.highlights ?? [];
  const actions = data?.actions ?? [];
  const body = data?.summary ?? data?.content;

  return (
    <Screen>
      <ScrollView>
        <ScreenHeader title="اتاق فرمان" subtitle="بریفینگ روزانه" />
        <OfflineBanner visible={fromCache} cachedAt={cachedAt} />
        <PrimaryButton label="تازه‌سازی" onPress={() => void reload()} />

        {body ? (
          <View style={styles.box}>
            <Text style={styles.body}>{body}</Text>
          </View>
        ) : null}

        {highlights.length > 0 ? (
          <>
            <Text style={styles.section}>نکات کلیدی</Text>
            {highlights.map((h, i) => (
              <Card key={i} title={`نکته ${i + 1}`} subtitle={h} />
            ))}
          </>
        ) : null}

        {actions.length > 0 ? (
          <>
            <Text style={styles.section}>اقدامات پیشنهادی</Text>
            {actions.map((a, i) => (
              <Card key={i} title={`اقدام ${i + 1}`} subtitle={a} />
            ))}
          </>
        ) : null}

        {!body && highlights.length === 0 && actions.length === 0 ? (
          <Text style={styles.empty}>بریفینگی برای امروز موجود نیست.</Text>
        ) : null}
      </ScrollView>
    </Screen>
  );
}

const styles = StyleSheet.create({
  box: {
    backgroundColor: colors.surface,
    borderRadius: 12,
    padding: spacing.md,
    marginVertical: spacing.md,
    borderWidth: 1,
    borderColor: colors.border,
  },
  body: { color: colors.text, textAlign: 'right', lineHeight: 24 },
  section: {
    color: colors.text,
    fontWeight: '700',
    fontSize: 16,
    textAlign: 'right',
    marginVertical: spacing.sm,
  },
  empty: { color: colors.textMuted, textAlign: 'center', marginTop: spacing.xl },
});
