import * as Device from 'expo-device';
import * as Notifications from 'expo-notifications';
import { Platform } from 'react-native';

import { apiFetch, type AuthCredentials } from '@/api/client';

Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: true,
  }),
});

export async function registerForPushNotifications(
  auth: AuthCredentials,
): Promise<string | null> {
  if (!Device.isDevice && Platform.OS === 'ios') {
    return null;
  }

  const { status: existing } = await Notifications.getPermissionsAsync();
  let finalStatus = existing;
  if (existing !== 'granted') {
    const { status } = await Notifications.requestPermissionsAsync();
    finalStatus = status;
  }
  if (finalStatus !== 'granted') return null;

  if (Platform.OS === 'android') {
    await Notifications.setNotificationChannelAsync('default', {
      name: 'کسب‌یار',
      importance: Notifications.AndroidImportance.HIGH,
      vibrationPattern: [0, 250, 250, 250],
    });
  }

  const tokenData = await Notifications.getExpoPushTokenAsync();
  const token = tokenData.data;
  if (!token) return null;

  await apiFetch('/api/push/expo', auth, {
    method: 'POST',
    body: JSON.stringify({
      token,
      platform: Platform.OS,
    }),
  });

  return token;
}

export async function unregisterPushNotifications(
  auth: AuthCredentials,
  token: string,
): Promise<void> {
  await apiFetch('/api/push/expo', auth, {
    method: 'DELETE',
    body: JSON.stringify({ token }),
  }).catch(() => undefined);
}

export function hrefFromNotificationData(
  data: Record<string, unknown> | undefined,
): string | null {
  if (!data) return null;
  return typeof data.href === 'string' ? data.href : null;
}
