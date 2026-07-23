import { Stack, useRouter, useSegments } from 'expo-router';
import * as Linking from 'expo-linking';
import * as Notifications from 'expo-notifications';
import { useEffect, useRef } from 'react';
import { I18nManager, StatusBar } from 'react-native';

import { AuthProvider, useAuth } from '@/auth/AuthContext';
import { resolveDeepLink } from '@/navigation/deeplink';
import { hrefFromNotificationData, registerForPushNotifications } from '@/push/register';
import { colors } from '@/theme';

if (!I18nManager.isRTL) {
  I18nManager.allowRTL(true);
  I18nManager.forceRTL(true);
}

function useDeepLinks() {
  const router = useRouter();
  const { auth } = useAuth();

  useEffect(() => {
    function handleUrl(url: string | null) {
      if (!url || !auth) return;
      try {
        const parsed = Linking.parse(url);
        const path = parsed.path ? `/${parsed.path}` : url;
        router.push(resolveDeepLink(path) as never);
      } catch {
        // ignore malformed urls
      }
    }

    void Linking.getInitialURL().then(handleUrl);
    const sub = Linking.addEventListener('url', (event) => handleUrl(event.url));
    return () => sub.remove();
  }, [auth, router]);
}

function usePushRouting() {
  const router = useRouter();
  const { auth } = useAuth();
  const registered = useRef(false);

  useEffect(() => {
    if (!auth?.credentials || registered.current) return;
    registered.current = true;
    void registerForPushNotifications(auth.credentials).catch(() => undefined);
  }, [auth?.credentials]);

  useEffect(() => {
    if (!auth) return;

    function openFromData(data: Record<string, unknown> | undefined) {
      const href = hrefFromNotificationData(data);
      if (href) router.push(resolveDeepLink(href) as never);
    }

    void Notifications.getLastNotificationResponseAsync().then((response) => {
      openFromData(response?.notification.request.content.data as Record<string, unknown>);
    });

    const sub = Notifications.addNotificationResponseReceivedListener((response) => {
      openFromData(response.notification.request.content.data as Record<string, unknown>);
    });
    return () => sub.remove();
  }, [auth, router]);
}

function RootNavigator() {
  const { loading, auth } = useAuth();
  const segments = useSegments();
  const router = useRouter();
  useDeepLinks();
  usePushRouting();

  useEffect(() => {
    if (loading) return;
    const inAuth = segments[0] === '(auth)';
    if (!auth && !inAuth) {
      router.replace('/(auth)/login');
      return;
    }
    if (auth && inAuth) {
      router.replace('/(app)');
    }
  }, [loading, auth, segments, router]);

  return (
    <>
      <StatusBar barStyle="light-content" backgroundColor={colors.background} />
      <Stack
        screenOptions={{
          headerShown: false,
          contentStyle: { backgroundColor: colors.background },
        }}
      >
        <Stack.Screen name="(auth)" />
        <Stack.Screen name="(app)" />
        <Stack.Screen name="workspace" options={{ presentation: 'modal' }} />
      </Stack>
    </>
  );
}

export default function RootLayout() {
  return (
    <AuthProvider>
      <RootNavigator />
    </AuthProvider>
  );
}
