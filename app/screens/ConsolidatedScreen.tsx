import { useCallback, useEffect, useState } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { useFocusEffect, useNavigation } from '@react-navigation/native';
import type { BottomTabNavigationProp } from '@react-navigation/bottom-tabs';
import { ConsolidatedTotalsCard } from '../components/ConsolidatedTotalsCard';
import { colors, font, radius, spacing } from '../design/tokens';
import { typography } from '../design/typography';
import { useAuth } from '../lib/AuthContext';
import { fetchBudget, type BudgetSummary } from '../lib/budget';
import { formatRupees } from '../lib/format';
import { recordAppOpen, type StreakOpenResult } from '../lib/streaks';
import { fetchSurfacingCandidates, type SurfacingCandidate } from '../lib/surfacing';
import { supabase } from '../lib/supabase';
import type { MainTabsParamList } from '../navigation/types';

// Home (mockup Flow 02): one layout, filled to whatever data the user has. Three family
// totals shown side by side and NEVER summed into a net-worth figure (D-065); the streak
// is a quiet mono counter that counts app opens, never money (P7/D-061); the tutor card
// carries the teaching thread. Replaces the D-052 placeholder (mascot + dev health box).
export function ConsolidatedScreen() {
  const { userId, displayName } = useAuth();
  const navigation = useNavigation<BottomTabNavigationProp<MainTabsParamList>>();
  const [budget, setBudget] = useState<BudgetSummary | null>(null);
  const [streak, setStreak] = useState<StreakOpenResult | null>(null);
  const [candidate, setCandidate] = useState<SurfacingCandidate | null>(null);
  const [dismissed, setDismissed] = useState(false);

  // Record the app-open once per mount (engagement mechanic, D-060) — the backend owns
  // whether today is a new streak day; we just reflect the count back in the header.
  useEffect(() => {
    if (!userId) return;
    recordAppOpen(userId).then(setStreak).catch(() => {});
  }, [userId]);

  const loadBudget = useCallback(() => {
    if (!userId) return;
    fetchBudget(userId).then(setBudget).catch(() => setBudget(null));
    fetchSurfacingCandidates(userId)
      .then((cs) => setCandidate(cs[0] ?? null))
      .catch(() => setCandidate(null));
  }, [userId]);

  useFocusEffect(loadBudget);

  if (!userId) return null;

  return (
    <ScrollView style={styles.screen} contentContainerStyle={styles.content}>
      {/* Header: greeting + month on the left, quiet streak counter on the right. */}
      <View style={styles.header}>
        <View style={{ flex: 1 }}>
          <Text style={styles.greeting}>{greeting(displayName)}</Text>
          <Text style={styles.month}>{currentMonthLabel()}</Text>
        </View>
        {streak && streak.current_streak > 0 && (
          <View style={styles.streak}>
            <Text style={styles.streakGlyph}>🔥</Text>
            <Text style={styles.streakCount}>{streak.current_streak}</Text>
          </View>
        )}
      </View>

      <Text style={styles.sectionLabel}>Family totals</Text>
      <ConsolidatedTotalsCard userId={userId} />

      <Text style={styles.sectionLabel}>This month</Text>
      <View style={styles.ledger}>
        {budget === null ? (
          <Text style={styles.muted}>Loading…</Text>
        ) : (
          <>
            <LedgerRow label="Income" value={formatRupees(budget.income_total)} />
            <LedgerRow
              label="Recurring outflows"
              value={formatRupees(budget.recurring_outflows_total)}
            />
            <LedgerRow label="Discretionary" value={formatRupees(budget.discretionary_total)} />
            <LedgerRow label="Net" value={formatRupees(budget.net)} bold />
          </>
        )}
      </View>

      {candidate && !dismissed && (
        <View style={styles.tutorCard}>
          <Text style={styles.tutorBody}>{tutorPrompt(candidate)}</Text>
          <View style={styles.tutorActions}>
            <Pressable
              style={styles.tutorPrimary}
              onPress={() =>
                navigation.navigate('Chat', { prefillQuestion: tutorPrefill(candidate) })
              }
            >
              <Text style={styles.tutorPrimaryText}>Show me</Text>
            </Pressable>
            <Pressable style={styles.tutorSecondary} onPress={() => setDismissed(true)}>
              <Text style={styles.tutorSecondaryText}>Not now</Text>
            </Pressable>
          </View>
        </View>
      )}

      <Pressable style={styles.signOut} onPress={() => supabase?.auth.signOut()}>
        <Text style={styles.signOutText}>Sign out</Text>
      </Pressable>
    </ScrollView>
  );
}

function LedgerRow({ label, value, bold }: { label: string; value: string; bold?: boolean }) {
  return (
    <View style={styles.row}>
      <Text style={styles.rowLabel}>{label}</Text>
      <Text style={[styles.rowValue, bold && styles.rowValueBold]}>{value}</Text>
    </View>
  );
}

function greeting(name?: string | null): string {
  const h = new Date().getHours();
  const part = h < 12 ? 'Good morning' : h < 17 ? 'Good afternoon' : 'Good evening';
  return name ? `${part}, ${name}` : part;
}

function currentMonthLabel(): string {
  return new Date().toLocaleDateString('en-IN', { month: 'long', year: 'numeric' });
}

// Presentation-only teaching invitations keyed by the backend's coded surfacing reason
// (D-051). These are offers to explain a MECHANISM, never advice to buy — the actual
// teaching happens in /chat. Falls back to a neutral phrasing for any unmapped reason.
function tutorPrompt(c: SurfacingCandidate): string {
  if (c.reason === 'loan_without_life_cover') {
    return "You're carrying a loan, but there's no term cover on record. Want to see how term insurance works — what it protects and what it costs — with your own numbers?";
  }
  return 'There’s a mechanism here worth understanding. Want to walk through it with your own numbers?';
}

function tutorPrefill(c: SurfacingCandidate): string {
  if (c.reason === 'loan_without_life_cover') {
    return 'Can you explain how term insurance works, using my own numbers?';
  }
  return 'Can you walk me through this, using my own numbers?';
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: colors.screen },
  content: { padding: spacing.xl, paddingBottom: spacing.xxxl },
  header: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: spacing.xl,
  },
  greeting: { fontFamily: font.uiSemibold, fontSize: 24, color: colors.ink },
  month: {
    fontFamily: font.mono,
    fontSize: 12,
    letterSpacing: 0.5,
    color: colors.inkMuted,
    marginTop: spacing.xs,
  },
  // Engagement layer — clay is permitted here (streak is behaviour, never a money figure).
  streak: { flexDirection: 'row', alignItems: 'center', gap: spacing.xs },
  streakGlyph: { fontSize: 14 },
  streakCount: { fontFamily: font.monoSemibold, fontSize: 15, color: colors.behaviour },
  sectionLabel: {
    fontFamily: font.mono,
    fontSize: 12,
    letterSpacing: 1,
    textTransform: 'uppercase',
    color: colors.inkMuted,
    marginTop: spacing.xl,
    marginBottom: spacing.xs,
  },
  ledger: {},
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: spacing.lg,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: colors.line,
  },
  rowLabel: {
    fontFamily: font.mono,
    fontSize: 12,
    letterSpacing: 0.5,
    textTransform: 'uppercase',
    color: colors.inkMuted,
  },
  rowValue: typography.ledgerValue,
  rowValueBold: { fontSize: 17 },
  muted: { fontFamily: font.ui, color: colors.inkMuted, paddingVertical: spacing.lg },
  // The teaching plane — tutorSoft ground, tutor voice (serif). The one card that carries
  // the screen when data is thin (mockup Flow 02).
  tutorCard: {
    backgroundColor: colors.tutorSoft,
    borderRadius: radius.lg,
    padding: spacing.lg,
    marginTop: spacing.xxl,
  },
  tutorBody: { fontFamily: font.tutor, fontSize: 16, lineHeight: 24, color: colors.ink },
  tutorActions: { flexDirection: 'row', alignItems: 'center', gap: spacing.lg, marginTop: spacing.lg },
  tutorPrimary: {
    backgroundColor: colors.tutor,
    borderRadius: radius.md,
    paddingVertical: 12,
    paddingHorizontal: spacing.xl,
  },
  tutorPrimaryText: { fontFamily: font.uiSemibold, fontSize: 14, color: colors.screen },
  tutorSecondary: { paddingVertical: 12 },
  tutorSecondaryText: { fontFamily: font.ui, fontSize: 14, color: colors.inkSecondary },
  signOut: { paddingVertical: spacing.md, marginTop: spacing.xxl, alignItems: 'center' },
  signOutText: { fontFamily: font.ui, fontSize: 13, color: colors.inkMuted },
});
