import { useState } from 'react';
import { KeyboardAvoidingView, Platform, ScrollView, StyleSheet, Text, View } from 'react-native';
import { useRouter } from 'expo-router';

import { useAuth } from '@/auth/AuthContext';
import { PrimaryButton, TextField } from '@/components/ui';
import { APP_NAME, APP_TAGLINE } from '@/config';
import { colors, spacing } from '@/theme';

export default function LoginScreen() {
  const { login } = useAuth();
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleLogin() {
    setLoading(true);
    setError(null);
    try {
      const redirectTo = await login(email.trim(), password);
      if (redirectTo.includes('onboarding')) {
        router.replace('/(app)/feature/onboarding');
      } else if (redirectTo.includes('workspace')) {
        router.replace('/workspace/select');
      } else {
        router.replace('/(app)');
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'ورود ناموفق');
    } finally {
      setLoading(false);
    }
  }

  return (
    <KeyboardAvoidingView
      style={styles.root}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      <ScrollView contentContainerStyle={styles.container} keyboardShouldPersistTaps="handled">
        <View style={styles.hero}>
          <Text style={styles.brand}>{APP_NAME}</Text>
          <Text style={styles.tagline}>{APP_TAGLINE}</Text>
        </View>

        <TextField
          label="ایمیل"
          value={email}
          onChangeText={setEmail}
          keyboardType="email-address"
          autoCapitalize="none"
        />
        <TextField
          label="رمز عبور"
          value={password}
          onChangeText={setPassword}
          secureTextEntry
          autoCapitalize="none"
        />

        {error ? <Text style={styles.error}>{error}</Text> : null}

        <PrimaryButton
          label={loading ? 'در حال ورود…' : 'ورود'}
          onPress={handleLogin}
          disabled={loading || !email || !password}
        />
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: colors.background,
  },
  container: {
    flexGrow: 1,
    justifyContent: 'center',
    padding: spacing.lg,
  },
  hero: {
    marginBottom: spacing.xl,
    alignItems: 'center',
  },
  brand: {
    color: colors.text,
    fontSize: 32,
    fontWeight: '800',
  },
  tagline: {
    color: colors.textMuted,
    fontSize: 14,
    marginTop: spacing.sm,
    textAlign: 'center',
  },
  error: {
    color: colors.danger,
    textAlign: 'center',
    marginBottom: spacing.md,
  },
});
