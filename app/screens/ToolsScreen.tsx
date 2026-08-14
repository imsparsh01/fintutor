import { useEffect, useRef, useState } from 'react';
import {
  AccessibilityInfo,
  findNodeHandle,
  Modal,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import type { BottomTabNavigationProp } from '@react-navigation/bottom-tabs';
import { colors, font, radius, spacing } from '../design/tokens';
import { LoanVsInvestModal } from '../components/LoanVsInvestModal';
import { useAuth } from '../lib/AuthContext';
import { fetchHoldings, type Holding } from '../lib/holdings';
import { isLoanVsInvestEligible } from '../lib/loanVsInvest';
import type { CalculatorType, MainTabsParamList, ScenarioType } from '../navigation/types';

// BQ-057 (D-105): Tools tab — calculator entry point list.
// C-04, C-10, C-17, C-22, C-24 plus D-128 Compound Growth (BQ-078).
// Navigates to CalculatorScreen (hidden tab) with { type, label }.
//
// BQ-056 (D-106): the "What if…" scenarios sit below the calculators, same row pattern,
// navigating to ScenarioScreen. The distinction the two sections draw: a calculator answers a
// question about numbers you type in; a scenario starts from the numbers you already hold.

type CalcEntry = { type: CalculatorType; label: string; description: string };
type ScenarioEntry = { type: ScenarioType; label: string; description: string };

const CALCULATORS: CalcEntry[] = [
  {
    type: 'sip_goal',
    label: 'SIP Goal Planner',
    description: 'Find the monthly SIP needed to reach a corpus target.',
  },
  {
    type: 'emi',
    label: 'Home Loan EMI',
    description: 'Calculate your monthly instalment and total interest.',
  },
  {
    type: 'inflation',
    label: 'Inflation Impact',
    description: "See what today's cost becomes after inflation compounds.",
  },
  {
    type: 'stepup_sip',
    label: 'Step-up SIP',
    description: 'Model a SIP that increases each year as your income grows.',
  },
  {
    type: 'cagr_backward',
    label: 'CAGR Calculator',
    description: 'Measure the annualised return on any investment you hold.',
  },
  {
    type: 'compound_growth',
    label: 'Compound Growth',
    description: 'Model a lump sum and monthly contributions at a rate you choose.',
  },
  {
    type: 'credit_card_payoff',
    label: 'Credit-card Payoff',
    description: 'Model a fixed monthly payment on a card balance and rate you enter.',
  },
  {
    type: 'emergency_coverage',
    label: 'Emergency Coverage',
    description: 'See how many months the accessible balances you enter would cover.',
  },
  {
    type: 'goal_affordability',
    label: 'Goal contribution gap',
    description: 'Compare your planned monthly amount with a modeled amount for a goal.',
  },
];

const SCENARIOS: ScenarioEntry[] = [
  {
    type: 'emergency_runway',
    label: 'Emergency runway',
    description: 'If your income stopped today, how many months would your balances cover?',
  },
  {
    type: 'sip_increase',
    label: 'If I invest more each month',
    description: 'What an extra amount every month does to the corpus at the end.',
  },
  {
    type: 'debt_cost',
    label: 'What my debt costs',
    description: 'How much of the rest of your repayments is interest.',
  },
  {
    type: 'idle_cash',
    label: 'Inaction tax — idle cash',
    description: 'What a cash balance does over time at two different rates.',
  },
  {
    type: 'corpus_target',
    label: 'When my corpus reaches my target',
    description: 'You set the target; this shows when the maths gets there.',
  },
];

export function ToolsScreen() {
  const navigation = useNavigation<BottomTabNavigationProp<MainTabsParamList>>();
  const { userId } = useAuth();
  const requestId = useRef(0);
  const pickerHeadingRef = useRef<Text>(null);
  const [eligibleLoans, setEligibleLoans] = useState<Holding[]>([]);
  const [selectedLoan, setSelectedLoan] = useState<Holding | null>(null);
  const [loanPickerOpen, setLoanPickerOpen] = useState(false);
  const [loanPickerLoading, setLoanPickerLoading] = useState(false);
  const [loanPickerError, setLoanPickerError] = useState<string | null>(null);

  useEffect(() => {
    requestId.current += 1;
    setLoanPickerOpen(false);
    setSelectedLoan(null);
  }, [userId]);

  useEffect(() => {
    if (!loanPickerOpen) return;
    const announcement = loanPickerLoading
      ? 'Loading your recorded loans.'
      : loanPickerError
        ? loanPickerError
        : eligibleLoans.length === 0
          ? 'No eligible loans found. Add a home loan or personal loan to use this comparison.'
          : `${eligibleLoans.length} eligible loans found. Choose the loan you want to model.`;
    AccessibilityInfo.announceForAccessibility(announcement);
  }, [eligibleLoans.length, loanPickerError, loanPickerLoading, loanPickerOpen]);

  const openLoanComparison = async () => {
    const activeRequest = ++requestId.current;
    setLoanPickerOpen(true);
    setLoanPickerLoading(true);
    setLoanPickerError(null);
    setEligibleLoans([]);

    if (!userId) {
      setLoanPickerLoading(false);
      setLoanPickerError('Sign in to compare one of your recorded loans.');
      return;
    }

    try {
      const holdings = await fetchHoldings(userId);
      if (activeRequest !== requestId.current) return;
      const eligible = holdings.filter((holding) => isLoanVsInvestEligible(holding.product_type));
      if (eligible.length === 1) {
        setLoanPickerOpen(false);
        setSelectedLoan(eligible[0]);
      } else {
        setEligibleLoans(eligible);
      }
    } catch {
      if (activeRequest === requestId.current) {
        setLoanPickerError('Your loans could not be loaded. Try again.');
      }
    } finally {
      if (activeRequest === requestId.current) setLoanPickerLoading(false);
    }
  };

  const closeLoanPicker = () => {
    requestId.current += 1;
    setLoanPickerOpen(false);
    setLoanPickerLoading(false);
  };

  return (
    <>
      <ScrollView style={styles.screen} contentContainerStyle={styles.content}>
      <Text style={styles.heading}>Tools</Text>

      <Text style={styles.sectionLabel}>Calculators</Text>
      <View style={styles.card}>
        {CALCULATORS.map((c, idx) => (
          <Pressable
            key={c.type}
            style={[styles.row, idx < CALCULATORS.length - 1 && styles.rowBorder]}
            onPress={() => navigation.navigate('Calculator', { type: c.type, label: c.label })}
          >
            <View style={styles.rowBody}>
              <Text style={styles.rowLabel}>{c.label}</Text>
              <Text style={styles.rowDesc}>{c.description}</Text>
            </View>
            <Text style={styles.chevron}>›</Text>
          </Pressable>
        ))}
      </View>

      <Text style={[styles.sectionLabel, styles.sectionLabelSpaced]}>What if…</Text>
      <Text style={styles.sectionNote}>
        These start from the holdings and budget you have already recorded. Every prefilled figure
        stays editable.
      </Text>
      <View style={styles.card}>
        <Pressable
          style={[styles.row, styles.rowBorder]}
          onPress={openLoanComparison}
          accessibilityRole="button"
          accessibilityLabel="Prepay versus invest"
        >
          <View style={styles.rowBody}>
            <Text style={styles.rowLabel}>Prepay vs. invest</Text>
            <Text style={styles.rowDesc}>Compare two ways to prepay one of your recorded loans.</Text>
          </View>
          <Text style={styles.chevron}>›</Text>
        </Pressable>
        {SCENARIOS.map((s, idx) => (
          <Pressable
            key={s.type}
            style={[styles.row, idx < SCENARIOS.length - 1 && styles.rowBorder]}
            onPress={() => navigation.navigate('Scenario', { type: s.type, label: s.label })}
          >
            <View style={styles.rowBody}>
              <Text style={styles.rowLabel}>{s.label}</Text>
              <Text style={styles.rowDesc}>{s.description}</Text>
            </View>
            <Text style={styles.chevron}>›</Text>
          </Pressable>
        ))}
      </View>
      </ScrollView>

      <Modal
        visible={loanPickerOpen}
        animationType="slide"
        onRequestClose={closeLoanPicker}
        onShow={() => {
          if (Platform.OS !== 'web') {
            const headingHandle = findNodeHandle(pickerHeadingRef.current);
            if (headingHandle) AccessibilityInfo.setAccessibilityFocus(headingHandle);
          }
        }}
      >
        <ScrollView contentContainerStyle={styles.pickerContent} accessibilityViewIsModal>
          <Text ref={pickerHeadingRef} style={styles.pickerTitle} accessibilityRole="header">
            Prepay vs. invest
          </Text>
          {loanPickerLoading ? (
            <Text style={styles.pickerBody} accessibilityLiveRegion="polite">
              Loading your recorded loans…
            </Text>
          ) : loanPickerError ? (
            <>
              <Text style={styles.pickerBody} accessibilityRole="alert" accessibilityLiveRegion="assertive">
                {loanPickerError}
              </Text>
              {userId && (
                <Pressable style={styles.primaryButton} onPress={openLoanComparison}>
                  <Text style={styles.primaryButtonText}>Try again</Text>
                </Pressable>
              )}
            </>
          ) : eligibleLoans.length === 0 ? (
            <>
              <Text style={styles.pickerBody} accessibilityLiveRegion="polite">
                Add a home loan or personal loan to use this comparison. Credit-card balances do not use the same fixed-EMI maths.
              </Text>
              <Pressable
                style={styles.primaryButton}
                onPress={() => {
                  closeLoanPicker();
                  navigation.navigate('Loans');
                }}
              >
                <Text style={styles.primaryButtonText}>View loans</Text>
              </Pressable>
            </>
          ) : (
            <>
              <Text style={styles.pickerBody} accessibilityLiveRegion="polite">
                {eligibleLoans.length} eligible loans found. Choose the loan you want to model.
              </Text>
              <View style={styles.card}>
                {eligibleLoans.map((loan, idx) => (
                  <Pressable
                    key={loan.id}
                    style={[styles.row, idx < eligibleLoans.length - 1 && styles.rowBorder]}
                    onPress={() => {
                      setLoanPickerOpen(false);
                      setSelectedLoan(loan);
                    }}
                    accessibilityRole="button"
                    accessibilityLabel={`Compare ${loan.display_name ?? loan.alias}`}
                  >
                    <View style={styles.rowBody}>
                      <Text style={styles.rowLabel}>{loan.display_name ?? loan.alias}</Text>
                      <Text style={styles.rowDesc}>
                        {loan.product_type === 'home_loan' ? 'Home loan' : 'Personal loan'}
                      </Text>
                    </View>
                    <Text style={styles.chevron}>›</Text>
                  </Pressable>
                ))}
              </View>
            </>
          )}
          <Pressable style={styles.closeButton} onPress={closeLoanPicker}>
            <Text style={styles.closeButtonText}>Close</Text>
          </Pressable>
        </ScrollView>
      </Modal>

      {selectedLoan && userId && (
        <LoanVsInvestModal
          userId={userId}
          holdingId={selectedLoan.id}
          onClose={() => setSelectedLoan(null)}
        />
      )}
    </>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: colors.screen },
  content: { padding: spacing.xl, paddingBottom: spacing.xxxl },
  heading: {
    fontFamily: font.uiSemibold,
    fontSize: 24,
    color: colors.ink,
    marginBottom: spacing.xl,
  },
  sectionLabel: {
    fontFamily: font.mono,
    fontSize: 12,
    letterSpacing: 1,
    textTransform: 'uppercase',
    color: colors.inkMuted,
    marginBottom: spacing.xs,
  },
  sectionLabelSpaced: { marginTop: spacing.xxl },
  sectionNote: {
    fontFamily: font.tutor,
    fontSize: 13,
    lineHeight: 19,
    color: colors.inkSecondary,
    marginBottom: spacing.md,
  },
  card: {
    backgroundColor: colors.canvas,
    borderRadius: radius.lg,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: colors.line,
    overflow: 'hidden',
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: spacing.lg,
    paddingHorizontal: spacing.lg,
  },
  rowBorder: {
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: colors.line,
  },
  rowBody: { flex: 1 },
  rowLabel: { fontFamily: font.uiSemibold, fontSize: 15, color: colors.ink },
  rowDesc: { fontFamily: font.ui, fontSize: 12, color: colors.inkSecondary, marginTop: 2, lineHeight: 17 },
  chevron: { fontFamily: font.ui, fontSize: 18, color: colors.inkMuted, marginLeft: spacing.sm },
  pickerContent: {
    flexGrow: 1,
    padding: spacing.xl,
    paddingTop: spacing.xxxl,
    backgroundColor: colors.screen,
  },
  pickerTitle: { fontFamily: font.uiSemibold, fontSize: 24, color: colors.ink, marginBottom: spacing.md },
  pickerBody: { fontFamily: font.tutor, fontSize: 15, lineHeight: 22, color: colors.inkSecondary, marginBottom: spacing.lg },
  primaryButton: { minHeight: 44, alignItems: 'center', justifyContent: 'center', borderRadius: radius.md, backgroundColor: colors.ink, paddingHorizontal: spacing.lg, marginBottom: spacing.md },
  primaryButtonText: { fontFamily: font.uiSemibold, fontSize: 15, color: colors.canvas },
  closeButton: { minHeight: 44, alignItems: 'center', justifyContent: 'center', marginTop: spacing.xl },
  closeButtonText: { fontFamily: font.uiSemibold, fontSize: 15, color: colors.inkSecondary },
});
