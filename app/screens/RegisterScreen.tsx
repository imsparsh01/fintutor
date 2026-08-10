import { useState } from 'react';
import { Pressable, StyleSheet, Text, TextInput, View } from 'react-native';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import { supabase } from '../lib/supabase';
import type { AuthStackParamList } from '../navigation/types';
import { colors, font, radius, spacing } from '../design/tokens';
import { typography } from '../design/typography';

type Props = NativeStackScreenProps<AuthStackParamList, 'Register'>;

export function RegisterScreen({ navigation }: Props) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [info, setInfo] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  async function handleRegister() {
    if (!supabase) return;
    setSubmitting(true);
    setError(null);
    setInfo(null);
    const { error: signUpError } = await supabase.auth.signUp({ email, password });
    setSubmitting(false);
    if (signUpError) {
      setError(signUpError.message);
      return;
    }
    setInfo('Check your email to confirm your account, then log in.');
  }

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Register</Text>

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
      {info && <Text style={styles.info}>{info}</Text>}

      <Pressable style={styles.button} onPress={handleRegister} disabled={submitting}>
        <Text style={styles.buttonText}>{submitting ? 'Registering…' : 'Register'}</Text>
      </Pressable>

      <Pressable onPress={() => navigation.navigate('Login')} hitSlop={8}>
        <Text style={styles.link}>Already have an account? Log in</Text>
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
    fontSize: 20,
    marginBottom: spacing.xxl,
    color: colors.ink,
    fontFamily: font.uiSemibold,
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
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: colors.line,
    borderRadius: radius.md,
    padding: spacing.md,
    fontSize: 15,
    fontFamily: font.ui,
    color: colors.ink,
  },
  // Primary button spec (1C).
  button: {
    backgroundColor: colors.tutor,
    borderRadius: radius.md,
    paddingVertical: 14,
    alignItems: 'center',
    marginTop: spacing.sm,
  },
  buttonText: typography.primaryButtonText,
  link: {
    marginTop: spacing.lg,
    textAlign: 'center',
    color: colors.inkSecondary,
    fontFamily: font.ui,
  },
  error: { color: colors.danger, marginBottom: spacing.md, fontFamily: font.ui },
  info: { color: colors.tutor, marginBottom: spacing.md, fontFamily: font.ui },
});
