import { useEffect, useState } from 'react';
import { ActivityIndicator, Modal, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { TeachingBlock } from './TeachingBlock';
import { colors, figure, font, radius, spacing } from '../design/tokens';
import { typography } from '../design/typography';
import { formatRupees } from '../lib/format';
import { fetchEsopExerciseCost, type EsopExerciseCostResult } from '../lib/esopExerciseCost';

// D-067's user-triggered entry point (opened from the ESOP holding's detail screen) +
// D-069/BRIEF-015's cost-of-exercising-today math. No input needed — the figures are
// computed entirely from the grant's own stored terms and today's date.
//
// D-091 (10-Aug-2026): the cost/spread figures below are exactly the surface where a verdict
// ("should I exercise?") is the natural next thought and nothing else on screen addresses it —
// so it carries an explicit "what we won't say" block naming the one input the app can never
// have (see docs/decisions/D-091-what-we-wont-say-block.md).
//
// Mockup alignment (Flow 05, 5.4): title reads "What exercising costs today"; the ledger
// below is now ledgerLabel/ledgerValue rows with one figure promoted to hero (figure.hero,
// mandatory device #3) instead of three equal-weight cards. BQ-052: the "The input only you
// have" block's heading and body text below are byte-for-byte unchanged from before this
// pass — that copy is a Tier-3 compliance decision the owner still owes, so only the layout
// around it moved, never the wording.
//
// The mockup's ledger also lists Strike price / Current FMV / Perquisite tax at 30%, with
// "Cash needed today" (strike cost + tax) as the hero. None of those three are added here:
// backend/app/services/esop_exercise_cost.py reads strike_price and current_fmv off the
// grant but never returns either in the API response, and it deliberately never computes a
// rupee tax figure — its own `_SPREAD_NOTE` says "the exact tax owed isn't shown here",
// because a flat 30% isn't actually each user's real perquisite rate. Computing "perquisite
// tax at 30%" or a combined "cash needed today" here would mean inventing a tax figure the
// backend explicitly declined to state — a calculation users would rely on, and a tax-shaped
// one at that, which per CLAUDE.md's hard-stop list is the owner's call, not mine to make
// silently in a layout pass. Flagged for the owner rather than implemented; see the session
// report. The hero below is instead the one cash figure the app does honestly compute:
// "Cash needed to exercise now" (exercise_cost).
export function EsopExerciseCostModal({
  userId,
  holdingId,
  onClose,
}: {
  userId: string;
  holdingId: string;
  onClose: () => void;
}) {
  const [result, setResult] = useState<EsopExerciseCostResult | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchEsopExerciseCost(userId, holdingId)
      .then(setResult)
      .catch((err) => setError(err instanceof Error ? err.message : 'Failed to calculate'));
  }, [userId, holdingId]);

  return (
    <Modal visible animationType="slide" onRequestClose={onClose}>
      <ScrollView contentContainerStyle={styles.container}>
        <Text style={styles.title}>What exercising costs today</Text>

        {error && <Text style={styles.errorText}>{error}</Text>}

        {!error && !result && <ActivityIndicator style={styles.spinner} color={colors.ink} />}

        {result && (
          <View style={styles.results}>
            <View style={styles.card}>
              <Text style={styles.cardLabel}>Vested units</Text>
              <Text style={styles.cardValue}>
                {result.vested_units.toLocaleString('en-IN')} of{' '}
                {result.total_units_granted.toLocaleString('en-IN')}
              </Text>
              <Text style={styles.cardNote}>{result.exercised_units_assumption_note}</Text>
              <Text style={styles.cardNote}>{result.vesting_timing_note}</Text>
            </View>

            {/* The deciding figure: largest type on the screen (mandatory device #3). */}
            <View style={styles.heroCard}>
              <Text style={styles.heroLabel}>Cash needed to exercise now</Text>
              <Text style={styles.heroValue}>{formatRupees(result.exercise_cost)}</Text>
            </View>

            <View style={styles.card}>
              <Text style={styles.cardLabel}>Taxable spread if exercised today</Text>
              <Text style={styles.cardValue}>
                {result.spread !== null ? formatRupees(result.spread) : '—'}
              </Text>
              {result.spread_note && <Text style={styles.cardNote}>{result.spread_note}</Text>}
            </View>

            {/* Mechanism explanation: the timing gap between paying cash out and being
                able to realise anything back — prose only, no new figures. */}
            <Text style={styles.mechanismNote}>
              Exercising and any tax on the gain both fall due before you can sell — cash goes
              out today against a paper gain you can't yet turn back into cash.
            </Text>

            <TeachingBlock heading="The input only you have">
              A view on whether the company's value holds. Nothing here estimates that. What this
              screen does give you: the cash cost and the spread — the two numbers that bound your
              decision regardless of the valuation call.
            </TeachingBlock>

            {result.exercise_window_note && (
              <Text style={styles.caveat}>{result.exercise_window_note}</Text>
            )}
          </View>
        )}

        <Pressable style={styles.cancel} onPress={onClose}>
          <Text style={styles.cancelText}>Close</Text>
        </Pressable>
      </ScrollView>
    </Modal>
  );
}

const styles = StyleSheet.create({
  container: { padding: spacing.xl, paddingTop: spacing.xxxl, backgroundColor: colors.screen },
  title: typography.pageTitle,
  errorText: { fontFamily: font.ui, color: colors.danger },
  spinner: { marginTop: spacing.xl },
  results: { gap: spacing.md },
  card: {
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: colors.lineSoft,
    borderRadius: radius.md,
    padding: spacing.lg,
  },
  // Ledger label (1D) — font.mono 12 / ls 0.5 / uppercase / inkMuted.
  cardLabel: typography.ledgerLabel,
  cardValue: {
    fontFamily: font.monoSemibold, // only 600 loaded for this face
    fontSize: figure.subHero,
    color: colors.ink,
    marginTop: spacing.xs,
  },
  cardNote: {
    fontFamily: font.tutor,
    fontSize: 12,
    color: colors.inkMuted,
    marginTop: spacing.sm,
    lineHeight: 17,
  },
  // The one hero card on this screen (figure.hero, 1G) — same tutorSoft ground the other
  // modals use for their single deciding figure, so it reads as the answer, not one more
  // equal-weight card.
  heroCard: {
    backgroundColor: colors.tutorSoft,
    borderRadius: radius.md,
    padding: spacing.lg,
  },
  heroLabel: typography.ledgerLabel,
  heroValue: {
    fontFamily: font.monoSemibold, // only 600 loaded for this face
    fontSize: figure.hero,
    color: colors.ink,
    marginTop: spacing.xs,
  },
  mechanismNote: {
    fontFamily: font.tutor,
    fontSize: 13,
    color: colors.inkSecondary,
    lineHeight: 19,
  },
  caveat: { fontFamily: font.tutor, fontSize: 12, color: colors.inkMuted, fontStyle: 'italic' },
  cancel: { alignItems: 'center', marginTop: spacing.xl },
  cancelText: { fontFamily: font.ui, color: colors.inkMuted },
});
