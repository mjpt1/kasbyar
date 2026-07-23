import { FlatList, StyleSheet, Text } from 'react-native';
import { useRouter } from 'expo-router';

import { useAuth } from '@/auth/AuthContext';
import { ListRow, PrimaryButton } from '@/components/ui';
import { Screen, ScreenHeader } from '@/components/Screen';
import { colors, spacing } from '@/theme';

export default function WorkspaceSelectScreen() {
  const { auth, selectWorkspace } = useAuth();
  const router = useRouter();

  if (!auth) return null;

  return (
    <Screen>
      <ScreenHeader title="انتخاب فضای کاری" subtitle="سازمان فعال خود را انتخاب کنید" />
      <FlatList
        data={auth.workspaces}
        keyExtractor={(item) => item.organizationId}
        renderItem={({ item }) => (
          <ListRow
            title={item.organizationName}
            subtitle={item.role}
            onPress={async () => {
              await selectWorkspace(item.organizationId);
              router.replace('/(app)');
            }}
          />
        )}
      />
      <Text style={styles.hint}>پس از انتخاب، تمام داده‌ها با همان سازمان همگام می‌شوند.</Text>
      <PrimaryButton label="بازگشت" onPress={() => router.back()} />
    </Screen>
  );
}

const styles = StyleSheet.create({
  hint: {
    color: colors.textMuted,
    fontSize: 13,
    textAlign: 'center',
    marginVertical: spacing.md,
  },
});
