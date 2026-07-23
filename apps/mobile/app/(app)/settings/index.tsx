import { useEffect, useState } from 'react';
import { ScrollView, StyleSheet, Text, Switch, View } from 'react-native';

import { useAuth, useAuthCredentials, useSession } from '@/auth/AuthContext';
import { OfflineBanner, PrimaryButton } from '@/components/ui';
import { ErrorState, LoadingState, Screen, ScreenHeader } from '@/components/Screen';
import { useCachedQuery } from '@/hooks/useCachedQuery';
import {
  registerForPushNotifications,
  unregisterPushNotifications,
} from '@/push/register';
import { colors, spacing } from '@/theme';

type SettingsData = Record<string, unknown>;

export default function SettingsScreen() {
  const auth = useAuthCredentials();
  const session = useSession();
  const { logout } = useAuth();
  const { data, loading, error, reload, fromCache, cachedAt } =
    useCachedQuery<SettingsData>('/api/settings', auth);
  const [pushEnabled, setPushEnabled] = useState(false);
  const [pushToken, setPushToken] = useState<string | null>(null);
  const [pushMsg, setPushMsg] = useState<string | null>(null);

  useEffect(() => {
    // best-effort: try register once when settings opens
  }, []);

  async function togglePush(next: boolean) {
    if (!auth) return;
    setPushMsg(null);
    try {
      if (next) {
        const token = await registerForPushNotifications(auth);
        if (!token) {
          setPushMsg('مجوز اعلان داده نشد یا دستگاه پشتیبانی نمی‌کند');
          setPushEnabled(false);
          return;
        }
        setPushToken(token);
        setPushEnabled(true);
        setPushMsg('اعلان‌های موبایل فعال شد');
      } else if (pushToken) {
        await unregisterPushNotifications(auth, pushToken);
        setPushToken(null);
        setPushEnabled(false);
        setPushMsg('اعلان‌ها غیرفعال شد');
      }
    } catch (err) {
      setPushMsg(err instanceof Error ? err.message : 'خطا در تنظیم اعلان');
      setPushEnabled(false);
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

  return (
    <Screen>
      <ScrollView>
        <ScreenHeader title="تنظیمات" subtitle={session?.organizationName} />
        <OfflineBanner visible={fromCache} cachedAt={cachedAt} />

        <View style={styles.card}>
          <Text style={styles.cardTitle}>حساب کاربری</Text>
          <Text style={styles.row}>{session?.user.name}</Text>
          <Text style={styles.muted}>{session?.user.email}</Text>
          <Text style={styles.muted}>نقش: {session?.role}</Text>
        </View>

        <View style={styles.card}>
          <Text style={styles.cardTitle}>اعلان‌های موبایل</Text>
          <View style={styles.switchRow}>
            <Switch
              value={pushEnabled}
              onValueChange={(v) => void togglePush(v)}
              trackColor={{ true: colors.primaryDark, false: colors.border }}
            />
            <Text style={styles.row}>فعال‌سازی Push</Text>
          </View>
          {pushMsg ? <Text style={styles.msg}>{pushMsg}</Text> : null}
        </View>

        {data ? (
          <View style={styles.card}>
            <Text style={styles.cardTitle}>تنظیمات سازمان</Text>
            <Text style={styles.json}>{JSON.stringify(data, null, 2)}</Text>
          </View>
        ) : null}

        <PrimaryButton label="خروج از حساب" onPress={() => void logout()} />
      </ScrollView>
    </Screen>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: colors.surface,
    borderRadius: 12,
    padding: spacing.md,
    marginBottom: spacing.md,
    borderWidth: 1,
    borderColor: colors.border,
  },
  cardTitle: {
    color: colors.primary,
    fontWeight: '700',
    textAlign: 'right',
    marginBottom: spacing.sm,
  },
  row: { color: colors.text, textAlign: 'right' },
  muted: { color: colors.textMuted, textAlign: 'right', marginTop: 4 },
  switchRow: {
    flexDirection: 'row-reverse',
    alignItems: 'center',
    gap: spacing.md,
  },
  msg: { color: colors.warning, textAlign: 'right', marginTop: spacing.sm, fontSize: 13 },
  json: {
    color: colors.textMuted,
    fontSize: 11,
    fontFamily: 'monospace',
    textAlign: 'left',
    writingDirection: 'ltr',
  },
});
