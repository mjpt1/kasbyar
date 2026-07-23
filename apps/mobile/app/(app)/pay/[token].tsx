import { ScrollView, StyleSheet, Text, View } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import * as Linking from 'expo-linking';

import { PrimaryButton } from '@/components/ui';
import { Screen, ScreenHeader } from '@/components/Screen';
import { API_BASE_URL } from '@/config';
import { colors, spacing } from '@/theme';

/** Deep-link landing for payment tokens — opens secure web checkout. */
export default function PayDeepLinkScreen() {
  const { token } = useLocalSearchParams<{ token: string }>();
  const router = useRouter();
  const payUrl = token ? `${API_BASE_URL}/pay/${token}` : null;

  return (
    <Screen>
      <ScrollView>
        <Text style={styles.back} onPress={() => router.back()}>
          ← بازگشت
        </Text>
        <ScreenHeader
          title="پرداخت آنلاین"
          subtitle="ادامه در درگاه امن کسب‌یار"
        />
        <View style={styles.box}>
          <Text style={styles.row}>
            برای تکمیل پرداخت به صفحه امن وب هدایت می‌شوید. پس از پرداخت، وضعیت فاکتور در اپ همگام می‌شود.
          </Text>
        </View>
        <PrimaryButton
          label="ادامه پرداخت"
          onPress={() => {
            if (payUrl) void Linking.openURL(payUrl);
          }}
          disabled={!payUrl}
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
    padding: spacing.lg,
    marginBottom: spacing.lg,
    borderWidth: 1,
    borderColor: colors.border,
  },
  row: { color: colors.textMuted, textAlign: 'right', lineHeight: 24 },
});
