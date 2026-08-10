import { useState } from 'react';
import { Pressable, StyleSheet, Text, TextInput, View } from 'react-native';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import { supabase } from '../lib/supabase';
import type { AuthStackParamList } from '../navigation/types';
import { colors, font, radius, spacing } from '../design/tokens';

type Props = NativeStackScreenProps<AuthStackParamList, 'Login'>;

export function LoginScreen({ navigation }: Props) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  async function handleLogin() {
    if (!supabase) return;
    setSubmitting(true);
    setError(null);
    const { error: signInError } = await supabase.auth.signInWithPassword({ email, password });
    setSubmitting(false);
    if (signInError) setError(signInError.message);
    // On success, RootNavigator's onAuthStateChange listener switches to MainTabs.
  }

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Log in</Text>

      <View style={styles.field}>
        <Text style={styles.label}>Email</Text>
        <TextInput
          style={styles.input}
          placeholder="you@example.com"
          placeholderTextColor={colors.inkMuted}
          autoCapitalize="none"
          keyboardType="email-address"
          value={email}
          onChangeText={setEmail}
        />
      </View>

      <View style={styles.field}>
        <Text style={styles.label}>Password</Text>
        <TextInput
          style={styles.input}
          placeholder="••••••••"
          placeholderTextColor={colors.inkMuted}
          secureTextEntry
          value={password}
          onChangeText={setPassword}
        />
      </View>

      {error && <Text style={styles.error}>{error}</Text>}

      <Pressable style={styles.button} onPress={handleLogin} disabled={submitting}>
        <Text style={styles.buttonText}>{submitting ? 'Logging in…' : 'Log in'}</Text>
      </Pressable>

      <Pressable onPress={() => navigation.navigate('Register')} hitSlop={8}>
        <Text style={styles.link}>Don't have an account? Register</Text>
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    padding: spacing.xl,
    backgroundColor: colors.screen,
  },
  title: {
    fontSize: 24,
    fontWeight: '700',
    marginBottom: spacing.xxl,
    color: colors.ink,
    fontFamily: font.ui,
  },
  field: { marginBottom: spacing.lg },
  label: {
    fontSize: 11,
    fontFamily: font.mono,
    color: colors.inkMuted,
    textTransform: 'uppercase',
    letterSpacing: 1,
    marginBottom: spacing.sm,
  },
  input: {
    borderWidth: 1,
    borderColor: colors.line,
    borderRadius: radius.md,
    padding: spacing.md,
    fontSize: 15,
    fontFamily: font.ui,
    color: colors.ink,
  },
  button: {
    backgroundColor: colors.tutor,
    borderRadius: radius.md,
    padding: spacing.md,
    alignItems: 'center',
    marginTop: spacing.sm,
  },
  buttonText: { color: colors.screen, fontWeight: '600', fontFamily: font.ui },
  link: {
    marginTop: spacing.lg,
    textAlign: 'center',
    color: colors.inkSecondary,
    fontFamily: font.ui,
  },
  error: { color: colors.danger, marginBottom: spacing.md, fontFamily: font.ui },
});
