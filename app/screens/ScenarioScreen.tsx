import { useCallback, useEffect, useRef, useState } from 'react';
import { AccessibilityInfo, findNodeHandle, KeyboardAvoidingView, Platform, Pressable, ScrollView, StyleSheet, Text, TextInput, View } from 'react-native';
import { useFocusEffect, useNavigation, useRoute } from '@react-navigation/native';
import type { RouteProp } from '@react-navigation/native';
import type { BottomTabNavigationProp } from '@react-navigation/bottom-tabs';
import { TeachingBlock } from '../components/TeachingBlock';
import { colors, font, radius, spacing } from '../design/tokens';
import { useAuth } from '../lib/AuthContext';
import { calculateEmergencyCoverage } from '../lib/emergencyCoverage';
import { formatRupees } from '../lib/format';
import { fetchHoldings, type Holding } from '../lib/holdings';
import { recordScenarioCompleted } from '../lib/progression';
import { fetchScenarioCandidates, type ScenarioCandidate, type ScenarioCandidatesResponse } from '../lib/scenarioCandidates';
import { parseScenarioNumber } from '../lib/scenarioNumbers';
import { acceptRecordedCandidate, createCandidateDrafts, includedCandidateTotal, INPUTS_CHANGED_NOTICE, loanScenarioCandidates, refreshCandidateDrafts, resetCandidateDrafts, scenarioSourceFailure, updateCandidateDraft, type CandidateDraft } from '../lib/scenarioSession';
import { debtCost, idleCashOpportunity, monthsToTarget, sipIncrease } from '../lib/scenarios';
import type { MainTabsParamList } from '../navigation/types';

type GroupName = keyof Pick<ScenarioCandidatesResponse, 'monthly_outgoings' | 'monthly_sips' | 'invested_corpus' | 'fd_principal'>;
type LoadState = 'loading' | 'ready' | 'empty' | 'retryable' | 'permission';
type SourceGroup = { state: LoadState; drafts: CandidateDraft[] };
type FrozenResult = { title: string; primary: string; rows?: { label: string; value: string }[]; summary: string[]; formula: string; limits: string };
const emptyGroup = (): SourceGroup => ({ state: 'loading', drafts: [] });

export function ScenarioScreen() {
  const { params: { type } } = useRoute<RouteProp<MainTabsParamList, 'Scenario'>>();
  const { userId } = useAuth();
  const [focused, setFocused] = useState(false);
  const [session, setSession] = useState(0);
  useFocusEffect(useCallback(() => {
    setSession((value) => value + 1); setFocused(true);
    return () => setFocused(false);
  }, [type, userId]));
  const onComputed = useCallback(() => { if (userId) recordScenarioCompleted(userId, type); }, [type, userId]);
  if (!focused) return <View style={styles.screen} />;
  const sessionKey = `${userId ?? 'signed-out'}:${type}:${session}`;
  const props = { userId, onComputed };
  return <KeyboardAvoidingView style={styles.flex} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
    {type === 'emergency_runway' && <EmergencyRunway key={sessionKey} {...props} />}
    {type === 'sip_increase' && <SipIncrease key={sessionKey} {...props} />}
    {type === 'debt_cost' && <DebtCost key={sessionKey} {...props} />}
    {type === 'idle_cash' && <IdleCash key={sessionKey} {...props} />}
    {type === 'corpus_target' && <CorpusTarget key={sessionKey} {...props} />}
  </KeyboardAvoidingView>;
}

type ScenarioProps = { userId: string | null; onComputed: () => void };

function useCandidateGroups(userId: string | null, names: GroupName[]) {
  const generation = useRef(0);
  const [groups, setGroups] = useState<Record<GroupName, SourceGroup>>({ monthly_outgoings: emptyGroup(), monthly_sips: emptyGroup(), invested_corpus: emptyGroup(), fd_principal: emptyGroup() });
  const namesKey = names.join('|');
  const load = useCallback(async (only?: GroupName) => {
    const active = ++generation.current;
    const targets = only ? [only] : namesKey.split('|') as GroupName[];
    setGroups((current) => ({ ...current, ...Object.fromEntries(targets.map((name) => [name, { ...current[name], state: 'loading' }])) }));
    if (!userId) {
      setGroups((current) => ({ ...current, ...Object.fromEntries(targets.map((name) => [name, { state: 'permission', drafts: [] }])) })); return;
    }
    try {
      const response = await fetchScenarioCandidates();
      if (generation.current !== active) return;
      setGroups((current) => {
        const next = { ...current };
        for (const name of targets) {
          const candidates = response[name].candidates;
          next[name] = { state: candidates.length ? 'ready' : 'empty', drafts: only ? refreshCandidateDrafts(current[name].drafts, candidates) : createCandidateDrafts(candidates) };
        }
        return next;
      });
    } catch (error) {
      if (generation.current !== active) return;
      const state = scenarioSourceFailure(error);
      setGroups((current) => ({ ...current, ...Object.fromEntries(targets.map((name) => [name, { state, drafts: state === 'permission' ? [] : current[name].drafts }])) }));
    }
  }, [namesKey, userId]);
  useEffect(() => { load(); return () => { generation.current += 1; }; }, [load]);
  return { groups, setGroups, retry: (name: GroupName) => load(name) };
}

function updateGroup(setGroups: React.Dispatch<React.SetStateAction<Record<GroupName, SourceGroup>>>, name: GroupName, drafts: CandidateDraft[]) {
  setGroups((current) => ({ ...current, [name]: { ...current[name], drafts } }));
}

function ScenarioWrapper({ title, question, children, wontSay }: { title: string; question: string; children: React.ReactNode; wontSay: string }) {
  const navigation = useNavigation<BottomTabNavigationProp<MainTabsParamList>>();
  return <ScrollView style={styles.screen} contentContainerStyle={styles.content} keyboardShouldPersistTaps="handled">
    <Pressable style={styles.back} onPress={() => navigation.navigate('Tools')} accessibilityRole="button" accessibilityLabel="Back to Tools"><Text style={styles.backText}>‹ Tools</Text></Pressable>
    <Text style={styles.heading} accessibilityRole="header">{title}</Text><Text style={styles.question}>{question}</Text>
    <View style={styles.scope}><Text style={styles.scopeTitle}>You author this scenario</Text><Text style={styles.scopeBody}>Recorded figures are editable candidates. They start excluded, and nothing here changes your saved records.</Text></View>
    {children}<TeachingBlock heading="What we won't say" style={styles.teachingBlock}>{wontSay}</TeachingBlock>
  </ScrollView>;
}

function Field({ label, value, onChange, prefix, suffix, hint, error }: { label: string; value: string; onChange: (v: string) => void; prefix?: string; suffix?: string; hint?: string; error?: string | null }) {
  const id = `scenario-${label.toLowerCase().replace(/[^a-z0-9]+/g, '-')}`;
  return <View style={styles.fieldGroup}><Text style={styles.fieldLabel} nativeID={`${id}-label`}>{label}</Text><View style={[styles.inputRow, error && styles.inputError]}>{prefix && <Text style={styles.inputAdorn}>{prefix}</Text>}<TextInput style={styles.input} value={value} onChangeText={onChange} keyboardType="decimal-pad" placeholder={hint ?? 'Enter a value'} placeholderTextColor={colors.inkMuted} accessibilityLabelledBy={`${id}-label`} accessibilityLabel={error ? `${label}. Error: ${error}` : label}/>{suffix && <Text style={styles.inputAdorn}>{suffix}</Text>}</View>{error && <Text nativeID={`${id}-error`} style={styles.errorText} accessibilityRole="alert">{error}</Text>}</View>;
}

function CandidateGroup({ title, group, onChange, onRetry, onInvalidate }: { title: string; group: SourceGroup; onChange: (drafts: CandidateDraft[]) => void; onRetry: () => void; onInvalidate: () => void }) {
  const set = (drafts: CandidateDraft[]) => { onInvalidate(); onChange(drafts); };
  return <View style={styles.candidateSection}><Text style={styles.subheading}>{title}</Text><Text style={styles.helper}>Each recorded component is excluded until you include it.</Text>
    {group.state === 'loading' && <Status>Loading recorded candidates…</Status>}
    {group.state === 'permission' && <Status error>Recorded candidates are unavailable because your session no longer permits access. Sign in again; no prior-account values remain here.</Status>}
    {group.state === 'retryable' && <><Status>This source could not be refreshed. Your manual edits remain available.</Status><SmallButton label="Retry this source" onPress={onRetry}/></>}
    {group.state === 'empty' && <Status>Nothing recorded to offer here. This does not mean the amount is zero; enter it manually if you know it.</Status>}
    {group.drafts.map((draft) => <View key={draft.key} style={styles.candidateCard}><View style={styles.candidateTop}><View style={styles.candidateText}><Text style={styles.candidateLabel}>{draft.source_label}</Text><Text style={styles.provenance}>From your {draft.source_kind === 'holding' ? 'holding' : 'budget category'} · record v{draft.source_version}</Text><Text style={styles.provenance}>Freshness unavailable · loaded this session at {formatRetrieved(draft.retrieved_at)}</Text></View><Pressable style={[styles.toggle, draft.included && styles.toggleOn]} accessibilityRole="checkbox" accessibilityState={{ checked: draft.included }} onPress={() => set(updateCandidateDraft(group.drafts, draft.key, { included: !draft.included }))}><Text style={[styles.toggleText, draft.included && styles.toggleTextOn]}>{draft.included ? 'Included' : 'Excluded'}</Text></Pressable></View>
      {draft.value_status !== 'available' && <Text style={styles.errorText}>Recorded value is {draft.value_status}; enter a valid amount before including it.</Text>}
      <Field label={`${draft.source_label} amount`} prefix="₹" value={draft.draft} onChange={(value) => set(updateCandidateDraft(group.drafts, draft.key, { draft: value, touched: true }))} error={draft.included && !parseNonNegative(draft.draft) ? 'Enter a complete non-negative number.' : null}/>
      {draft.pendingRecordedValue !== undefined && <View style={styles.refreshBox}><Text style={styles.helper}>A refreshed record offers {draft.pendingRecordedValue === null ? 'an unavailable value' : money(draft.pendingRecordedValue)}. Your edit is still in use.</Text><View style={styles.actionRow}><SmallButton label="Accept new" onPress={() => set(group.drafts.map((item) => item.key === draft.key ? acceptRecordedCandidate(item) : item))}/><SmallButton label="Keep my edit" onPress={() => set(group.drafts.map((item) => item.key === draft.key ? { ...item, pendingRecordedValue: undefined } : item))}/><SmallButton label="Reset to recorded" onPress={() => set(group.drafts.map((item) => item.key === draft.key ? acceptRecordedCandidate(item) : item))}/></View></View>}
    </View>)}</View>;
}

function SmallButton({ label, onPress }: { label: string; onPress: () => void }) { return <Pressable style={styles.smallButton} onPress={onPress} accessibilityRole="button"><Text style={styles.smallButtonText}>{label}</Text></Pressable>; }
function RunButton({ onPress }: { onPress: () => void }) { return <Pressable style={styles.runBtn} onPress={onPress} accessibilityRole="button"><Text style={styles.runBtnText}>Run this scenario</Text></Pressable>; }
function ResetButton({ onPress }: { onPress: () => void }) { return <Pressable style={styles.resetBtn} onPress={onPress} accessibilityRole="button"><Text style={styles.resetText}>Reset scenario</Text></Pressable>; }
function Status({ children, error = false }: { children: string; error?: boolean }) { return <Text style={error ? styles.errorText : styles.status} accessibilityRole={error ? 'alert' : undefined} accessibilityLiveRegion={error ? 'assertive' : 'polite'}>{children}</Text>; }

function Result({ result, onRendered }: { result: FrozenResult; onRendered: () => void }) {
  const heading = useRef<Text>(null); const emitted = useRef(false);
  const webFocusProps = Platform.OS === 'web' ? { tabIndex: -1 } : {};
  useEffect(() => { AccessibilityInfo.announceForAccessibility(`${result.title}: ${result.primary}`); if (Platform.OS === 'web') { (heading.current as unknown as { focus?: () => void } | null)?.focus?.(); } else { const handle = findNodeHandle(heading.current); if (handle) AccessibilityInfo.setAccessibilityFocus(handle); } if (!emitted.current) { emitted.current = true; onRendered(); } }, [onRendered, result]);
  return <View style={styles.resultCard} accessibilityLiveRegion="polite"><Text ref={heading} {...webFocusProps} style={styles.resultUnit} accessibilityRole="header">{result.title}</Text><Text style={styles.resultValue}>{result.primary}</Text>{result.rows && <View style={styles.pathGrid}>{result.rows.map((row) => <View key={row.label} style={styles.pathCard}><Text style={styles.pathLabel}>{row.label}</Text><Text style={styles.pathValue}>{row.value}</Text></View>)}</View>}<Text style={styles.resultSection}>Inputs used</Text>{result.summary.map((line) => <Text key={line} style={styles.resultNote}>• {line}</Text>)}<Text style={styles.resultSection}>Formula and convention</Text><Text style={styles.resultNote}>{result.formula}</Text><Text style={styles.resultSection}>Rounding, caps and omissions</Text><Text style={styles.resultNote}>{result.limits}</Text></View>;
}

function formatRetrieved(value: string) { const date = new Date(value); return Number.isNaN(date.getTime()) ? 'an unknown time' : date.toLocaleString(); }
function money(value: number | null | undefined) { return formatRupees(value ?? 0); }
function parseNonNegative(raw: string) { const parsed = parseScenarioNumber(raw); return parsed && parsed.value >= 0 ? parsed : null; }
function parsePositive(raw: string) { const parsed = parseScenarioNumber(raw); return parsed && parsed.value > 0 ? parsed : null; }
function invalidator(result: FrozenResult | null, setResult: (value: FrozenResult | null) => void, setNotice: (value: string | null) => void) { return () => { if (result) setNotice(INPUTS_CHANGED_NOTICE); setResult(null); }; }
function candidateTotal(drafts: CandidateDraft[]) { return includedCandidateTotal(drafts, parseScenarioNumber); }
function manualPlusCandidates(raw: string, drafts: CandidateDraft[]) { const manual = raw.trim() === '' ? 0 : parseNonNegative(raw)?.value; const candidates = candidateTotal(drafts); return manual === undefined || candidates === null ? null : manual + candidates; }
function provenanceSummary(drafts: CandidateDraft[]) { const included = drafts.filter((draft) => draft.included); const excluded = drafts.filter((draft) => !draft.included); return `${included.length ? `Included recorded sources: ${included.map((draft) => draft.source_label).join(', ')}` : 'No recorded source included'}; ${excluded.length ? `excluded: ${excluded.map((draft) => draft.source_label).join(', ')}` : 'none excluded'}. Candidate edits are transient.`; }

function EmergencyRunway({ userId, onComputed }: ScenarioProps) {
  const { groups, setGroups, retry } = useCandidateGroups(userId, ['fd_principal', 'monthly_outgoings']);
  const [cash, setCash] = useState(''); const [other, setOther] = useState(''); const [manualOutgoings, setManualOutgoings] = useState(''); const [result, setResult] = useState<FrozenResult | null>(null); const [notice, setNotice] = useState<string | null>(null); const invalidate = invalidator(result, setResult, setNotice); const edit = (setter: (value: string) => void) => (value: string) => { invalidate(); setter(value); };
  const run = () => { const cashValue = cash.trim() === '' ? 0 : parseNonNegative(cash)?.value; const otherValue = other.trim() === '' ? 0 : parseNonNegative(other)?.value; const fd = candidateTotal(groups.fd_principal.drafts); const outgoings = manualPlusCandidates(manualOutgoings, groups.monthly_outgoings.drafts); const computed = cashValue === undefined || otherValue === undefined || fd === null || outgoings === null ? null : calculateEmergencyCoverage({ cashAndBank: cashValue, fixedDeposits: fd, otherAccessible: otherValue, monthlyOutgoings: outgoings }); if (!computed) { setResult(null); setNotice('Enter complete non-negative accessible amounts and monthly outgoings greater than zero.'); return; } setNotice(null); setResult({ title: 'Months covered', primary: computed.months.toFixed(1), summary: [`Cash/bank ${money(cashValue)}; included FD principal ${money(fd)}; other accessible ${money(otherValue)}`, `Monthly outgoings ${money(outgoings)}`, provenanceSummary([...groups.fd_principal.drafts, ...groups.monthly_outgoings.drafts])], formula: 'Accessible balances ÷ monthly outgoings. Only amounts you included or entered are counted.', limits: 'Months are shown to one decimal. Taxes, penalties, access delay, returns, changing expenses, retirement balances and RD instalments are not modeled.' }); };
  const reset = () => { setCash(''); setOther(''); setManualOutgoings(''); setResult(null); setNotice(null); updateGroup(setGroups, 'fd_principal', resetCandidateDrafts(groups.fd_principal.drafts)); updateGroup(setGroups, 'monthly_outgoings', resetCandidateDrafts(groups.monthly_outgoings.drafts)); };
  return <ScenarioWrapper title="Emergency runway" question="How many months would the accessible balances you choose cover at the monthly outgoings you choose?" wontSay="Whether this runway is enough, safe or adequate, or which expenses to cut."><CandidateGroup title="Recorded fixed-deposit principal" group={groups.fd_principal} onChange={(drafts) => updateGroup(setGroups, 'fd_principal', drafts)} onRetry={() => { invalidate(); retry('fd_principal'); }} onInvalidate={invalidate}/><Field label="Cash and bank amount" prefix="₹" value={cash} onChange={edit(setCash)}/><Field label="Other accessible amount (optional)" prefix="₹" value={other} onChange={edit(setOther)}/><CandidateGroup title="Recorded monthly outgoings" group={groups.monthly_outgoings} onChange={(drafts) => updateGroup(setGroups, 'monthly_outgoings', drafts)} onRetry={() => { invalidate(); retry('monthly_outgoings'); }} onInvalidate={invalidate}/><Field label="Other monthly outgoings" prefix="₹" value={manualOutgoings} onChange={edit(setManualOutgoings)}/><RunButton onPress={run}/><ResetButton onPress={reset}/>{notice && <Status error={notice !== INPUTS_CHANGED_NOTICE}>{notice}</Status>}{result && <Result result={result} onRendered={onComputed}/>}</ScenarioWrapper>;
}

function SipIncrease({ userId, onComputed }: ScenarioProps) {
  const { groups, setGroups, retry } = useCandidateGroups(userId, ['monthly_sips']); const [manual, setManual] = useState(''); const [extra, setExtra] = useState(''); const [rate, setRate] = useState(''); const [years, setYears] = useState(''); const [result, setResult] = useState<FrozenResult | null>(null); const [notice, setNotice] = useState<string | null>(null); const invalidate = invalidator(result, setResult, setNotice); const edit = (setter: (value: string) => void) => (value: string) => { invalidate(); setter(value); };
  const run = () => { const current = manualPlusCandidates(manual, groups.monthly_sips.drafts); const e = parsePositive(extra); const r = parseNonNegative(rate); const y = parsePositive(years); const computed = current === null || !e || !r || !y ? null : sipIncrease(current, e!.value, r!.value, y!.value); if (!computed) { setResult(null); setNotice('Use complete numbers: current SIP may be zero; extra and horizon must be above zero; rate must be 0–100%.'); return; } setNotice(null); setResult({ title: `Difference after ${y!.value} years`, primary: money(computed.difference), rows: [{ label: 'Current monthly amount path', value: money(computed.base) }, { label: 'Current plus extra path', value: money(computed.raised) }], summary: [`Current monthly amount ${money(current)}; extra ${money(e!.value)}; rate ${r!.value}%; horizon ${y!.value} years`, provenanceSummary(groups.monthly_sips.drafts)], formula: 'Monthly compounding with each contribution at month end. Both paths use the same user-entered rate and horizon.', limits: `Rupees are rounded for display. Extra principal contributed is ${money(computed.extraInvested)}. Taxes, fees, inflation and return variability are omitted; horizon is capped at 60 years.` }); };
  const reset = () => { setManual(''); setExtra(''); setRate(''); setYears(''); setResult(null); setNotice(null); updateGroup(setGroups, 'monthly_sips', resetCandidateDrafts(groups.monthly_sips.drafts)); };
  return <ScenarioWrapper title="Increase my SIP" question="What does an extra monthly amount do to the end corpus under assumptions you choose?" wontSay="Whether you should increase a SIP or what return to expect."><CandidateGroup title="Recorded monthly SIP candidates" group={groups.monthly_sips} onChange={(drafts) => updateGroup(setGroups, 'monthly_sips', drafts)} onRetry={() => { invalidate(); retry('monthly_sips'); }} onInvalidate={invalidate}/><Field label="Other current monthly amount" prefix="₹" value={manual} onChange={edit(setManual)}/><Field label="Extra each month" prefix="₹" value={extra} onChange={edit(setExtra)}/><Field label="Your annual return assumption" suffix="%" value={rate} onChange={edit(setRate)}/><Field label="Your horizon" suffix="years" value={years} onChange={edit(setYears)}/><RunButton onPress={run}/><ResetButton onPress={reset}/>{notice && <Status error={notice !== INPUTS_CHANGED_NOTICE}>{notice}</Status>}{result && <Result result={result} onRendered={onComputed}/>}</ScenarioWrapper>;
}

type LoanDraft = {
  evidence: ScenarioCandidate;
  holding: Holding;
  selected: boolean;
  outstanding: string;
  rate: string;
  months: string;
  touched: boolean;
  pendingHolding?: Holding;
};

function loanDraft(holding: Holding, evidence: ScenarioCandidate): LoanDraft {
  return {
    evidence,
    holding,
    selected: false,
    outstanding: rawField(holding, 'outstanding_balance'),
    rate: rawField(holding, 'interest_rate'),
    months: rawField(holding, 'tenure_months'),
    touched: false,
  };
}

function mergeLoanRefresh(current: LoanDraft[], holdings: Holding[], evidence: ScenarioCandidate[]): LoanDraft[] {
  const priorById = new Map(current.map((draft) => [draft.holding.id, draft]));
  return evidence.map((item) => {
    const holding = holdings.find((entry) => entry.id === item.source_record_id)!;
    const prior = priorById.get(holding.id);
    if (!prior || !prior.touched) return { ...loanDraft(holding, item), selected: prior?.selected ?? false };
    return { ...prior, evidence: item, pendingHolding: holding };
  });
}

function acceptLoanRefresh(draft: LoanDraft): LoanDraft {
  const holding = draft.pendingHolding ?? draft.holding;
  return { ...loanDraft(holding, draft.evidence), selected: draft.selected };
}
function DebtCost({ userId, onComputed }: ScenarioProps) {
  const generation = useRef(0); const [state, setState] = useState<LoadState>('loading'); const [loans, setLoans] = useState<LoanDraft[]>([]); const [result, setResult] = useState<FrozenResult | null>(null); const [notice, setNotice] = useState<string | null>(null); const invalidate = invalidator(result, setResult, setNotice);
  const load = useCallback(async () => { const active = ++generation.current; setState('loading'); if (!userId) { setLoans([]); setState('permission'); return; } try { const holdings = await fetchHoldings(userId); if (active !== generation.current) return; const evidence = loanScenarioCandidates(holdings, new Date().toISOString(), parseScenarioNumber); setLoans((current) => mergeLoanRefresh(current, holdings, evidence)); setState(evidence.length ? 'ready' : 'empty'); } catch (error) { if (active !== generation.current) return; const failure = scenarioSourceFailure(error); setState(failure); if (failure === 'permission') setLoans([]); } }, [userId]);
  useEffect(() => { load(); return () => { generation.current += 1; }; }, [load]);
  const select = (index: number) => { invalidate(); setLoans((all) => all.map((loan, i) => ({ ...loan, selected: i === index ? !loan.selected : false }))); }; const change = (index: number, field: 'outstanding' | 'rate' | 'months', value: string) => { invalidate(); setLoans((all) => all.map((loan, i) => i === index ? { ...loan, [field]: value, touched: true } : loan)); };
  const run = () => { const loan = loans.find((item) => item.selected); const o = loan && parsePositive(loan.outstanding); const r = loan && parseNonNegative(loan.rate); const m = loan && parsePositive(loan.months); const computed = o && r && m ? debtCost(o!.value, r!.value, m!.value) : null; if (!loan || !computed) { setResult(null); setNotice('Choose one home or personal loan and enter a positive balance, a 0–100% rate, and 1–600 whole months.'); return; } setNotice(null); setResult({ title: 'Interest over the next 12 months', primary: money(computed.nextYearInterest), rows: [{ label: 'Monthly EMI', value: money(computed.emi) }, { label: 'Interest over remaining tenure', value: money(computed.totalInterest) }, { label: 'Total payable', value: money(computed.totalPayable) }], summary: [`${loan.evidence.source_label}: balance ${money(o!.value)}, rate ${r!.value}%, ${m!.value} months`, `From your holding · record v${loan.evidence.source_version} · freshness unavailable · loaded this session`], formula: 'Fixed-rate amortisation. Each month adds interest to the outstanding balance, then subtracts one equal modeled payment.', limits: 'Rupees are rounded for display. Months must be whole and are capped at 600. Fees, rate changes, prepayment and missed payments are omitted.' }); };
  const reset = () => { setLoans((all) => all.map((loan) => ({ ...acceptLoanRefresh(loan), selected: false }))); setResult(null); setNotice(null); };
  return <ScenarioWrapper title="Debt cost" question="How much interest sits inside the remaining repayments for one loan you choose?" wontSay="Whether to prepay, refinance, invest instead or keep the loan.">
    <Text style={styles.subheading}>Recorded eligible loans</Text>
    {state === 'loading' && <Status>Loading your loans…</Status>}
    {state === 'empty' && <Status>No home or personal loan is recorded to offer. This does not assert that you have no debt.</Status>}
    {state === 'permission' && <Status error>Your session no longer permits this account read. Sign in again; prior values were cleared.</Status>}
    {state === 'retryable' && <><Status>Your loans could not be refreshed. Your edits remain available.</Status><SmallButton label="Retry loans" onPress={() => { invalidate(); load(); }}/></>}
    {loans.map((loan, index) => <View key={loan.holding.id} style={styles.candidateCard}>
      <Pressable style={[styles.loanSelect, loan.selected && styles.toggleOn]} accessibilityRole="radio" accessibilityState={{ selected: loan.selected }} onPress={() => select(index)}><Text style={[styles.toggleText, loan.selected && styles.toggleTextOn]}>{loan.selected ? 'Selected' : 'Select'} {loan.evidence.source_label}</Text></Pressable>
      <Text style={styles.provenance}>From your holding · record v{loan.evidence.source_version} · freshness unavailable</Text>
      <Field label={`${loan.evidence.source_label} outstanding balance`} prefix="₹" value={loan.outstanding} onChange={(value) => change(index, 'outstanding', value)}/>
      <Field label={`${loan.evidence.source_label} annual rate`} suffix="%" value={loan.rate} onChange={(value) => change(index, 'rate', value)}/>
      <Field label={`${loan.evidence.source_label} months remaining`} suffix="months" value={loan.months} onChange={(value) => change(index, 'months', value)}/>
      {loan.pendingHolding && <View style={styles.refreshBox}><Text style={styles.helper}>This loan record changed. Your edited values are still in use.</Text><View style={styles.actionRow}>
        <SmallButton label="Accept new" onPress={() => { invalidate(); setLoans((all) => all.map((item, i) => i === index ? acceptLoanRefresh(item) : item)); }}/>
        <SmallButton label="Keep my edit" onPress={() => { invalidate(); setLoans((all) => all.map((item, i) => i === index ? { ...item, holding: item.pendingHolding ?? item.holding, pendingHolding: undefined } : item)); }}/>
        <SmallButton label="Reset to recorded" onPress={() => { invalidate(); setLoans((all) => all.map((item, i) => i === index ? acceptLoanRefresh(item) : item)); }}/>
      </View></View>}
    </View>)}
    <RunButton onPress={run}/><ResetButton onPress={reset}/>
    {notice && <Status error={notice !== INPUTS_CHANGED_NOTICE}>{notice}</Status>}
    {result && <Result result={result} onRendered={onComputed}/>}
  </ScenarioWrapper>;
}
function rawField(holding: Holding, field: string) { const raw = holding.characteristics[field]; const parsed = parseScenarioNumber(typeof raw === 'string' || typeof raw === 'number' ? String(raw) : ''); return parsed && parsed.value >= 0 ? parsed.normalized : ''; }

function IdleCash({ onComputed }: ScenarioProps) {
  const [cash, setCash] = useState(''); const [a, setA] = useState(''); const [b, setB] = useState(''); const [years, setYears] = useState(''); const [result, setResult] = useState<FrozenResult | null>(null); const [notice, setNotice] = useState<string | null>(null); const invalidate = invalidator(result, setResult, setNotice); const edit = (setter: (value: string) => void) => (value: string) => { invalidate(); setter(value); };
  const run = () => { const c = parsePositive(cash), r1 = parseNonNegative(a), r2 = parseNonNegative(b), y = parsePositive(years); const computed = c && r1 && r2 && y ? idleCashOpportunity(c!.value, r1!.value, r2!.value, y!.value) : null; if (!computed) { setResult(null); setNotice('Enter a positive amount and horizon, with both user-chosen rates between 0% and 100%.'); return; } setNotice(null); setResult({ title: `Signed difference after ${y!.value} years`, primary: money(computed.difference), rows: [{ label: `Path A at ${r1!.value}%`, value: money(computed.atSavingsRate) }, { label: `Path B at ${r2!.value}%`, value: money(computed.atAlternateRate) }], summary: [`Amount ${money(c!.value)}; Path A rate ${r1!.value}%; Path B rate ${r2!.value}%; horizon ${y!.value} years`, 'All values were entered by you; no account record or FinTutor rate was used.'], formula: 'The same starting amount is compounded annually at each user-entered rate; Path B minus Path A is shown as a signed arithmetic difference.', limits: 'Rupees are rounded for display. Taxes, fees, liquidity, inflation, risk and rate variability are omitted; horizon is capped at 60 years.' }); };
  const reset = () => { setCash(''); setA(''); setB(''); setYears(''); setResult(null); setNotice(null); };
  return <ScenarioWrapper title="Idle cash over time" question="What does the same cash amount become under two rates and a horizon you choose?" wontSay="That either path is better, achievable or appropriate. Equal, positive and negative differences are arithmetic only."><Field label="Cash amount" prefix="₹" value={cash} onChange={edit(setCash)}/><Field label="Path A annual rate" suffix="%" value={a} onChange={edit(setA)}/><Field label="Path B annual rate" suffix="%" value={b} onChange={edit(setB)}/><Field label="Your horizon" suffix="years" value={years} onChange={edit(setYears)}/><RunButton onPress={run}/><ResetButton onPress={reset}/>{notice && <Status error={notice !== INPUTS_CHANGED_NOTICE}>{notice}</Status>}{result && <Result result={result} onRendered={onComputed}/>}</ScenarioWrapper>;
}

function CorpusTarget({ userId, onComputed }: ScenarioProps) {
  const { groups, setGroups, retry } = useCandidateGroups(userId, ['invested_corpus', 'monthly_sips']); const [manualCorpus, setManualCorpus] = useState(''); const [manualSip, setManualSip] = useState(''); const [rate, setRate] = useState(''); const [target, setTarget] = useState(''); const [result, setResult] = useState<FrozenResult | null>(null); const [notice, setNotice] = useState<string | null>(null); const invalidate = invalidator(result, setResult, setNotice); const edit = (setter: (value: string) => void) => (value: string) => { invalidate(); setter(value); };
  const run = () => { const corpus = manualPlusCandidates(manualCorpus, groups.invested_corpus.drafts), sip = manualPlusCandidates(manualSip, groups.monthly_sips.drafts), r = parseNonNegative(rate), t = parsePositive(target); const computed = corpus === null || sip === null || !r || !t ? null : monthsToTarget(corpus, sip, r!.value, t!.value); if (!computed) { setResult(null); setNotice('Enter complete non-negative corpus and monthly amounts, a 0–100% rate, and a positive target.'); return; } const primary = computed.alreadyReached ? '0 months' : computed.months === null ? 'Not reached within 60 years' : `${computed.months} months (${computed.years!.toFixed(1)} years)`; setNotice(null); setResult({ title: 'Time to your corpus target', primary, summary: [`Current corpus ${money(corpus)}; monthly contribution ${money(sip)}; rate ${r!.value}%; target ${money(t!.value)}`, provenanceSummary([...groups.invested_corpus.drafts, ...groups.monthly_sips.drafts])], formula: 'Each month applies one month of the user-entered annual rate to the current balance, then adds the contribution at month end.', limits: 'Time is shown in whole months and one-decimal years. The search caps at 720 months. Taxes, fees, inflation, return variability and contribution changes are omitted.' }); };
  const reset = () => { setManualCorpus(''); setManualSip(''); setRate(''); setTarget(''); setResult(null); setNotice(null); updateGroup(setGroups, 'invested_corpus', resetCandidateDrafts(groups.invested_corpus.drafts)); updateGroup(setGroups, 'monthly_sips', resetCandidateDrafts(groups.monthly_sips.drafts)); };
  return <ScenarioWrapper title="Time to corpus" question="When does the corpus reach a target you set under your own rate and contribution assumptions?" wontSay="What your target should be, whether it is sufficient, or what return to expect."><Field label="Your corpus target" prefix="₹" value={target} onChange={edit(setTarget)}/><CandidateGroup title="Recorded corpus candidates" group={groups.invested_corpus} onChange={(drafts) => updateGroup(setGroups, 'invested_corpus', drafts)} onRetry={() => { invalidate(); retry('invested_corpus'); }} onInvalidate={invalidate}/><Field label="Other current corpus" prefix="₹" value={manualCorpus} onChange={edit(setManualCorpus)}/><CandidateGroup title="Recorded monthly contribution candidates" group={groups.monthly_sips} onChange={(drafts) => updateGroup(setGroups, 'monthly_sips', drafts)} onRetry={() => { invalidate(); retry('monthly_sips'); }} onInvalidate={invalidate}/><Field label="Other monthly contribution" prefix="₹" value={manualSip} onChange={edit(setManualSip)}/><Field label="Your annual return assumption" suffix="%" value={rate} onChange={edit(setRate)}/><RunButton onPress={run}/><ResetButton onPress={reset}/>{notice && <Status error={notice !== INPUTS_CHANGED_NOTICE}>{notice}</Status>}{result && <Result result={result} onRendered={onComputed}/>}</ScenarioWrapper>;
}

const styles = StyleSheet.create({ flex: { flex: 1 }, screen: { flex: 1, backgroundColor: colors.screen }, content: { width: '100%', maxWidth: 760, alignSelf: 'center', padding: spacing.xl, paddingBottom: spacing.xxxl }, back: { minHeight: 44, alignSelf: 'flex-start', justifyContent: 'center', marginBottom: spacing.md }, backText: { fontFamily: font.uiMedium, fontSize: 15, color: colors.tutor }, heading: { fontFamily: font.uiSemibold, fontSize: 26, color: colors.ink, marginBottom: spacing.sm }, question: { fontFamily: font.tutor, fontSize: 16, lineHeight: 24, color: colors.inkSecondary, marginBottom: spacing.lg }, scope: { borderLeftWidth: 3, borderLeftColor: colors.tutor, paddingLeft: spacing.md, marginBottom: spacing.xl }, scopeTitle: { fontFamily: font.uiSemibold, color: colors.ink, fontSize: 14 }, scopeBody: { fontFamily: font.ui, fontSize: 13, lineHeight: 19, color: colors.inkSecondary, marginTop: spacing.xs }, subheading: { fontFamily: font.uiSemibold, fontSize: 17, color: colors.ink, marginBottom: spacing.xs }, helper: { fontFamily: font.ui, fontSize: 13, lineHeight: 19, color: colors.inkSecondary }, candidateSection: { marginBottom: spacing.xl }, candidateCard: { borderTopWidth: StyleSheet.hairlineWidth, borderTopColor: colors.line, paddingTop: spacing.lg, marginTop: spacing.lg }, candidateTop: { flexDirection: 'row', alignItems: 'flex-start', gap: spacing.sm }, candidateText: { flex: 1 }, candidateLabel: { fontFamily: font.uiSemibold, fontSize: 15, color: colors.ink }, provenance: { fontFamily: font.ui, fontSize: 12, lineHeight: 18, color: colors.inkMuted, marginTop: 2 }, toggle: { minHeight: 44, minWidth: 82, borderWidth: 1, borderColor: colors.line, borderRadius: radius.md, alignItems: 'center', justifyContent: 'center', paddingHorizontal: spacing.sm }, toggleOn: { backgroundColor: colors.tutor, borderColor: colors.tutor }, toggleText: { fontFamily: font.uiMedium, fontSize: 12, color: colors.ink }, toggleTextOn: { color: colors.screen }, fieldGroup: { marginTop: spacing.lg }, fieldLabel: { fontFamily: font.mono, fontSize: 11, letterSpacing: .7, textTransform: 'uppercase', color: colors.inkMuted, marginBottom: spacing.xs }, inputRow: { minHeight: 48, flexDirection: 'row', alignItems: 'center', borderWidth: 1, borderColor: colors.line, borderRadius: radius.md, backgroundColor: colors.canvas, overflow: 'hidden' }, inputError: { borderColor: colors.danger }, inputAdorn: { fontFamily: font.uiMedium, color: colors.inkSecondary, paddingHorizontal: spacing.md }, input: { flex: 1, minHeight: 48, paddingHorizontal: spacing.md, fontFamily: font.mono, fontSize: 16, color: colors.ink }, errorText: { fontFamily: font.ui, fontSize: 13, lineHeight: 19, color: colors.danger, marginTop: spacing.xs }, status: { fontFamily: font.ui, fontSize: 13, lineHeight: 19, color: colors.inkSecondary, marginVertical: spacing.sm }, refreshBox: { backgroundColor: colors.canvas, borderWidth: 1, borderColor: colors.line, padding: spacing.md, borderRadius: radius.md, marginTop: spacing.sm }, actionRow: { flexDirection: 'row', flexWrap: 'wrap', gap: spacing.sm, marginTop: spacing.sm }, smallButton: { minHeight: 44, justifyContent: 'center', borderBottomWidth: 1, borderBottomColor: colors.tutor, paddingHorizontal: spacing.xs }, smallButtonText: { fontFamily: font.uiMedium, fontSize: 13, color: colors.tutor }, runBtn: { minHeight: 48, alignItems: 'center', justifyContent: 'center', backgroundColor: colors.tutor, borderRadius: radius.md, marginTop: spacing.xl }, runBtnText: { fontFamily: font.uiSemibold, fontSize: 15, color: colors.screen }, resetBtn: { minHeight: 44, alignItems: 'center', justifyContent: 'center', marginBottom: spacing.lg }, resetText: { fontFamily: font.uiMedium, fontSize: 14, color: colors.inkSecondary }, resultCard: { borderWidth: 1, borderColor: colors.line, borderRadius: radius.lg, padding: spacing.lg, marginTop: spacing.lg }, resultUnit: { fontFamily: font.uiSemibold, fontSize: 17, color: colors.ink }, resultValue: { fontFamily: font.monoSemibold, fontSize: 28, color: colors.ink, marginVertical: spacing.md }, pathGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: spacing.md }, pathCard: { flexGrow: 1, flexBasis: 140, minHeight: 88, borderWidth: 1, borderColor: colors.line, borderRadius: radius.md, padding: spacing.md, justifyContent: 'space-between' }, pathLabel: { fontFamily: font.ui, fontSize: 12, lineHeight: 17, color: colors.inkSecondary }, pathValue: { fontFamily: font.monoMedium, fontSize: 17, color: colors.ink, marginTop: spacing.sm }, resultSection: { fontFamily: font.uiSemibold, fontSize: 13, color: colors.ink, marginTop: spacing.lg, marginBottom: spacing.xs }, resultNote: { fontFamily: font.ui, fontSize: 13, lineHeight: 20, color: colors.inkSecondary }, loanSelect: { minHeight: 44, borderWidth: 1, borderColor: colors.line, borderRadius: radius.md, alignItems: 'center', justifyContent: 'center', marginBottom: spacing.sm }, teachingBlock: { marginTop: spacing.xxl } });
