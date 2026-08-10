import { useState } from 'react';
import { Modal, Pressable, ScrollView, StyleSheet, Text, TextInput, View } from 'react-native';
import { colors, figure, font, radius, spacing } from '../design/tokens';
import { fetchLoanVsInvest, type LoanVsInvestResult } from '../lib/loanVsInvest';
import { formatRupees } from '../lib/format';

// D-067: user-triggered entry point (no auto-detection for v1) — reached from a loan's
// detail screen. D-068/BRIEF-014: hurdle-rate only, both prepayment modes always shown,
// card order is input-order (not by which saves more) — neutral, per BRIEF-013's
// no-ranking-in-layout requirement.
//
// D-092 (10-Aug-2026): this flow does NOT open with a refusal narrated in prose — the
// parallel structure below (identical cards, the order note, the named third path) is
// what enacts neutrality. Narrating "I won't tell you which one to do" over a screen that
// already visibly isn't telling them would spend confidence on posture instead of maths.
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
          placeholderTextColor={colors.inkMuted}
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
              <Text style={styles.hurdleExplainer}>
                Anything you invest instead would need to return more than this, after tax, for
                that path to leave you better off.
              </Text>
              <Text style={styles.hurdleNote}>{result.hurdle_rate_note}</Text>
            </View>

            <Text style={styles.orderNote}>Order = as entered</Text>

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

            <View style={styles.closingBlock}>
              <Text style={styles.closingHeading}>What would make each one true for you</Text>
              <Text style={styles.closingLine}>
                Same EMI — true for you if you'd rather be loan-free sooner and can comfortably
                keep paying what you're paying now.
              </Text>
              <Text style={styles.closingLine}>
                Same tenure — true for you if freeing up cash each month matters more right now
                than shortening the loan.
              </Text>
              <Text style={styles.closingLine}>
                Neither — if you'd rather hold {formatRupees(result.prepay_amount)} as a buffer.
                That's a real option and it doesn't show up in either column.
              </Text>
            </View>
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
  title: { fontFamily: font.ui, fontSize: 20, fontWeight: '600', color: colors.ink },
  subtitle: {
    fontFamily: font.ui,
    fontSize: 14,
    color: colors.inkSecondary,
    marginTop: spacing.xs,
    marginBottom: spacing.lg,
  },
  input: {
    fontFamily: font.ui,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: colors.line,
    borderRadius: radius.sm,
    paddingHorizontal: spacing.md,
    paddingVertical: 10,
    fontSize: 16,
    color: colors.ink,
  },
  // Primary button spec (1C) — was colors.ink, the only primary button not in colors.tutor.
  calculateButton: {
    backgroundColor: colors.tutor,
    borderRadius: radius.md,
    paddingVertical: 14,
    alignItems: 'center',
    marginTop: spacing.md,
  },
  calculateButtonText: { fontFamily: font.ui, fontSize: 15, color: colors.screen, fontWeight: '600' },
  errorText: { fontFamily: font.ui, color: colors.danger, marginTop: spacing.md },
  results: { marginTop: spacing.xl },
  hurdleCard: {
    backgroundColor: colors.tutorSoft,
    borderRadius: radius.md,
    padding: spacing.lg,
    marginBottom: spacing.lg,
  },
  // Ledger label (1D) — font.mono 12 / ls 0.5 / uppercase / inkMuted.
  hurdleLabel: {
    fontFamily: font.mono,
    fontSize: 12,
    color: colors.inkMuted,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  // The deciding figure: largest type on the screen (mandatory device #3). Hero scale (1G).
  hurdleValue: {
    fontFamily: font.mono,
    fontSize: figure.hero,
    fontWeight: '700',
    color: colors.ink,
    marginTop: spacing.xs,
  },
  hurdleExplainer: {
    fontFamily: font.tutor,
    fontSize: 14,
    color: colors.inkSecondary,
    marginTop: spacing.sm,
    lineHeight: 20,
  },
  hurdleNote: {
    fontFamily: font.tutor,
    fontSize: 13,
    color: colors.inkSecondary,
    marginTop: spacing.sm,
    lineHeight: 18,
  },
  // Mandatory device #2: sequence is input order, not preference.
  orderNote: {
    fontFamily: font.mono,
    fontSize: 11,
    color: colors.inkMuted,
    textTransform: 'uppercase',
    letterSpacing: 1,
    marginBottom: spacing.sm,
  },
  // Aligned to the app's one section-header treatment (1H) — this was the only section
  // header left in sentence case, font.ui. The string itself is unchanged; only the
  // rendered casing changes, via textTransform below.
  sectionTitle: {
    fontFamily: font.mono,
    fontSize: 12,
    letterSpacing: 1,
    textTransform: 'uppercase',
    color: colors.inkMuted,
    marginTop: spacing.md,
    marginBottom: spacing.xs,
  },
  // Both path cards share this single style object — identical parallel structure
  // (mandatory device #1). Do not diverge styling between the two paths.
  pathCard: {
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: colors.lineSoft,
    borderRadius: radius.sm,
    padding: spacing.md,
  },
  pathLine: { fontFamily: font.ui, fontSize: 14, color: colors.ink },
  pathValue: {
    fontFamily: font.mono,
    fontSize: 16,
    fontWeight: '600',
    color: colors.ink,
    marginTop: spacing.xs,
  },
  caveat: {
    fontFamily: font.tutor,
    fontSize: 12,
    color: colors.inkMuted,
    marginTop: spacing.lg,
    fontStyle: 'italic',
  },
  // Mandatory device #4: hands judgement back with criteria, third path named explicitly.
  closingBlock: { marginTop: spacing.xl, gap: spacing.sm },
  closingHeading: {
    fontFamily: font.ui,
    fontSize: 12,
    fontWeight: '700',
    color: colors.inkSecondary,
    textTransform: 'uppercase',
    letterSpacing: 1,
    marginBottom: spacing.xs,
  },
  closingLine: {
    fontFamily: font.tutor,
    fontSize: 14,
    color: colors.inkSecondary,
    lineHeight: 20,
  },
  cancel: { alignItems: 'center', marginTop: spacing.xl },
  cancelText: { fontFamily: font.ui, color: colors.inkMuted },
});
