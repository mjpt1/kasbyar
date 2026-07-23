import { Tabs } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';

import { colors } from '@/theme';

export default function AppTabsLayout() {
  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarStyle: {
          backgroundColor: colors.surface,
          borderTopColor: colors.border,
        },
        tabBarActiveTintColor: colors.primary,
        tabBarInactiveTintColor: colors.textMuted,
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          title: 'داشبورد',
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="grid-outline" color={color} size={size} />
          ),
        }}
      />
      <Tabs.Screen
        name="leads/index"
        options={{
          title: 'سرنخ‌ها',
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="flag-outline" color={color} size={size} />
          ),
        }}
      />
      <Tabs.Screen
        name="customers/index"
        options={{
          title: 'مشتریان',
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="people-outline" color={color} size={size} />
          ),
        }}
      />
      <Tabs.Screen
        name="invoices/index"
        options={{
          title: 'فاکتورها',
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="receipt-outline" color={color} size={size} />
          ),
        }}
      />
      <Tabs.Screen
        name="more/index"
        options={{
          title: 'بیشتر',
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="menu-outline" color={color} size={size} />
          ),
        }}
      />
      <Tabs.Screen name="leads/[id]" options={{ href: null }} />
      <Tabs.Screen name="customers/[id]" options={{ href: null }} />
      <Tabs.Screen name="invoices/[id]" options={{ href: null }} />
      <Tabs.Screen name="chat/index" options={{ href: null }} />
      <Tabs.Screen name="support/index" options={{ href: null }} />
      <Tabs.Screen name="tasks/index" options={{ href: null }} />
      <Tabs.Screen name="payments/index" options={{ href: null }} />
      <Tabs.Screen name="notifications/index" options={{ href: null }} />
      <Tabs.Screen name="settings/index" options={{ href: null }} />
      <Tabs.Screen name="conversation/index" options={{ href: null }} />
      <Tabs.Screen name="command/index" options={{ href: null }} />
      <Tabs.Screen name="pay/[token]" options={{ href: null }} />
      <Tabs.Screen name="feature/[...path]" options={{ href: null }} />
    </Tabs>
  );
}
