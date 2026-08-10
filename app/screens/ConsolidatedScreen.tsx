import { useEffect, useState } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { ConsolidatedTotalsCard } from '../components/ConsolidatedTotalsCard';
import { Mascot, type MascotMood } from '../components/Mascot';
import { StreakBadge } from '../components/StreakBadge';
import { colors, font, spacing } from '../design/tokens';
import { useAuth } from '../lib/AuthContext';
import { pingBackendHealth } from '../lib/backend';
import { recordAppOpen, type StreakOpenResult } from '../lib/streaks';
import { supabase } from '../lib/supabase';

// Placeholder (D-052/BQ-014 scope), plus the backend connectivity check this
// build task is scoped to include.
export function ConsolidatedScreen() {
  const { userId } = useAuth();
  const [status, setStatus] = useState<{ ok: boolean; detail: string } | null>(null);
  const [streak, setStreak] = useState<StreakOpenResult | null>(null);

  useEffect(() => {
    pingBackendHealth().then(setStatus);
  }, []);

  // D-060/BQ-029/BQ-030/BQ-031: report the app-open event once per mount (the tab a user
  // lands on after auth). The backend decides whether today's a new streak day and
  // whether the variable reward fires; the mascot's mood just reflects that back.
  useEffect(() => {
    if (!userId) return;
    recordAppOpen(userId)
      .then(setStreak)
      .catch(() => {
        // Streak reporting is a nice-to-have, not core functionality — a failed call
        // (e.g. backend unreachable) shouldn't block or error the rest of the screen.
      });
  }, [userId]);

  const mascotMood: MascotMood = streak?.reward_fired ? 'celebrating' : 'neutral';

  return (
    <View style={styles.container}>
      <Mascot mood={mascotMood} />
      <StreakBadge currentStreak={streak?.current_streak ?? 0} />
      <Text style={styles.title}>Consolidated view</Text>
      <ConsolidatedTotalsCard userId={userId} />

      <View style={styles.statusBox}>
        <Text style={styles.statusLabel}>BACKEND HEALTH</Text>
        {/* Not a financial figure (P10 doesn't apply) — this is a system diagnostic, so
            danger is a genuine error state (unreachable), not a valence judgement. */}
        <Text style={status?.ok ? styles.statusOk : styles.statusFail}>
          {status ? `${status.ok ? 'OK' : 'unreachable'} — ${status.detail}` : 'checking…'}
        </Text>
      </View>

      <Pressable style={styles.signOut} onPress={() => supabase?.auth.signOut()}>
        <Text style={styles.signOutText}>Sign out</Text>
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, alignItems: 'center', justifyContent: 'center', backgroundColor: colors.screen },
  title: {
    fontFamily: font.ui,
    fontSize: 20,
    fontWeight: '600',
    color: colors.ink,
    marginBottom: spacing.sm,
  },
  statusBox: { alignItems: 'center', marginTop: spacing.lg, marginBottom: spacing.xxl },
  statusLabel: {
    fontFamily: font.mono,
    fontSize: 11,
    letterSpacing: 1,
    textTransform: 'uppercase',
    color: colors.inkMuted,
    marginBottom: spacing.xs,
  },
  statusOk: { fontFamily: font.ui, color: colors.ink, fontWeight: '600' },
  statusFail: { fontFamily: font.ui, color: colors.danger, fontWeight: '600' },
  signOut: { padding: spacing.md },
  // Signing out destroys nothing — colors.danger was wrong here (reserved for genuine
  // error/destructive states, not a routine account action).
  signOutText: { fontFamily: font.ui, color: colors.inkSecondary },
});
