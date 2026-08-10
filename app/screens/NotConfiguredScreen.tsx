import { StyleSheet, Text, View } from 'react-native';
import { colors, font, spacing } from '../design/tokens';

// Shown when app/.env is missing EXPO_PUBLIC_SUPABASE_URL / EXPO_PUBLIC_SUPABASE_ANON_KEY
// (D-052's dependency flag) — a clear state instead of a crash.
export function NotConfiguredScreen() {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>Supabase not configured</Text>
      <Text style={styles.body}>
        Add EXPO_PUBLIC_SUPABASE_URL and EXPO_PUBLIC_SUPABASE_ANON_KEY to app/.env (see
        app/.env.example), then restart the dev server.
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: spacing.xl,
    backgroundColor: colors.screen,
  },
  title: {
    fontSize: 20,
    fontWeight: '600',
    marginBottom: spacing.md,
    color: colors.ink,
    fontFamily: font.ui,
  },
  body: {
    fontSize: 14,
    textAlign: 'center',
    color: colors.inkSecondary,
    fontFamily: font.ui,
  },
});
