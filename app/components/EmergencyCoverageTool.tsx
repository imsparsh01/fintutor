import { useEffect, useRef, useState } from 'react';
import { AccessibilityInfo, findNodeHandle, Platform, Pressable, ScrollView, StyleSheet, Text, TextInput, View } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import type { BottomTabNavigationProp } from '@react-navigation/bottom-tabs';
import { colors, font, radius, spacing } from '../design/tokens';
import { ScenarioHandoffModal } from './ScenarioHandoffModal';
import { fetchBudget } from '../lib/budget';
import { calculateEmergencyCoverage, emergencyBudgetPrefill, emergencyCoverageSignature, emergencyFixedDepositPrefill, shouldEmitEmergencyCoverage } from '../lib/emergencyCoverage';
import { formatRupees } from '../lib/format';
import { fetchHoldings } from '../lib/holdings';
import { parseScenarioNumber } from '../lib/scenarioNumbers';
import { buildScenarioHandoffPrompt } from '../lib/scenarioHandoff';
import type { MainTabsParamList } from '../navigation/types';

type Props = { userId: string | null; surface: 'scenario' | 'calculator'; onComputed: () => void };
const INPUTS_CHANGED_NOTICE = 'Inputs changed — run again to see a result for these values.';

export function EmergencyCoverageTool({ userId, surface, onComputed }: Props) {
  const navigation = useNavigation<BottomTabNavigationProp<MainTabsParamList>>();
  const generation = useRef(0);
  const resultHeading = useRef<Text>(null);
  const onComputedRef = useRef(onComputed);
  const lastEmittedSignature = useRef<string | null>(null);
  const [cash, setCash] = useState('');
  const [fixedDeposits, setFixedDeposits] = useState('');
  const [other, setOther] = useState('');
  const [outgoings, setOutgoings] = useState('');
  const [fdCandidate, setFdCandidate] = useState<number | null>(null);
  const [outgoingsCandidate, setOutgoingsCandidate] = useState<number | null>(null);
  const [fdCandidateIncluded, setFdCandidateIncluded] = useState(false);
  const [outgoingsCandidateIncluded, setOutgoingsCandidateIncluded] = useState(false);
  const [fdLoadFailed, setFdLoadFailed] = useState(false);
  const [budgetLoadFailed, setBudgetLoadFailed] = useState(false);
  const [result, setResult] = useState<{ value: NonNullable<ReturnType<typeof calculateEmergencyCoverage>>; signature: string; inputsSummary: string; monthlyOutgoings: number; handoffPrompt: string } | null>(null);
  const [notice, setNotice] = useState<string | null>(null);
  const [confirming, setConfirming] = useState(false);

  useEffect(() => {
    onComputedRef.current = onComputed;
  }, [onComputed]);

  useEffect(() => {
    const active = ++generation.current;
    setCash(''); setFixedDeposits(''); setOther(''); setOutgoings('');
    setFdCandidate(null); setOutgoingsCandidate(null); setFdCandidateIncluded(false); setOutgoingsCandidateIncluded(false);
    setFdLoadFailed(false); setBudgetLoadFailed(false);
    setResult(null); setNotice(null); setConfirming(false);
    if (!userId) return () => { generation.current += 1; };
    fetchHoldings(userId).then((items) => {
      const hasFixedDeposit = items.some((item) => item.product_type === 'fd_rd' && String(item.characteristics.deposit_mode ?? '').toUpperCase() !== 'RD');
      const candidate = hasFixedDeposit ? emergencyFixedDepositPrefill(items) : null;
      if (generation.current === active) setFdCandidate(candidate === null ? null : Math.round(candidate));
    }).catch(() => { if (generation.current === active) setFdLoadFailed(true); });
    fetchBudget(userId).then((budget) => {
      const candidate = emergencyBudgetPrefill(budget);
      if (generation.current === active) setOutgoingsCandidate(candidate === null ? null : Math.round(candidate));
    }).catch(() => { if (generation.current === active) setBudgetLoadFailed(true); });
    return () => { generation.current += 1; };
  }, [userId]);

  function edit(setter: (value: string) => void) {
    return (value: string) => { setter(value); setNotice(result ? INPUTS_CHANGED_NOTICE : null); setResult(null); };
  }

  function calculate() {
    const parsedCash = cash === '' ? 0 : parseScenarioNumber(cash)?.value;
    const parsedDeposits = fixedDeposits === '' ? 0 : parseScenarioNumber(fixedDeposits)?.value;
    const parsedOther = other === '' ? 0 : parseScenarioNumber(other)?.value;
    const parsedOutgoings = parseScenarioNumber(outgoings)?.value;
    if ([parsedCash, parsedDeposits, parsedOther, parsedOutgoings].some((value) => value === undefined)) {
      setResult(null); setNotice('Enter ordinary finite numbers. Leave an optional balance blank to exclude it.'); return;
    }
    const inputs = {
      cashAndBank: parsedCash!, fixedDeposits: parsedDeposits!,
      otherAccessible: parsedOther!, monthlyOutgoings: parsedOutgoings!,
    };
    const next = calculateEmergencyCoverage(inputs);
    if (!next) { setResult(null); setNotice('Enter non-negative balances and monthly outgoings greater than zero.'); return; }
    const fdSource = fdCandidateIncluded ? 'included from your recorded fixed-deposit data' : fixedDeposits === '' ? 'omitted' : 'entered by you';
    const outgoingsSource = outgoingsCandidateIncluded ? 'included from your recorded budget data' : 'entered by you';
    const inputsSummary = `${formatRupees(inputs.cashAndBank)} cash/bank (entered by you) · ${formatRupees(inputs.fixedDeposits)} fixed deposits (${fdSource}) · ${formatRupees(inputs.otherAccessible)} other accessible (${other === '' ? 'omitted' : 'entered by you'}) · ${formatRupees(inputs.monthlyOutgoings)} monthly outgoings (${outgoingsSource}).`;
    const handoffPrompt = buildScenarioHandoffPrompt({ scenarioType: 'emergency_coverage', surface: 'calculator', normalizedInputs: { cash_and_bank: inputs.cashAndBank, included_fixed_deposits: inputs.fixedDeposits, other_accessible: inputs.otherAccessible, monthly_outgoings: inputs.monthlyOutgoings }, formulaBoundary: 'Sum only included accessible balances, then divide by positive monthly outgoings.', omissions: 'Taxes, penalties, access delays, returns, changing expenses and any adequacy judgment.' }) ?? '';
    setNotice(null); setResult({ value: next, signature: emergencyCoverageSignature(inputs), inputsSummary, monthlyOutgoings: inputs.monthlyOutgoings, handoffPrompt });
  }

  function reset() {
    setCash(''); setFixedDeposits(''); setOther(''); setOutgoings('');
    setFdCandidateIncluded(false); setOutgoingsCandidateIncluded(false); setResult(null); setNotice(null);
  }

  useEffect(() => {
    if (!result) return;
    AccessibilityInfo.announceForAccessibility(`Months covered: ${result.value.months.toFixed(1)}`);
    if (Platform.OS !== 'web') {
      const handle = findNodeHandle(resultHeading.current);
      if (handle) AccessibilityInfo.setAccessibilityFocus(handle);
    }
    if (shouldEmitEmergencyCoverage(lastEmittedSignature.current, result.signature)) {
      lastEmittedSignature.current = result.signature;
      onComputedRef.current();
    }
  }, [result]);

  return <ScrollView style={styles.screen} contentContainerStyle={styles.content}>
    {surface === 'scenario' && <Pressable style={styles.back} onPress={() => navigation.navigate('Tools')} accessibilityRole="button"><Text style={styles.backText}>‹ Tools</Text></Pressable>}
    <Text style={styles.heading}>{surface === 'scenario' ? 'Emergency runway' : 'Emergency Coverage'}</Text>
    <Text style={styles.question}>How many months would the accessible balances you enter cover at the monthly outgoings you enter?</Text>
    <Field label="Cash & bank balance" value={cash} onChange={edit(setCash)} />
    {fdCandidate !== null && fixedDeposits === '' && <Candidate label="Recorded fixed-deposit principal" value={fdCandidate} onInclude={() => { setFixedDeposits(String(fdCandidate)); setFdCandidateIncluded(true); setNotice(result ? INPUTS_CHANGED_NOTICE : null); setResult(null); }} />}
    <Field label="Fixed-deposit principal to include (optional)" value={fixedDeposits} onChange={(value) => { setFdCandidateIncluded(false); edit(setFixedDeposits)(value); }} />
    {fdLoadFailed && <Text style={styles.loadNote} accessibilityLiveRegion="polite">Recorded fixed deposits could not be loaded. You can still enter an amount manually.</Text>}
    <Text style={styles.note}>Premature closure of a fixed deposit can reduce or delay the proceeds available.</Text>
    <Field label="Other amount you know you could access (optional)" value={other} onChange={edit(setOther)} />
    {outgoingsCandidate !== null && outgoings === '' && <Candidate label="Recorded monthly budget outgoings" value={outgoingsCandidate} onInclude={() => { setOutgoings(String(outgoingsCandidate)); setOutgoingsCandidateIncluded(true); setNotice(result ? INPUTS_CHANGED_NOTICE : null); setResult(null); }} />}
    <Field label="Monthly outgoings" value={outgoings} onChange={(value) => { setOutgoingsCandidateIncluded(false); edit(setOutgoings)(value); }} />
    {budgetLoadFailed && <Text style={styles.loadNote} accessibilityLiveRegion="polite">Budget outgoings could not be loaded. You can still enter an amount manually.</Text>}
    <Pressable style={styles.button} onPress={calculate} accessibilityRole="button"><Text style={styles.buttonText}>{surface === 'scenario' ? 'Run this scenario' : 'Calculate'}</Text></Pressable>
    <Pressable style={styles.resetButton} onPress={reset} accessibilityRole="button"><Text style={styles.resetButtonText}>Reset scenario</Text></Pressable>
    {notice && <Text style={styles.loadNote} accessibilityRole="alert" accessibilityLiveRegion="polite">{notice}</Text>}
    {result && <View style={styles.result} accessibilityLiveRegion="polite">
      <Text ref={resultHeading} style={styles.resultUnit} accessibilityRole="header">Months covered</Text>
      <Text style={styles.resultValue}>{result.value.months.toFixed(1)}</Text>
      <Text style={styles.evidenceHeading}>Inputs used</Text><Text style={styles.note}>{result.inputsSummary}</Text>
      <Text style={styles.evidenceHeading}>Formula and convention</Text><Text style={styles.note}>{formatRupees(result.value.accessibleBalances)} of included accessible balances divided by {formatRupees(result.monthlyOutgoings)} of monthly outgoings.</Text>
      <Text style={styles.evidenceHeading}>Rounding, caps and omissions</Text><Text style={styles.note}>Months display to one decimal. Blank optional balances are omitted. Taxes, penalties, access delays, returns and changing expenses are not modeled.</Text>
      <Text style={styles.counted}>No number of months is labelled enough, safe or adequate.</Text>
      <Pressable style={styles.aryaButton} accessibilityRole="button" onPress={() => setConfirming(true)}><Text style={styles.aryaButtonText}>Explore the mechanism with Arya</Text></Pressable>
      <ScenarioHandoffModal visible={confirming} prompt={result.handoffPrompt} onCancel={() => setConfirming(false)} onConfirm={() => { setConfirming(false); navigation.navigate('Chat', { prefillQuestion: result.handoffPrompt }); }} />
    </View>}
    <View style={styles.teaching}><Text style={styles.teachingHeading}>What this does not model</Text><Text style={styles.note}>Taxes, penalties, access delays, returns, or changing expenses. Monthly outgoings stay editable; FinTutor does not decide which expenses you would cut. This result is not a target or a statement that the number of months is enough, safe, or adequate.</Text></View>
  </ScrollView>;
}

function Candidate({ label, value, onInclude }: { label: string; value: number; onInclude: () => void }) {
  return <View style={styles.candidate}><View><Text style={styles.candidateSource}>FROM YOUR RECORDED DATA · NOT YET INCLUDED</Text><Text style={styles.candidateLabel}>{label}: {formatRupees(value)}</Text></View><Pressable style={styles.includeButton} onPress={onInclude} accessibilityRole="button"><Text style={styles.includeButtonText}>Include</Text></Pressable></View>;
}

function Field({ label, value, onChange }: { label: string; value: string; onChange: (v: string) => void }) {
  return <View style={styles.field}><View style={styles.labelRow}><Text style={styles.label}>{label}</Text></View><View style={styles.inputRow}><Text style={styles.adorn}>₹</Text><TextInput style={styles.input} value={value} onChangeText={onChange} keyboardType="decimal-pad" accessibilityLabel={label} placeholder="0" placeholderTextColor={colors.inkMuted} /></View></View>;
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: colors.screen }, content: { padding: spacing.lg, paddingBottom: spacing.xxl },
  back: { minHeight: 44, alignSelf: 'flex-start', justifyContent: 'center', marginBottom: spacing.sm }, backText: { fontFamily: font.uiMedium, color: colors.tutor, fontSize: 16 },
  heading: { fontFamily: font.uiSemibold, fontSize: 28, color: colors.ink, marginBottom: spacing.sm }, question: { fontFamily: font.ui, fontSize: 16, lineHeight: 24, color: colors.inkSecondary, marginBottom: spacing.lg },
  field: { marginBottom: spacing.md }, labelRow: { flexDirection: 'row', justifyContent: 'space-between', gap: spacing.sm }, label: { flex: 1, fontFamily: font.uiMedium, color: colors.ink, marginBottom: spacing.xs },
  candidate: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', gap: spacing.sm, padding: spacing.md, marginBottom: spacing.sm, borderWidth: 1, borderColor: colors.line, borderRadius: radius.md, backgroundColor: colors.tutorSoft }, candidateSource: { fontFamily: font.mono, fontSize: 10, color: colors.inkMuted, marginBottom: spacing.xs }, candidateLabel: { fontFamily: font.uiMedium, color: colors.ink }, includeButton: { minHeight: 44, justifyContent: 'center', paddingHorizontal: spacing.md, borderRadius: radius.md, borderWidth: 1, borderColor: colors.tutor }, includeButtonText: { fontFamily: font.uiMedium, color: colors.tutor },
  inputRow: { flexDirection: 'row', alignItems: 'center', borderWidth: 1, borderColor: colors.line, borderRadius: radius.md, backgroundColor: colors.screen }, adorn: { paddingLeft: spacing.md, color: colors.inkSecondary }, input: { flex: 1, minHeight: 48, padding: spacing.md, fontFamily: font.mono, color: colors.ink },
  note: { fontFamily: font.ui, fontSize: 14, lineHeight: 21, color: colors.inkSecondary }, loadNote: { fontFamily: font.ui, fontSize: 14, lineHeight: 20, color: colors.inkSecondary, marginBottom: spacing.md },
  button: { minHeight: 48, alignItems: 'center', justifyContent: 'center', backgroundColor: colors.tutor, borderRadius: radius.md, marginTop: spacing.lg }, buttonText: { fontFamily: font.uiMedium, color: colors.screen }, resetButton: { minHeight: 44, alignItems: 'center', justifyContent: 'center', marginBottom: spacing.lg }, resetButtonText: { fontFamily: font.uiMedium, color: colors.tutor },
  result: { backgroundColor: colors.screen, borderWidth: 1, borderColor: colors.line, borderRadius: radius.lg, padding: spacing.lg, marginBottom: spacing.lg }, resultUnit: { fontFamily: font.uiMedium, color: colors.inkSecondary }, resultValue: { fontFamily: font.mono, fontSize: 36, color: colors.ink, marginVertical: spacing.sm }, evidenceHeading: { fontFamily: font.mono, fontSize: 11, letterSpacing: 0.8, color: colors.ink, marginTop: spacing.md, marginBottom: spacing.xs, textTransform: 'uppercase' }, counted: { fontFamily: font.ui, color: colors.ink, marginTop: spacing.md, lineHeight: 20 },
  aryaButton: { minHeight: 48, alignItems: 'center', justifyContent: 'center', borderWidth: 1, borderColor: colors.tutor, borderRadius: radius.md, marginTop: spacing.lg, paddingHorizontal: spacing.md }, aryaButtonText: { fontFamily: font.uiMedium, color: colors.tutor },
  teaching: { borderTopWidth: 1, borderTopColor: colors.line, paddingTop: spacing.lg }, teachingHeading: { fontFamily: font.uiSemibold, fontSize: 18, color: colors.ink, marginBottom: spacing.sm },
});
