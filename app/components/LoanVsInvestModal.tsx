import { useState } from 'react';
import { Modal, Pressable, ScrollView, StyleSheet, Text, TextInput, View } from 'react-native';
import { colors, spacing } from '../design/tokens';
import { fetchLoanVsInvest, type LoanVsInvestResult } from '../lib/loanVsInvest';
import { formatRupees } from '../lib/format';

// D-067: user-triggered entry point (no auto-detection for v1) — reached from a loan's
// detail screen. D-068/BRIEF-014: hurdle-rate only, both prepayment modes always shown,
// card order is input-order (not by which saves more) — neutral, per BRIEF-013's
// no-ranking-in-layout requirement.
export function LoanVsInvestModal({
  userId,
  holdingId,
  onClose,
}: {
  userId: string;
  holdingId: string;
  onClose: () => void;
}) {
  const [amount, setAmount] = useState('');
  const [result, setResult] = useState<LoanVsInvestResult | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const calculate = async () => {
    const parsed = Number(amount);
    if (!parsed || parsed <= 0) {
      setError('Enter an amount greater than 0');
      return;
    }
    setLoading(true);
    setError(null);
    setResult(null);
    try {
      const r = await fetchLoanVsInvest(userId, holdingId, parsed);
      setResult(r);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to calculate');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal visible animationType="slide" onRequestClose={onClose}>
      <ScrollView contentContainerStyle={styles.container}>
        <Text style={styles.title}>Prepay vs. invest</Text>
        <Text style={styles.subtitle}>
          How much extra do you have to put toward this loan?
        </Text>

        <TextInput
          style={styles.input}
          value={amount}
          onChangeText={setAmount}
          placeholder="Amount (₹)"
          keyboardType="numeric"
        />

        <Pressable style={styles.calculateButton} onPress={calculate} disabled={loading}>
          <Text style={styles.calculateButtonText}>{loading ? 'Calculating…' : 'Calculate'}</Text>
        </Pressable>

        {error && <Text style={styles.errorText}>{error}</Text>}

        {result && (
          <View style={styles.results}>
            <View style={styles.hurdleCard}>
              <Text style={styles.hurdleLabel}>The number to watch</Text>
              <Text style={styles.hurdleValue}>{result.hurdle_rate_percent}% a year</Text>
              <Text style={styles.hurdleNote}>{result.hurdle_rate_note}</Text>
            </View>

            <Text style={styles.sectionTitle}>If you keep the same EMI</Text>
            <View style={styles.pathCard}>
              <Text style={styles.pathLine}>
                Loan ends in {result.tenure_reduction.new_remaining_months.toFixed(0)} months instead
              </Text>
              <Text style={styles.pathValue}>
                {formatRupees(result.tenure_reduction.interest_saved)} interest saved
              </Text>
            </View>

            <Text style={styles.sectionTitle}>If you keep the same tenure</Text>
            <View style={styles.pathCard}>
              <Text style={styles.pathLine}>
                EMI drops to {formatRupees(result.emi_reduction.new_emi_amount)}
              </Text>
              <Text style={styles.pathValue}>
                {formatRupees(result.emi_reduction.interest_saved)} interest saved
              </Text>
            </View>

            <Text style={styles.caveat}>{result.prepayment_charge_note}</Text>
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
  title: { fontSize: 20, fontWeight: '600', color: colors.text },
  subtitle: { fontSize: 14, color: colors.textSecondary, marginTop: spacing.xs, marginBottom: spacing.lg },
  input: {
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: colors.border,
    borderRadius: 8,
    paddingHorizontal: spacing.md,
    paddingVertical: 10,
    fontSize: 16,
  },
  calculateButton: {
    backgroundColor: colors.text,
    borderRadius: 8,
    paddingVertical: spacing.md,
    alignItems: 'center',
    marginTop: spacing.md,
  },
  calculateButtonText: { color: '#fff', fontWeight: '600' },
  errorText: { color: colors.danger, marginTop: spacing.md },
  results: { marginTop: spacing.xl },
  hurdleCard: {
    backgroundColor: '#eef6ee',
    borderRadius: 12,
    padding: spacing.lg,
    marginBottom: spacing.xl,
  },
  hurdleLabel: { fontSize: 12, color: colors.textSecondary, textTransform: 'uppercase' },
  hurdleValue: { fontSize: 28, fontWeight: '700', color: colors.text, marginTop: spacing.xs },
  hurdleNote: { fontSize: 13, color: colors.textSecondary, marginTop: spacing.sm, lineHeight: 18 },
  sectionTitle: { fontSize: 13, color: colors.textSecondary, marginTop: spacing.md, marginBottom: spacing.xs },
  pathCard: {
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: colors.borderLight,
    borderRadius: 10,
    padding: spacing.md,
  },
  pathLine: { fontSize: 14, color: colors.text },
  pathValue: { fontSize: 16, fontWeight: '600', color: colors.text, marginTop: spacing.xs },
  caveat: { fontSize: 12, color: colors.textMuted, marginTop: spacing.lg, fontStyle: 'italic' },
  cancel: { alignItems: 'center', marginTop: spacing.xl },
  cancelText: { color: colors.textMuted },
});
