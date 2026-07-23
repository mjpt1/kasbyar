import { FlatList, StyleSheet, Text, View } from 'react-native';
import { useRouter } from 'expo-router';

import { useAuth, useSession } from '@/auth/AuthContext';
import { ListRow, PrimaryButton } from '@/components/ui';
import { Screen, ScreenHeader } from '@/components/Screen';
import { getMobileMenuItems, webPathToMobileRoute } from '@/navigation/menu';
import { colors, spacing } from '@/theme';

export default function MoreScreen() {
  const router = useRouter();
  const { logout, auth } = useAuth();
  const session = useSession();

  const items = session ? getMobileMenuItems(session) : [];

  let lastSection: string | undefined;

  return (
    <Screen>
      <ScreenHeader
        title="همه امکانات"
        subtitle={session?.organizationName ?? undefined}
      />

      {auth && auth.workspaces.length > 1 ? (
        <PrimaryButton
          label="تغییر فضای کاری"
          onPress={() => router.push('/workspace/select')}
        />
      ) : null}

      <FlatList
        data={items}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.list}
        renderItem={({ item }) => {
          const showSection = item.section && item.section !== lastSection;
          if (item.section) lastSection = item.section;
          return (
            <View>
              {showSection ? <Text style={styles.section}>{item.section}</Text> : null}
              <ListRow
                title={item.label}
                onPress={() => router.push(webPathToMobileRoute(item.href) as never)}
              />
            </View>
          );
        }}
        ListFooterComponent={
          <View style={styles.footer}>
            <PrimaryButton label="خروج از حساب" onPress={() => void logout()} />
          </View>
        }
      />
    </Screen>
  );
}

const styles = StyleSheet.create({
  list: {
    paddingBottom: spacing.xl,
  },
  section: {
    color: colors.primary,
    fontSize: 13,
    fontWeight: '700',
    marginTop: spacing.md,
    marginBottom: spacing.xs,
    textAlign: 'right',
  },
  footer: {
    marginTop: spacing.lg,
  },
});
