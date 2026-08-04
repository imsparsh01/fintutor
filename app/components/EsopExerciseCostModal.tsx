import { useEffect, useState } from 'react';
import { ActivityIndicator, Modal, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { colors, spacing } from '../design/tokens';
import { formatRupees } from '../lib/format';
import { fetchEsopExerciseCost, type EsopExerciseCostResult } from '../lib/esopExerciseCost';

// D-067's user-triggered entry point (opened from the ESOP holding's detail screen) +
// D-069/BRIEF-015's cost-of-exercising-today math. No input needed — the figures are
// computed entirely from the grant's own stored terms and today's date.
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
  container: { padding: spacing.xl, paddingTop: spacing.xxxl, backgroundColor: colors.background },
  title: { fontSize: 20, fontWeight: '600', color: colors.text, marginBottom: spacing.lg },
  errorText: { color: colors.danger },
  spinner: { marginTop: spacing.xl },
  results: { gap: spacing.md },
  card: {
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: colors.borderLight,
    borderRadius: 12,
    padding: spacing.lg,
  },
  cardLabel: { fontSize: 12, color: colors.textSecondary, textTransform: 'uppercase' },
  cardValue: { fontSize: 22, fontWeight: '700', color: colors.text, marginTop: spacing.xs },
  cardNote: { fontSize: 12, color: colors.textMuted, marginTop: spacing.sm, lineHeight: 17 },
  caveat: { fontSize: 12, color: colors.textMuted, fontStyle: 'italic' },
  cancel: { alignItems: 'center', marginTop: spacing.xl },
  cancelText: { color: colors.textMuted },
});
