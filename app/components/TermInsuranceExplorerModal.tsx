import { useEffect, useMemo, useRef, useState } from 'react';
import {
  Modal,
  AccessibilityInfo,
  findNodeHandle,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Switch,
  Text,
  TextInput,
  View,
} from 'react-native';
import { colors, font, radius, spacing } from '../design/tokens';
import { typography } from '../design/typography';
import { formatRupees } from '../lib/format';
import { fetchFinancialContext, type FinancialContext } from '../lib/financialContext';
import { RequestGeneration } from '../lib/requestGeneration';
import { INPUTS_CHANGED_NOTICE } from '../lib/scenarioSession';
import { parseScenarioNumber } from '../lib/scenarioNumbers';
import type { GoalRecord } from '../lib/goals';
import type { Holding } from '../lib/holdings';
import {
  calculateTermInsuranceExploration,
  recordedTermInsuranceContext,
  type TermInsuranceComponent,
  type TermInsuranceResult,
} from '../lib/termInsurance';

type GrowthMode = 'zero' | 'custom' | null;

export function TermInsuranceExplorerModal({
  visible,
  holdings,
  goals,
  recordedContextAvailable,
  onDismiss,
}: {
  visible: boolean;
  holdings: Holding[];
  goals: GoalRecord[];
  recordedContextAvailable: boolean;
  onDismiss: () => void;
}) {
  const recorded = useMemo(() => recordedTermInsuranceContext(holdings, goals), [holdings, goals]);
  const [consented, setConsented] = useState(false);
  const [components, setComponents] = useState<TermInsuranceComponent[]>([]);
  const [amountDrafts, setAmountDrafts] = useState<Record<string, string>>({});
  const [supportAnnual, setSupportAnnual] = useState('');
  const [supportYears, setSupportYears] = useState('');
  const [supportGrowth, setSupportGrowth] = useState('');
  const [supportGrowthMode, setSupportGrowthMode] = useState<GrowthMode>(null);
  const [includeSurvivorIncome, setIncludeSurvivorIncome] = useState(false);
  const [survivorAnnual, setSurvivorAnnual] = useState('');
  const [survivorYears, setSurvivorYears] = useState('');
  const [survivorGrowth, setSurvivorGrowth] = useState('');
  const [survivorGrowthMode, setSurvivorGrowthMode] = useState<GrowthMode>(null);
  const [individualCover, setIndividualCover] = useState('');
  const [includeIndividualCover, setIncludeIndividualCover] = useState(false);
  const [groupCover, setGroupCover] = useState('');
  const [includeGroupCover, setIncludeGroupCover] = useState(false);
  const [otherCover, setOtherCover] = useState('');
  const [includeOtherCover, setIncludeOtherCover] = useState(false);
  const [result, setResult] = useState<TermInsuranceResult | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [confirmedContext, setConfirmedContext] = useState<FinancialContext | null>(null);
  const [notice, setNotice] = useState<string | null>(null);
  const [retrievedAt, setRetrievedAt] = useState<string | null>(null);
  const contextRequest = useRef(new RequestGeneration());

  const dismiss = () => {
    contextRequest.current.cancel();
    setConsented(false);
    setComponents([]);
    setAmountDrafts({});
    setSupportAnnual('');
    setSupportYears('');
    setSupportGrowth('');
    setSupportGrowthMode(null);
    setIncludeSurvivorIncome(false);
    setSurvivorAnnual('');
    setSurvivorYears('');
    setSurvivorGrowth('');
    setSurvivorGrowthMode(null);
    setIndividualCover('');
    setIncludeIndividualCover(false);
    setGroupCover('');
    setIncludeGroupCover(false);
    setOtherCover('');
    setIncludeOtherCover(false);
    setResult(null);
    setError(null);
    setConfirmedContext(null);
    setNotice(null);
    setRetrievedAt(null);
    onDismiss();
  };

  useEffect(() => () => { contextRequest.current.cancel(); }, []);

  const useRecordedContext = async () => {
    const request = contextRequest.current.begin();
    setComponents(recorded.components);
    setRetrievedAt(new Date().toISOString());
    setAmountDrafts(Object.fromEntries(recorded.components.map((item) => [item.id, String(item.amount)])));
    const everyRecordedCoverKnown = recorded.individualCoverSources.length > 0
      && recorded.individualCoverSources.every((source) => !source.includes('needs confirmation'));
    setIndividualCover(everyRecordedCoverKnown ? String(recorded.individualCover) : '');
    setIncludeIndividualCover(false);
    setConsented(true);
    const context = await fetchFinancialContext().catch(() => null);
    if (contextRequest.current.isCurrent(request)) setConfirmedContext(context);
  };
  const startBlank = () => {
    contextRequest.current.cancel();
    setComponents([]);
    setRetrievedAt(null);
    setAmountDrafts({});
    setIndividualCover('');
    setIncludeIndividualCover(false);
    setConsented(true);
  };

  const addComponent = (kind: TermInsuranceComponent['kind']) => {
    const id = `manual:${kind}:${Date.now()}`;
    const labels = { debt: 'Other debt', goal: 'Other goal', asset: 'Other available asset' };
    setComponents((current) => [...current, {
      id,
      kind,
      label: labels[kind],
      amount: Number.NaN,
      source: 'Added in this temporary scenario',
      included: true,
    }]);
    setAmountDrafts((current) => ({ ...current, [id]: '' }));
    setResult(null);
  };

  const updateComponent = (id: string, included: boolean) => {
    setComponents((current) => current.map((item) => item.id === id ? { ...item, included } : item));
    invalidateResult();
  };
  const invalidateResult = () => {
    if (result) setNotice(INPUTS_CHANGED_NOTICE);
    setResult(null);
    setError(null);
  };
  const changeDraft = (setter: (value: string) => void) => (value: string) => {
    setter(value);
    invalidateResult();
  };

  const calculate = () => {
    const parseDraft = (value: string) => value.trim() === '' ? Number.NaN : parseScenarioNumber(value)?.value ?? Number.NaN;
    const parsedComponents = components.map((item) => ({ ...item, amount: parseDraft(amountDrafts[item.id] ?? '') }));
    const next = calculateTermInsuranceExploration({
      householdSupport: {
        annualAmount: parseDraft(supportAnnual),
        years: parseDraft(supportYears),
        growthPercent: supportGrowthMode === 'zero' ? 0 : parseDraft(supportGrowth),
      },
      survivorIncome: includeSurvivorIncome ? {
        annualAmount: parseDraft(survivorAnnual),
        years: parseDraft(survivorYears),
        growthPercent: survivorGrowthMode === 'zero' ? 0 : parseDraft(survivorGrowth),
      } : null,
      components: parsedComponents,
      existingIndividualCover: includeIndividualCover ? parseDraft(individualCover) : 0,
      existingGroupCover: includeGroupCover ? parseDraft(groupCover) : 0,
      existingOtherCover: includeOtherCover ? parseDraft(otherCover) : 0,
    });
    if (!next || !supportGrowthMode || [supportAnnual, supportYears].some((v) => v.trim() === '')
      || (supportGrowthMode === 'custom' && supportGrowth.trim() === '')
      || (includeIndividualCover && individualCover.trim() === '')
      || (includeGroupCover && groupCover.trim() === '')
      || (includeOtherCover && otherCover.trim() === '')) {
      setResult(null);
      setError('Complete every required field with valid non-negative values. Years must be 1–100 and growth 0–100%.');
      return;
    }
    if (includeSurvivorIncome && (!survivorGrowthMode || [survivorAnnual, survivorYears].some((v) => v.trim() === '')
      || (survivorGrowthMode === 'custom' && survivorGrowth.trim() === ''))) {
      setResult(null);
      setError('Enter the survivor-income amount and years, or exclude that stream.');
      return;
    }
    setError(null);
    setNotice(null);
    setResult(next);
  };

  return (
    <Modal visible={visible} animationType="slide" onRequestClose={dismiss}>
      <ScrollView style={styles.screen} contentContainerStyle={styles.content}>
        <View style={styles.header}>
          <Text style={styles.title}>Explore term-cover components</Text>
          <Pressable accessibilityRole="button" onPress={dismiss}><Text style={styles.close}>Close</Text></Pressable>
        </View>
        <Text style={styles.intro}>
          This is an educational model, not a recommendation or quote. It shows how selected support,
          debts, goals, assets and income interact. Your scenario is not saved.
        </Text>

        {!consented ? (
          <View style={styles.consentBox}>
            <Text style={styles.sectionTitle}>Use your recorded information?</Text>
            <Text style={styles.body}>
              With your permission, FinTutor will copy confirmed loan balances, goal targets, holding values
              and recorded term cover into this temporary scenario. Every source stays visible and editable.
            </Text>
            {!recordedContextAvailable ? (
              <Text accessibilityRole="alert" style={styles.error}>
                Recorded context is unavailable right now. You can still build a blank scenario.
              </Text>
            ) : null}
            <Pressable style={styles.primaryButton} disabled={!recordedContextAvailable} onPress={useRecordedContext}>
              <Text style={styles.primaryButtonText}>
                {recordedContextAvailable ? 'Use recorded context' : 'Recorded context unavailable'}
              </Text>
            </Pressable>
            <Pressable style={styles.secondaryButton} onPress={startBlank}>
              <Text style={styles.secondaryButtonText}>Start without recorded context</Text>
            </Pressable>
          </View>
        ) : (
          <>
            {confirmedContext ? (
              <View style={styles.contextNote}>
                <Text style={styles.componentLabel}>Confirmed context used carefully</Text>
                <Text style={styles.source}>
                  Financial dependants: {confirmedContext.dependant_count ?? 'unknown'} · source: optional financial context.
                  A dependant count is never converted into a rupee support amount; you enter that critical amount below.
                </Text>
                <Text style={styles.source}>
                  Emergency-fund months are not used here because liquidity coverage is not a debt, goal,
                  survivor-income stream, available-asset selection or existing-cover amount.
                </Text>
              </View>
            ) : null}
            <Text style={styles.sectionTitle}>Household support · required</Text>
            <Text style={styles.help}>Enter the annual support amount and how many years to model, then explicitly choose 0% growth or your own growth assumption.</Text>
            <Field label="Annual household support (₹)" value={supportAnnual} onChange={changeDraft(setSupportAnnual)} />
            <Field label="Years (1–100)" value={supportYears} onChange={changeDraft(setSupportYears)} />
            <GrowthModeChoice label="Household-support growth mode" value={supportGrowthMode} onChange={(value) => { setSupportGrowthMode(value); invalidateResult(); }} />
            {supportGrowthMode === 'custom' ? <Field label="Your annual growth assumption (%)" value={supportGrowth} onChange={changeDraft(setSupportGrowth)} /> : null}

            <Text style={styles.sectionTitle}>Recorded components</Text>
            {components.length === 0 ? <Text style={styles.help}>No usable recorded debts, goals or assets were found.</Text> : null}
            {components.map((item) => (
              <View key={item.id} style={styles.componentRow}>
                <View style={styles.componentHeading}>
                  <View style={styles.componentCopy}>
                    <Text style={styles.componentLabel}>{item.label}</Text>
                    <Text style={styles.source}>{item.source}</Text>
                    {item.sourceRecordId ? <Text style={styles.source}>Record {item.sourceRecordId} · v{item.sourceVersion ?? 'unknown'} · fields: {item.sourceFields?.join(', ') ?? 'unknown'} · freshness unavailable · loaded {retrievedAt ? new Date(retrievedAt).toLocaleString() : 'this session'}</Text> : null}
                  </View>
                  <Switch accessibilityLabel={`Include ${item.label}`} value={item.included} onValueChange={(value) => updateComponent(item.id, value)} />
                </View>
                <TextInput
                  accessibilityLabel={`${item.label} amount`}
                  style={[styles.input, !item.included && styles.inputDisabled]}
                  keyboardType="decimal-pad"
                  editable={item.included}
                  value={amountDrafts[item.id] ?? ''}
                  onChangeText={(value) => { setAmountDrafts((drafts) => ({ ...drafts, [item.id]: value })); invalidateResult(); }}
                />
              </View>
            ))}
            <View style={styles.addComponentRow}>
              <Pressable onPress={() => addComponent('debt')}><Text style={styles.addComponent}>+ Debt</Text></Pressable>
              <Pressable onPress={() => addComponent('goal')}><Text style={styles.addComponent}>+ Goal</Text></Pressable>
              <Pressable onPress={() => addComponent('asset')}><Text style={styles.addComponent}>+ Available asset</Text></Pressable>
            </View>

            <View style={styles.toggleRow}>
              <View style={styles.componentCopy}>
                <Text style={styles.componentLabel}>Include survivor income</Text>
                <Text style={styles.source}>Only if you choose to model this offset</Text>
              </View>
              <Switch accessibilityLabel="Include survivor income" value={includeSurvivorIncome} onValueChange={(value) => { setIncludeSurvivorIncome(value); setSurvivorGrowthMode(null); invalidateResult(); }} />
            </View>
            {includeSurvivorIncome ? (
              <>
                <Field label="Annual survivor income (₹)" value={survivorAnnual} onChange={changeDraft(setSurvivorAnnual)} />
                <Field label="Years (1–100)" value={survivorYears} onChange={changeDraft(setSurvivorYears)} />
                <GrowthModeChoice label="Survivor-income growth mode" value={survivorGrowthMode} onChange={(value) => { setSurvivorGrowthMode(value); invalidateResult(); }} />
                {survivorGrowthMode === 'custom' ? <Field label="Your survivor-income growth assumption (%)" value={survivorGrowth} onChange={changeDraft(setSurvivorGrowth)} /> : null}
              </>
            ) : null}

            <Text style={styles.sectionTitle}>Existing cover</Text>
            {recorded.individualCoverSources.map((source) => <Text key={source} style={styles.source}>Source: {source}</Text>)}
            {recorded.individualCoverEvidence.map((source) => <Text key={source.sourceRecordId} style={styles.source}>Record {source.sourceRecordId} · v{source.sourceVersion ?? 'unknown'} · field: sum_assured · freshness unavailable · loaded {retrievedAt ? new Date(retrievedAt).toLocaleString() : 'this session'}</Text>)}
            <CoverField label="Individual cover" included={includeIndividualCover} onIncluded={(value) => { setIncludeIndividualCover(value); invalidateResult(); }} value={individualCover} onChange={changeDraft(setIndividualCover)} />
            <CoverField label="Group / employer cover" included={includeGroupCover} onIncluded={(value) => { setIncludeGroupCover(value); invalidateResult(); }} value={groupCover} onChange={changeDraft(setGroupCover)} />
            <CoverField label="Other cover" included={includeOtherCover} onIncluded={(value) => { setIncludeOtherCover(value); invalidateResult(); }} value={otherCover} onChange={changeDraft(setOtherCover)} />
            <Text style={styles.help}>Every cover candidate starts excluded. Include only categories you deliberately want in this temporary comparison; enter 0 only after confirming none.</Text>

            {error ? <Text accessibilityRole="alert" style={styles.error}>{error}</Text> : null}
            {notice ? <Text accessibilityRole="alert" style={styles.notice}>{notice}</Text> : null}
            <Pressable style={styles.primaryButton} onPress={calculate}>
              <Text style={styles.primaryButtonText}>Model this scenario</Text>
            </Pressable>

            {result ? <Result result={result} /> : null}
            <Pressable style={styles.resetButton} onPress={() => { contextRequest.current.cancel(); setComponents([]); setAmountDrafts({}); setSupportAnnual(''); setSupportYears(''); setSupportGrowth(''); setSupportGrowthMode(null); setIncludeSurvivorIncome(false); setSurvivorAnnual(''); setSurvivorYears(''); setSurvivorGrowth(''); setSurvivorGrowthMode(null); setIndividualCover(''); setIncludeIndividualCover(false); setGroupCover(''); setIncludeGroupCover(false); setOtherCover(''); setIncludeOtherCover(false); setResult(null); setError(null); setNotice(null); setConfirmedContext(null); setRetrievedAt(null); setConsented(false); }} accessibilityRole="button"><Text style={styles.resetText}>Reset explorer</Text></Pressable>
            <Text style={styles.disclosure}>
              Formula: support stream + selected debts + selected goals − selected available assets − selected
              survivor-income stream, floored at zero. Growth compounds annually from year zero only when you
              enter it. This excludes taxes, policy terms, underwriting and future changes. Specialist India
              insurance/fintech review is required before this internal-MVP flow is released externally.
            </Text>
          </>
        )}
      </ScrollView>
    </Modal>
  );
}

function Field({ label, value, onChange }: { label: string; value: string; onChange: (value: string) => void }) {
  return (
    <View style={styles.field}>
      <Text style={styles.fieldLabel}>{label}</Text>
      <TextInput
        accessibilityLabel={label}
        style={styles.input}
        keyboardType="decimal-pad"
        value={value}
        onChangeText={onChange}
      />
    </View>
  );
}

function GrowthModeChoice({ label, value, onChange }: { label: string; value: GrowthMode; onChange: (value: Exclude<GrowthMode, null>) => void }) {
  return <View style={styles.field}><Text style={styles.fieldLabel}>{label} · required</Text><View style={styles.choiceRow}>
    {([['zero', 'Use 0% growth'], ['custom', 'Enter my own rate']] as const).map(([mode, copy]) => <Pressable key={mode} accessibilityRole="radio" accessibilityState={{ checked: value === mode }} style={[styles.choice, value === mode && styles.choiceSelected]} onPress={() => onChange(mode)}><Text style={[styles.choiceText, value === mode && styles.choiceTextSelected]}>{copy}</Text></Pressable>)}
  </View></View>;
}

function CoverField({ label, included, onIncluded, value, onChange }: { label: string; included: boolean; onIncluded: (value: boolean) => void; value: string; onChange: (value: string) => void }) {
  return <View style={styles.componentRow}><View style={styles.componentHeading}><Text style={styles.componentLabel}>{label}</Text><Switch accessibilityLabel={`Include ${label}`} value={included} onValueChange={onIncluded} /></View><TextInput accessibilityLabel={`${label} amount`} style={[styles.input, !included && styles.inputDisabled]} keyboardType="decimal-pad" editable={included} value={value} onChangeText={onChange} /></View>;
}

function Result({ result }: { result: TermInsuranceResult }) {
  const heading = useRef<Text>(null);
  useEffect(() => {
    AccessibilityInfo.announceForAccessibility(`Term-cover component result: ${formatRupees(result.modeledAmount)}`);
    if (Platform.OS === 'web') (heading.current as unknown as { focus?: () => void } | null)?.focus?.();
    else { const handle = findNodeHandle(heading.current); if (handle) AccessibilityInfo.setAccessibilityFocus(handle); }
  }, [result]);
  const rows: [string, number][] = [
    ['Household-support stream', result.householdSupportStream],
    ['Selected debts', result.selectedDebts],
    ['Selected goals', result.selectedGoals],
    ['Selected available-asset offsets', -result.selectedAssetOffsets],
    ['Selected survivor-income stream', -result.survivorIncomeStream],
  ];
  return (
    <View style={styles.resultBox} accessibilityLiveRegion="polite">
      <Text ref={heading} {...(Platform.OS === 'web' ? { tabIndex: -1 } : {})} accessibilityRole="header" style={styles.sectionTitle}>Current component result</Text>
      {rows.map(([label, amount]) => (
        <View key={label} style={styles.resultRow}><Text style={styles.resultLabel}>{label}</Text><Text style={styles.resultValue}>{formatRupees(amount)}</Text></View>
      ))}
      <View style={styles.resultRow}><Text style={styles.resultLabel}>Modeled amount</Text><Text style={styles.resultValue}>{formatRupees(result.modeledAmount)}</Text></View>
      <View style={styles.resultRow}><Text style={styles.resultLabel}>Existing individual cover</Text><Text style={styles.resultValue}>{formatRupees(result.existingIndividualCover)}</Text></View>
      <View style={styles.resultRow}><Text style={styles.resultLabel}>Existing group / employer cover</Text><Text style={styles.resultValue}>{formatRupees(result.existingGroupCover)}</Text></View>
      <View style={styles.resultRow}><Text style={styles.resultLabel}>Existing other cover</Text><Text style={styles.resultValue}>{formatRupees(result.existingOtherCover)}</Text></View>
      <View style={styles.resultRow}><Text style={styles.resultLabel}>Total entered existing cover</Text><Text style={styles.resultValue}>{formatRupees(result.enteredCoverTotal)}</Text></View>
      <View style={styles.resultRow}><Text style={styles.resultLabel}>Cover minus modeled amount</Text><Text style={styles.resultValue}>{formatSignedRupees(result.signedCoverDifference)}</Text></View>
      <Text style={styles.help}>A positive or negative difference is arithmetic only. FinTutor does not label it adequate or tell you to buy cover.</Text>
    </View>
  );
}

function formatSignedRupees(amount: number): string {
  if (amount === 0) return formatRupees(0);
  return `${amount > 0 ? '+' : '−'}${formatRupees(Math.abs(amount))}`;
}

const styles = StyleSheet.create({
  screen: { backgroundColor: colors.screen },
  content: { padding: spacing.xl, paddingBottom: spacing.xxxl },
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', gap: spacing.md },
  title: typography.pageTitle,
  close: { fontFamily: font.uiMedium, color: colors.tutor, paddingVertical: spacing.sm },
  intro: { fontFamily: font.tutor, fontSize: 16, lineHeight: 23, color: colors.ink, marginTop: spacing.md, marginBottom: spacing.xl },
  consentBox: { borderWidth: StyleSheet.hairlineWidth, borderColor: colors.line, borderRadius: radius.md, padding: spacing.lg },
  contextNote: { borderWidth: StyleSheet.hairlineWidth, borderColor: colors.line, borderRadius: radius.md, padding: spacing.md, marginBottom: spacing.md },
  sectionTitle: { fontFamily: font.uiSemibold, color: colors.ink, fontSize: 16, marginTop: spacing.xl, marginBottom: spacing.sm },
  body: { fontFamily: font.ui, color: colors.inkSecondary, lineHeight: 21 },
  help: { fontFamily: font.ui, color: colors.inkSecondary, fontSize: 13, lineHeight: 19, marginBottom: spacing.sm },
  field: { marginTop: spacing.md },
  fieldLabel: { fontFamily: font.uiMedium, color: colors.inkSecondary, fontSize: 13, marginBottom: spacing.xs },
  input: { borderWidth: StyleSheet.hairlineWidth, borderColor: colors.line, borderRadius: radius.sm, paddingHorizontal: spacing.md, paddingVertical: 11, fontFamily: font.mono, color: colors.ink, backgroundColor: colors.screen },
  inputDisabled: { color: colors.inkMuted, backgroundColor: colors.canvas },
  choiceRow: { flexDirection: 'row', flexWrap: 'wrap', gap: spacing.sm },
  choice: { minHeight: 44, justifyContent: 'center', borderWidth: 1, borderColor: colors.line, borderRadius: radius.md, paddingHorizontal: spacing.md },
  choiceSelected: { backgroundColor: colors.tutor, borderColor: colors.tutor },
  choiceText: { fontFamily: font.uiMedium, color: colors.ink, fontSize: 13 },
  choiceTextSelected: { color: colors.screen },
  componentRow: { paddingVertical: spacing.md, borderBottomWidth: StyleSheet.hairlineWidth, borderBottomColor: colors.lineSoft },
  componentHeading: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: spacing.sm },
  toggleRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingVertical: spacing.lg },
  componentCopy: { flex: 1, paddingRight: spacing.md },
  componentLabel: { fontFamily: font.uiMedium, color: colors.ink },
  source: { fontFamily: font.ui, color: colors.inkMuted, fontSize: 12, marginTop: 2 },
  primaryButton: { backgroundColor: colors.tutor, borderRadius: radius.md, paddingVertical: 14, alignItems: 'center', marginTop: spacing.lg },
  primaryButtonText: typography.primaryButtonText,
  secondaryButton: { borderWidth: StyleSheet.hairlineWidth, borderColor: colors.tutor, borderRadius: radius.md, paddingVertical: 14, alignItems: 'center', marginTop: spacing.md },
  secondaryButtonText: typography.secondaryButtonText,
  addComponentRow: { flexDirection: 'row', flexWrap: 'wrap', gap: spacing.lg, marginTop: spacing.md },
  addComponent: { fontFamily: font.uiMedium, color: colors.tutor, fontSize: 13 },
  error: { fontFamily: font.ui, color: colors.danger, marginTop: spacing.md },
  notice: { fontFamily: font.ui, color: colors.inkSecondary, marginTop: spacing.md, lineHeight: 20 },
  resultBox: { marginTop: spacing.xl, borderTopWidth: StyleSheet.hairlineWidth, borderTopColor: colors.line },
  resultRow: { flexDirection: 'row', justifyContent: 'space-between', gap: spacing.md, paddingVertical: spacing.sm },
  resultLabel: { flex: 1, fontFamily: font.ui, color: colors.inkSecondary },
  resultValue: typography.ledgerValue,
  disclosure: { fontFamily: font.ui, color: colors.inkMuted, fontSize: 12, lineHeight: 18, marginTop: spacing.xl },
  resetButton: { minHeight: 44, alignItems: 'center', justifyContent: 'center', marginTop: spacing.lg },
  resetText: { fontFamily: font.uiMedium, color: colors.inkSecondary },
});
