import { useState } from 'react';
import { Modal, Pressable, ScrollView, StyleSheet, Text, TextInput, View } from 'react-native';
import { colors, figure, font, radius, spacing } from '../design/tokens';
import { typography } from '../design/typography';
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
//
// Mockup alignment (Flow 05, 5.1/5.2): preset amount chips ahead of the free-text field
// (Setup), "Two ways to prepay ₹X" heading over the two columns, and each column now a
// three-row ledger (Loan ends in / Interest saved / Monthly outgo) in identical order and
// weight (P10) rather than prose lines. Where a path holds a field constant by definition
// (EMI unchanged in the "keep same EMI" path; end date unchanged in the "keep same tenure"
// path), that row reads "Unchanged" rather than a fabricated figure — the backend doesn't
// return the current EMI amount at all, so this is the honest value, not a placeholder.
const PRESET_PREPAY_AMOUNTS = [25000, 50000, 100000, 200000];

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

  const runCalculate = async (rawAmount: string) => {
    const parsed = Number(rawAmount);
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

  const selectPreset = (preset: number) => {
    setAmount(String(preset));
    runCalculate(String(preset));
  };

  const calculate = () => runCalculate(amount);

  return (
    <Modal visible animationType="slide" onRequestClose={onClose}>
      <ScrollView contentContainerStyle={styles.container}>
        <Text style={styles.title}>Prepay vs. invest</Text>
        <Text style={styles.subtitle}>
          How much extra do you have to put toward this loan?
        </Text>

        <View style={styles.chipRow}>
          {PRESET_PREPAY_AMOUNTS.map((preset) => (
            <Pressable
              key={preset}
              style={[styles.chip, amount === String(preset) && styles.chipSelected]}
              onPress={() => selectPreset(preset)}
            >
              <Text
                style={[styles.chipText, amount === String(preset) && styles.chipTextSelected]}
              >
                {formatRupees(preset)}
              </Text>
            </Pressable>
          ))}
        </View>

        <TextInput
          style={styles.input}
          value={amount}
          onChangeText={setAmount}
          placeholder="Or enter a different amount (₹)"
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

            <Text style={styles.pathsHeading}>
              Two ways to prepay {formatRupees(result.prepay_amount)}
            </Text>
            <Text style={styles.orderNote}>Order = as entered</Text>

            <Text style={styles.sectionTitle}>Keep same EMI</Text>
            <View style={styles.pathCard}>
              <PathRow
                label="Loan ends in"
                value={`${result.tenure_reduction.new_remaining_months.toFixed(0)} months`}
              />
              <PathRow
                label="Interest saved"
                value={formatRupees(result.tenure_reduction.interest_saved)}
              />
              <PathRow label="Monthly outgo" value="Unchanged" last />
            </View>

            <Text style={styles.sectionTitle}>Keep same tenure</Text>
            <View style={styles.pathCard}>
              <PathRow label="Loan ends in" value="Unchanged" />
              <PathRow
                label="Interest saved"
                value={formatRupees(result.emi_reduction.interest_saved)}
              />
              <PathRow
                label="Monthly outgo"
                value={formatRupees(result.emi_reduction.new_emi_amount)}
                last
              />
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

// Both path cards render this exact row component — identical parallel structure
// (mandatory device #1). Do not diverge the row shape between the two paths.
function PathRow({ label, value, last }: { label: string; value: string; last?: boolean }) {
  return (
    <View style={[styles.pathRow, last && styles.pathRowLast]}>
      <Text style={styles.pathRowLabel}>{label}</Text>
      <Text style={styles.pathRowValue}>{value}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { padding: spacing.xl, paddingTop: spacing.xxxl, backgroundColor: colors.screen },
  title: { fontFamily: font.uiSemibold, fontSize: 20, color: colors.ink },
  subtitle: {
    fontFamily: font.ui,
    fontSize: 14,
    color: colors.inkSecondary,
    marginTop: spacing.xs,
    marginBottom: spacing.lg,
  },
  // Setup device: preset prepay-amount chips ahead of the free-text field.
  chipRow: { flexDirection: 'row', flexWrap: 'wrap', gap: spacing.sm, marginBottom: spacing.md },
  chip: {
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: colors.line,
    borderRadius: radius.pill,
    paddingHorizontal: spacing.md,
    paddingVertical: 6,
  },
  chipSelected: { backgroundColor: colors.tutor, borderColor: colors.tutor },
  chipText: { fontFamily: font.ui, fontSize: 13, color: colors.ink },
  chipTextSelected: { color: colors.screen },
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
  calculateButtonText: typography.primaryButtonText,
  errorText: { fontFamily: font.ui, color: colors.danger, marginTop: spacing.md },
  results: { marginTop: spacing.xl },
  hurdleCard: {
    backgroundColor: colors.tutorSoft,
    borderRadius: radius.md,
    padding: spacing.lg,
    marginBottom: spacing.lg,
  },
  // Ledger label (1D) — font.mono 12 / ls 0.5 / uppercase / inkMuted.
  hurdleLabel: typography.ledgerLabel,
  // The deciding figure: largest type on the screen (mandatory device #3). Hero scale (1G).
  hurdleValue: {
    fontFamily: font.monoSemibold, // only 600 loaded for this face
    fontSize: figure.hero,
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
  // Section header over the two columns — "Two ways to prepay ₹X" (mockup's literal
  // heading). Source string stays sentence case; textTransform renders it uppercase,
  // matching the app's one section-header treatment (1H), same as orderNote/sectionTitle.
  pathsHeading: {
    fontFamily: font.monoSemibold,
    fontSize: 13,
    letterSpacing: 1,
    textTransform: 'uppercase',
    color: colors.ink,
    marginTop: spacing.xl,
    marginBottom: spacing.xs,
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
  sectionTitle: {
    fontFamily: font.mono,
    fontSize: 12,
    letterSpacing: 1,
    textTransform: 'uppercase',
    color: colors.inkMuted,
    marginTop: spacing.md,
    marginBottom: spacing.xs,
  },
  // Both path cards share these row styles — identical parallel structure (mandatory
  // device #1). Do not diverge styling, field order, or weight between the two paths.
  pathCard: {
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: colors.lineSoft,
    borderRadius: radius.sm,
    padding: spacing.md,
  },
  pathRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: spacing.sm,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: colors.lineSoft,
  },
  pathRowLast: { borderBottomWidth: 0 },
  pathRowLabel: typography.ledgerLabel,
  pathRowValue: typography.ledgerValue,
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
    fontFamily: font.uiBold,
    fontSize: 12,
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
