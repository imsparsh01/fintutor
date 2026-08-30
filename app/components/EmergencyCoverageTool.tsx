import { useEffect, useRef, useState } from 'react';
import { AccessibilityInfo, findNodeHandle, Platform, Pressable, ScrollView, StyleSheet, Text, TextInput, View } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import type { BottomTabNavigationProp } from '@react-navigation/bottom-tabs';
import { colors, font, radius, spacing } from '../design/tokens';
import { ScenarioHandoffModal } from './ScenarioHandoffModal';
import { calculateEmergencyCoverage, emergencyCoverageSignature, shouldEmitEmergencyCoverage } from '../lib/emergencyCoverage';
import { formatRupees } from '../lib/format';
import { parseScenarioNumber } from '../lib/scenarioNumbers';
import { buildScenarioHandoffPrompt } from '../lib/scenarioHandoff';
import { fetchScenarioCandidates } from '../lib/scenarioCandidates';
import { scenarioSourceFailure } from '../lib/scenarioSession';
import { buildCalculatorCandidateOffer, type CalculatorCandidateOffer } from '../lib/calculatorCandidates';
import type { MainTabsParamList } from '../navigation/types';

type Props = { userId: string | null; surface: 'scenario' | 'calculator'; onComputed: () => void };
const INPUTS_CHANGED_NOTICE = 'Inputs changed — run again to see a result for these values.';

export function EmergencyCoverageTool({ userId, surface, onComputed }: Props) {
  const navigation = useNavigation<BottomTabNavigationProp<MainTabsParamList>>();
  const generation = useRef(0);
  const resultHeading = useRef<Text>(null);
  const handoffOpener = useRef<View>(null);
  const cashInput = useRef<TextInput>(null);
  const fdInput = useRef<TextInput>(null);
  const otherInput = useRef<TextInput>(null);
  const outgoingsInput = useRef<TextInput>(null);
  const onComputedRef = useRef(onComputed);
  const lastEmittedSignature = useRef<string | null>(null);
  const [cash, setCash] = useState('');
  const [fixedDeposits, setFixedDeposits] = useState('');
  const [other, setOther] = useState('');
  const [outgoings, setOutgoings] = useState('');
  const [fdCandidate, setFdCandidate] = useState<CalculatorCandidateOffer | null>(null);
  const [outgoingsCandidate, setOutgoingsCandidate] = useState<CalculatorCandidateOffer | null>(null);
  const [sourcesLoading, setSourcesLoading] = useState(Boolean(userId));
  const [fdCandidateIncluded, setFdCandidateIncluded] = useState(false);
  const [outgoingsCandidateIncluded, setOutgoingsCandidateIncluded] = useState(false);
  const [sourceFailure, setSourceFailure] = useState<'retryable' | 'permission' | null>(null);
  const [result, setResult] = useState<{ value: NonNullable<ReturnType<typeof calculateEmergencyCoverage>>; signature: string; inputsSummary: string; monthlyOutgoings: number; handoffPrompt: string } | null>(null);
  const [notice, setNotice] = useState<string | null>(null);
  const [errorField, setErrorField] = useState<'cash' | 'fd' | 'other' | 'outgoings' | null>(null);
  const [confirming, setConfirming] = useState(false);

  useEffect(() => {
    onComputedRef.current = onComputed;
  }, [onComputed]);

  useEffect(() => {
    setCash(''); setFixedDeposits(''); setOther(''); setOutgoings('');
    setFdCandidate(null); setOutgoingsCandidate(null); setFdCandidateIncluded(false); setOutgoingsCandidateIncluded(false);
    setSourcesLoading(Boolean(userId)); setSourceFailure(null);
    setResult(null); setNotice(null); setErrorField(null); setConfirming(false);
    if (userId) loadSources();
    return () => { generation.current += 1; };
  }, [userId]);

  function loadSources() {
    if (!userId) return;
    const active = ++generation.current;
    setSourcesLoading(true); setSourceFailure(null);
    fetchScenarioCandidates().then((response) => {
      if (generation.current !== active) return;
      setFdCandidate(buildCalculatorCandidateOffer(response.fd_principal));
      setOutgoingsCandidate(buildCalculatorCandidateOffer(response.monthly_outgoings));
    }).catch((error) => {
      if (generation.current !== active) return;
      const failure = scenarioSourceFailure(error);
      setSourceFailure(failure);
      if (failure === 'permission') {
        setCash(''); setFixedDeposits(''); setOther(''); setOutgoings('');
        setFdCandidate(null); setOutgoingsCandidate(null); setFdCandidateIncluded(false); setOutgoingsCandidateIncluded(false);
        setResult(null); setNotice(null); setErrorField(null); setConfirming(false);
      }
    })
      .finally(() => { if (generation.current === active) setSourcesLoading(false); });
  }

  function retrySources() {
    setNotice(result ? INPUTS_CHANGED_NOTICE : null); setResult(null);
    setFdCandidateIncluded(false); setOutgoingsCandidateIncluded(false);
    loadSources();
  }

  function edit(setter: (value: string) => void) {
    return (value: string) => { setter(value); setNotice(result ? INPUTS_CHANGED_NOTICE : null); setErrorField(null); setResult(null); };
  }

  function calculate() {
    const parsedCash = cash === '' ? 0 : parseScenarioNumber(cash)?.value;
    const parsedDeposits = fixedDeposits === '' ? 0 : parseScenarioNumber(fixedDeposits)?.value;
    const parsedOther = other === '' ? 0 : parseScenarioNumber(other)?.value;
    const parsedOutgoings = parseScenarioNumber(outgoings)?.value;
    if ([parsedCash, parsedDeposits, parsedOther, parsedOutgoings].some((value) => value === undefined)) {
      const invalid = parsedCash === undefined ? ['cash', cashInput] as const : parsedDeposits === undefined ? ['fd', fdInput] as const : parsedOther === undefined ? ['other', otherInput] as const : ['outgoings', outgoingsInput] as const;
      setErrorField(invalid[0]); invalid[1].current?.focus();
      setResult(null); setNotice('Enter ordinary finite numbers. Leave an optional balance blank to exclude it.'); return;
    }
    const inputs = {
      cashAndBank: parsedCash!, fixedDeposits: parsedDeposits!,
      otherAccessible: parsedOther!, monthlyOutgoings: parsedOutgoings!,
    };
    const next = calculateEmergencyCoverage(inputs);
    if (!next) {
      const invalid = inputs.cashAndBank < 0 ? ['cash', cashInput] as const : inputs.fixedDeposits < 0 ? ['fd', fdInput] as const : inputs.otherAccessible < 0 ? ['other', otherInput] as const : ['outgoings', outgoingsInput] as const;
      setErrorField(invalid[0]); invalid[1].current?.focus();
      setResult(null); setNotice('Enter non-negative balances and monthly outgoings greater than zero.'); return;
    }
    const provenance = (offer: CalculatorCandidateOffer | null) => offer?.candidates.map((candidate) => `${candidate.source_label} v${candidate.source_version}, retrieved ${candidate.retrieved_at}`).join('; ') ?? 'recorded evidence unavailable';
    const fdSource = fdCandidateIncluded ? `included from ${provenance(fdCandidate)}` : fixedDeposits === '' ? 'omitted' : 'entered by you';
    const outgoingsSource = outgoingsCandidateIncluded ? `included from ${provenance(outgoingsCandidate)}` : 'entered by you';
    const inputsSummary = `${formatRupees(inputs.cashAndBank)} cash/bank (entered by you) · ${formatRupees(inputs.fixedDeposits)} fixed deposits (${fdSource}) · ${formatRupees(inputs.otherAccessible)} other accessible (${other === '' ? 'omitted' : 'entered by you'}) · ${formatRupees(inputs.monthlyOutgoings)} monthly outgoings (${outgoingsSource}).`;
    const handoffPrompt = buildScenarioHandoffPrompt({ scenarioType: 'emergency_coverage', surface: 'calculator', normalizedInputs: { cash_and_bank: inputs.cashAndBank, included_fixed_deposits: inputs.fixedDeposits, other_accessible: inputs.otherAccessible, monthly_outgoings: inputs.monthlyOutgoings }, formulaBoundary: 'Sum only included accessible balances, then divide by positive monthly outgoings.', omissions: 'Taxes, penalties, access delays, returns, changing expenses and any adequacy judgment.' }) ?? '';
    setNotice(null); setErrorField(null); setResult({ value: next, signature: emergencyCoverageSignature(inputs), inputsSummary, monthlyOutgoings: inputs.monthlyOutgoings, handoffPrompt });
  }

  function reset() {
    setCash(''); setFixedDeposits(''); setOther(''); setOutgoings('');
    setFdCandidateIncluded(false); setOutgoingsCandidateIncluded(false); setResult(null); setNotice(null); setErrorField(null);
  }

  useEffect(() => {
    if (!result) return;
    AccessibilityInfo.announceForAccessibility(`Months covered: ${result.value.months.toFixed(1)}`);
    if (Platform.OS === 'web') {
      (resultHeading.current as unknown as { focus?: () => void } | null)?.focus?.();
    } else {
      const handle = findNodeHandle(resultHeading.current);
      if (handle) AccessibilityInfo.setAccessibilityFocus(handle);
    }
    if (shouldEmitEmergencyCoverage(lastEmittedSignature.current, result.signature)) {
      lastEmittedSignature.current = result.signature;
      onComputedRef.current();
    }
  }, [result]);

  function cancelHandoff() {
    setConfirming(false);
    setTimeout(() => {
      if (Platform.OS === 'web') (handoffOpener.current as unknown as { focus?: () => void } | null)?.focus?.();
      else { const handle = findNodeHandle(handoffOpener.current); if (handle) AccessibilityInfo.setAccessibilityFocus(handle); }
    }, 0);
  }

  return <ScrollView style={styles.screen} contentContainerStyle={styles.content}>
    <Pressable style={styles.back} onPress={() => navigation.navigate('Tools')} accessibilityRole="button" accessibilityLabel="Back to Tools"><Text style={styles.backText}>‹ Tools</Text></Pressable>
    <Text style={styles.heading} accessibilityRole="header">{surface === 'scenario' ? 'Emergency runway' : 'Emergency Coverage'}</Text>
    <View style={styles.scope}><Text style={styles.scopeTitle}>You choose every included amount</Text><Text style={styles.scopeBody}>Recorded figures are editable candidates. They start excluded, nothing here changes your saved records, and FinTutor does not decide what coverage is enough.</Text></View>
    <Text style={styles.question}>How many months would the accessible balances you enter cover at the monthly outgoings you enter?</Text>
    <Field inputRef={cashInput} error={errorField === 'cash' ? notice : null} label="Cash & bank balance" value={cash} onChange={edit(setCash)} />
    {sourcesLoading && <Text style={styles.loadNote} accessibilityLiveRegion="polite">Loading recorded Emergency Coverage candidates… Manual entry remains available.</Text>}
    {fdCandidate !== null && <Candidate label="Recorded fixed-deposit principal" offer={fdCandidate} included={fdCandidateIncluded} onToggle={() => { if (fdCandidateIncluded) { setFixedDeposits(''); setFdCandidateIncluded(false); } else { if (fdCandidate.total === null) return; setFixedDeposits(String(fdCandidate.total)); setFdCandidateIncluded(true); } setNotice(result ? INPUTS_CHANGED_NOTICE : null); setResult(null); }} />}
    <Field inputRef={fdInput} error={errorField === 'fd' ? notice : null} label="Fixed-deposit principal to include (optional)" value={fixedDeposits} onChange={(value) => { setFdCandidateIncluded(false); edit(setFixedDeposits)(value); }} />
    {!sourcesLoading && sourceFailure === null && fdCandidate === null && <Text style={styles.loadNote}>No recorded fixed-deposit candidate is available. This does not mean the amount is zero.</Text>}
    <Text style={styles.note}>Premature closure of a fixed deposit can reduce or delay the proceeds available.</Text>
    <Field inputRef={otherInput} error={errorField === 'other' ? notice : null} label="Other amount you know you could access (optional)" value={other} onChange={edit(setOther)} />
    {outgoingsCandidate !== null && <Candidate label="Recorded monthly outgoings" offer={outgoingsCandidate} included={outgoingsCandidateIncluded} onToggle={() => { if (outgoingsCandidateIncluded) { setOutgoings(''); setOutgoingsCandidateIncluded(false); } else { if (outgoingsCandidate.total === null) return; setOutgoings(String(outgoingsCandidate.total)); setOutgoingsCandidateIncluded(true); } setNotice(result ? INPUTS_CHANGED_NOTICE : null); setResult(null); }} />}
    <Field inputRef={outgoingsInput} error={errorField === 'outgoings' ? notice : null} label="Monthly outgoings" value={outgoings} onChange={(value) => { setOutgoingsCandidateIncluded(false); edit(setOutgoings)(value); }} />
    {!sourcesLoading && sourceFailure === null && outgoingsCandidate === null && <Text style={styles.loadNote}>No recorded monthly-outgoings candidate is available. This does not mean the amount is zero.</Text>}
    {sourceFailure === 'retryable' && <><Text style={styles.loadNote} accessibilityRole="alert">Recorded candidates could not be loaded. Manual entry remains available; nothing will retry or upload automatically.</Text><Pressable style={styles.retryButton} onPress={retrySources} accessibilityRole="button"><Text style={styles.retryButtonText}>Retry recorded candidates</Text></Pressable></>}
    {sourceFailure === 'permission' && <Text style={styles.loadNote} accessibilityRole="alert">Recorded candidates and this draft were cleared because your session no longer permits access. Sign in again to continue.</Text>}
    {!sourcesLoading && sourceFailure === null && <Pressable style={styles.retryButton} onPress={retrySources} accessibilityRole="button"><Text style={styles.retryButtonText}>Refresh recorded candidates</Text></Pressable>}
    <Pressable style={styles.button} onPress={calculate} accessibilityRole="button"><Text style={styles.buttonText}>{surface === 'scenario' ? 'Run this scenario' : 'Calculate'}</Text></Pressable>
    <Pressable style={styles.resetButton} onPress={reset} accessibilityRole="button"><Text style={styles.resetButtonText}>Reset scenario</Text></Pressable>
    {notice && <Text style={styles.loadNote} accessibilityRole="alert" accessibilityLiveRegion="polite">{notice}</Text>}
    {result && <View style={styles.result} accessibilityLiveRegion="polite">
      <Text ref={resultHeading} {...(Platform.OS === 'web' ? { tabIndex: -1 } : {})} style={styles.resultUnit} accessibilityRole="header">Months covered</Text>
      <Text style={styles.resultValue}>{result.value.months.toFixed(1)}</Text>
      <Text style={styles.evidenceHeading}>Inputs used</Text><Text style={styles.note}>{result.inputsSummary}</Text>
      <Text style={styles.evidenceHeading}>Formula and convention</Text><Text style={styles.note}>{formatRupees(result.value.accessibleBalances)} of included accessible balances divided by {formatRupees(result.monthlyOutgoings)} of monthly outgoings.</Text>
      <Text style={styles.evidenceHeading}>Rounding, caps and omissions</Text><Text style={styles.note}>Months display to one decimal. Blank optional balances are omitted. Taxes, penalties, access delays, returns and changing expenses are not modeled.</Text>
      <Text style={styles.counted}>No number of months is labelled enough, safe or adequate.</Text>
      <Pressable ref={handoffOpener} style={styles.aryaButton} accessibilityRole="button" onPress={() => setConfirming(true)}><Text style={styles.aryaButtonText}>Explore the mechanism with Arya</Text></Pressable>
      <ScenarioHandoffModal visible={confirming} prompt={result.handoffPrompt} onCancel={cancelHandoff} onConfirm={() => { setConfirming(false); navigation.navigate('Chat', { prefillQuestion: result.handoffPrompt }); }} />
    </View>}
    <View style={styles.teaching}><Text style={styles.teachingHeading}>What this does not model</Text><Text style={styles.note}>Taxes, penalties, access delays, returns, or changing expenses. Monthly outgoings stay editable; FinTutor does not decide which expenses you would cut. This result is not a target or a statement that the number of months is enough, safe, or adequate.</Text></View>
  </ScrollView>;
}

function Candidate({ label, offer, included, onToggle }: { label: string; offer: CalculatorCandidateOffer; included: boolean; onToggle: () => void }) {
  return <View style={styles.candidate}><View style={styles.candidateDetails}><Text style={styles.candidateSource}>FROM YOUR RECORDED DATA · {included ? 'INCLUDED' : 'EXCLUDED'}</Text><Text style={styles.candidateLabel}>{label}: {offer.total === null ? 'value unavailable' : formatRupees(offer.total)}</Text>{offer.candidates.map((candidate) => <Text key={`${candidate.source_kind}:${candidate.source_record_id}`} style={styles.candidateEvidence}>{candidate.source_label} · {candidate.source_fields.join(', ')} · record v{candidate.source_version} · {candidate.freshness_note} · retrieved {candidate.retrieved_at} · value {candidate.value_status}</Text>)}</View><Pressable style={[styles.includeButton, included && styles.includeButtonIncluded, offer.total === null && styles.includeButtonDisabled]} onPress={onToggle} disabled={offer.total === null} accessibilityRole="checkbox" accessibilityState={{ checked: included, disabled: offer.total === null }}><Text style={styles.includeButtonText}>{included ? 'Included' : 'Include'}</Text></Pressable></View>;
}

function Field({ label, value, onChange, inputRef, error }: { label: string; value: string; onChange: (v: string) => void; inputRef?: React.RefObject<TextInput | null>; error?: string | null }) {
  return <View style={styles.field}><View style={styles.labelRow}><Text style={styles.label}>{label}</Text></View><View style={[styles.inputRow, error && styles.inputRowError]}><Text style={styles.adorn}>₹</Text><TextInput ref={inputRef} style={styles.input} value={value} onChangeText={onChange} keyboardType="decimal-pad" accessibilityLabel={error ? `${label}. Error: ${error}` : label} placeholder="0" placeholderTextColor={colors.inkMuted} /></View></View>;
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: colors.screen }, content: { width: '100%', maxWidth: 720, alignSelf: 'center', padding: spacing.lg, paddingBottom: spacing.xxl },
  back: { minHeight: 44, alignSelf: 'flex-start', justifyContent: 'center', marginBottom: spacing.sm }, backText: { fontFamily: font.uiMedium, color: colors.tutor, fontSize: 16 },
  heading: { fontFamily: font.uiSemibold, fontSize: 28, color: colors.ink, marginBottom: spacing.sm }, question: { fontFamily: font.ui, fontSize: 16, lineHeight: 24, color: colors.inkSecondary, marginBottom: spacing.lg },
  scope: { borderWidth: 1, borderColor: colors.line, borderRadius: radius.md, backgroundColor: colors.canvas, padding: spacing.md, marginBottom: spacing.lg }, scopeTitle: { fontFamily: font.uiMedium, color: colors.ink, marginBottom: spacing.xs }, scopeBody: { fontFamily: font.tutor, color: colors.inkSecondary, lineHeight: 20 },
  field: { marginBottom: spacing.md }, labelRow: { flexDirection: 'row', justifyContent: 'space-between', gap: spacing.sm }, label: { flex: 1, fontFamily: font.uiMedium, color: colors.ink, marginBottom: spacing.xs },
  candidate: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', gap: spacing.sm, padding: spacing.md, marginBottom: spacing.sm, borderWidth: 1, borderColor: colors.line, borderRadius: radius.md, backgroundColor: colors.tutorSoft }, candidateDetails: { flex: 1 }, candidateSource: { fontFamily: font.mono, fontSize: 10, color: colors.inkMuted, marginBottom: spacing.xs }, candidateLabel: { fontFamily: font.uiMedium, color: colors.ink }, candidateEvidence: { fontFamily: font.ui, fontSize: 11, lineHeight: 16, color: colors.inkSecondary, marginTop: spacing.xs }, includeButton: { minHeight: 44, justifyContent: 'center', paddingHorizontal: spacing.md, borderRadius: radius.md, borderWidth: 1, borderColor: colors.tutor }, includeButtonIncluded: { backgroundColor: colors.tutorSoft }, includeButtonDisabled: { opacity: 0.5 }, includeButtonText: { fontFamily: font.uiMedium, color: colors.tutor },
  inputRow: { flexDirection: 'row', alignItems: 'center', borderWidth: 1, borderColor: colors.line, borderRadius: radius.md, backgroundColor: colors.screen }, adorn: { paddingLeft: spacing.md, color: colors.inkSecondary }, input: { flex: 1, minHeight: 48, padding: spacing.md, fontFamily: font.mono, color: colors.ink },
  inputRowError: { borderColor: colors.danger },
  note: { fontFamily: font.ui, fontSize: 14, lineHeight: 21, color: colors.inkSecondary }, loadNote: { fontFamily: font.ui, fontSize: 14, lineHeight: 20, color: colors.inkSecondary, marginBottom: spacing.md },
  button: { minHeight: 48, alignItems: 'center', justifyContent: 'center', backgroundColor: colors.tutor, borderRadius: radius.md, marginTop: spacing.lg }, buttonText: { fontFamily: font.uiMedium, color: colors.screen }, resetButton: { minHeight: 44, alignItems: 'center', justifyContent: 'center', marginBottom: spacing.lg }, resetButtonText: { fontFamily: font.uiMedium, color: colors.tutor },
  retryButton: { minHeight: 44, alignSelf: 'flex-start', justifyContent: 'center', borderWidth: 1, borderColor: colors.tutor, borderRadius: radius.md, paddingHorizontal: spacing.md, marginBottom: spacing.md }, retryButtonText: { fontFamily: font.uiMedium, color: colors.tutor },
  result: { backgroundColor: colors.screen, borderWidth: 1, borderColor: colors.line, borderRadius: radius.lg, padding: spacing.lg, marginBottom: spacing.lg }, resultUnit: { fontFamily: font.uiMedium, color: colors.inkSecondary }, resultValue: { fontFamily: font.mono, fontSize: 36, color: colors.ink, marginVertical: spacing.sm }, evidenceHeading: { fontFamily: font.mono, fontSize: 11, letterSpacing: 0.8, color: colors.ink, marginTop: spacing.md, marginBottom: spacing.xs, textTransform: 'uppercase' }, counted: { fontFamily: font.ui, color: colors.ink, marginTop: spacing.md, lineHeight: 20 },
  aryaButton: { minHeight: 48, alignItems: 'center', justifyContent: 'center', borderWidth: 1, borderColor: colors.tutor, borderRadius: radius.md, marginTop: spacing.lg, paddingHorizontal: spacing.md }, aryaButtonText: { fontFamily: font.uiMedium, color: colors.tutor },
  teaching: { borderTopWidth: 1, borderTopColor: colors.line, paddingTop: spacing.lg }, teachingHeading: { fontFamily: font.uiSemibold, fontSize: 18, color: colors.ink, marginBottom: spacing.sm },
});
