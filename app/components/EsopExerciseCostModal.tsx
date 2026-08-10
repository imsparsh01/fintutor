import { useEffect, useState } from 'react';
import { ActivityIndicator, Modal, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { colors, font, radius, spacing } from '../design/tokens';
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
        <Text style={styles.title}>Cost of exercising today</Text>

        {error && <Text style={styles.errorText}>{error}</Text>}

        {!error && !result && <ActivityIndicator style={styles.spinner} />}

        {result && (
          <View style={styles.results}>
            <View style={styles.card}>
              <Text style={styles.cardLabel}>Vested units</Text>
              <Text style={styles.cardValue}>
                {result.vested_units.toLocaleString('en-IN')} of{' '}
                {result.total_units_granted.toLocaleString('en-IN')}
              </Text>
              <Text style={styles.cardNote}>{result.exercised_units_assumption_note}</Text>
            </View>

            <View style={styles.card}>
              <Text style={styles.cardLabel}>Cash needed to exercise now</Text>
              <Text style={styles.cardValue}>{formatRupees(result.exercise_cost)}</Text>
            </View>

            <View style={styles.card}>
              <Text style={styles.cardLabel}>Taxable spread if exercised today</Text>
              <Text style={styles.cardValue}>
                {result.spread !== null ? formatRupees(result.spread) : '—'}
              </Text>
              {result.spread_note && <Text style={styles.cardNote}>{result.spread_note}</Text>}
            </View>

            <View style={styles.wontSayBlock}>
              <Text style={styles.wontSayHeading}>The input only you have</Text>
              <Text style={styles.wontSayBody}>
                A view on whether the company's value holds. Nothing here estimates that, and no
                part of this figure should be read as expecting it to.
              </Text>
            </View>

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
  title: {
    fontFamily: font.ui,
    fontSize: 20,
    fontWeight: '600',
    color: colors.ink,
    marginBottom: spacing.lg,
  },
  errorText: { fontFamily: font.ui, color: colors.danger },
  spinner: { marginTop: spacing.xl },
  results: { gap: spacing.md },
  card: {
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: colors.lineSoft,
    borderRadius: radius.md,
    padding: spacing.lg,
  },
  cardLabel: {
    fontFamily: font.mono,
    fontSize: 12,
    color: colors.inkSecondary,
    textTransform: 'uppercase',
    letterSpacing: 1,
  },
  cardValue: {
    fontFamily: font.mono,
    fontSize: 22,
    fontWeight: '700',
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
  // D-091 block — placed immediately after the figures it answers for.
  wontSayBlock: {
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: colors.lineSoft,
    borderRadius: radius.md,
    padding: spacing.lg,
    backgroundColor: colors.canvas,
  },
  wontSayHeading: {
    fontFamily: font.ui,
    fontSize: 12,
    fontWeight: '700',
    color: colors.inkSecondary,
    textTransform: 'uppercase',
    letterSpacing: 1,
    marginBottom: spacing.xs,
  },
  wontSayBody: {
    fontFamily: font.tutor,
    fontSize: 14,
    color: colors.inkSecondary,
    lineHeight: 20,
  },
  caveat: { fontFamily: font.tutor, fontSize: 12, color: colors.inkMuted, fontStyle: 'italic' },
  cancel: { alignItems: 'center', marginTop: spacing.xl },
  cancelText: { fontFamily: font.ui, color: colors.inkMuted },
});
