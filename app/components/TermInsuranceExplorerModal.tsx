import { useMemo, useRef, useState } from 'react';
import {
  Modal,
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
import type { GoalRecord } from '../lib/goals';
import type { Holding } from '../lib/holdings';
import {
  calculateTermInsuranceExploration,
  recordedTermInsuranceContext,
  type TermInsuranceComponent,
  type TermInsuranceResult,
} from '../lib/termInsurance';

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
  const [includeSurvivorIncome, setIncludeSurvivorIncome] = useState(false);
  const [survivorAnnual, setSurvivorAnnual] = useState('');
  const [survivorYears, setSurvivorYears] = useState('');
  const [survivorGrowth, setSurvivorGrowth] = useState('');
  const [individualCover, setIndividualCover] = useState('');
  const [groupCover, setGroupCover] = useState('');
  const [otherCover, setOtherCover] = useState('');
  const [result, setResult] = useState<TermInsuranceResult | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [confirmedContext, setConfirmedContext] = useState<FinancialContext | null>(null);
  const contextRequest = useRef(new RequestGeneration());

  const dismiss = () => {
    contextRequest.current.cancel();
    setConsented(false);
    setComponents([]);
    setAmountDrafts({});
    setSupportAnnual('');
    setSupportYears('');
    setSupportGrowth('');
    setIncludeSurvivorIncome(false);
    setSurvivorAnnual('');
    setSurvivorYears('');
    setSurvivorGrowth('');
    setIndividualCover('');
    setGroupCover('');
    setOtherCover('');
    setResult(null);
    setError(null);
    setConfirmedContext(null);
    onDismiss();
  };

  const useRecordedContext = async () => {
    const request = contextRequest.current.begin();
    setComponents(recorded.components);
    setAmountDrafts(Object.fromEntries(recorded.components.map((item) => [item.id, String(item.amount)])));
    const everyRecordedCoverKnown = recorded.individualCoverSources.length > 0
      && recorded.individualCoverSources.every((source) => !source.includes('needs confirmation'));
    setIndividualCover(everyRecordedCoverKnown ? String(recorded.individualCover) : '');
    setConsented(true);
    const context = await fetchFinancialContext().catch(() => null);
    if (contextRequest.current.isCurrent(request)) setConfirmedContext(context);
  };
  const startBlank = () => {
    contextRequest.current.cancel();
    setComponents([]);
    setAmountDrafts({});
    setIndividualCover('');
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
    setResult(null);
  };
  const changeDraft = (setter: (value: string) => void) => (value: string) => {
    setter(value);
    setResult(null);
  };

  const calculate = () => {
    const parseDraft = (value: string) => value.trim() === '' ? Number.NaN : Number(value);
    const parsedComponents = components.map((item) => ({ ...item, amount: parseDraft(amountDrafts[item.id] ?? '') }));
    const next = calculateTermInsuranceExploration({
      householdSupport: {
        annualAmount: parseDraft(supportAnnual),
        years: parseDraft(supportYears),
        ...(supportGrowth.trim() === '' ? {} : { growthPercent: parseDraft(supportGrowth) }),
      },
      survivorIncome: includeSurvivorIncome ? {
        annualAmount: parseDraft(survivorAnnual),
        years: parseDraft(survivorYears),
        ...(survivorGrowth.trim() === '' ? {} : { growthPercent: parseDraft(survivorGrowth) }),
      } : null,
      components: parsedComponents,
      existingIndividualCover: parseDraft(individualCover),
      existingGroupCover: parseDraft(groupCover),
      existingOtherCover: parseDraft(otherCover),
    });
    if (!next || [supportAnnual, supportYears, individualCover, groupCover, otherCover].some((v) => v.trim() === '')) {
      setResult(null);
      setError('Complete every required field with valid non-negative values. Years must be 1–100 and growth 0–100%.');
      return;
    }
    if (includeSurvivorIncome && [survivorAnnual, survivorYears].some((v) => v.trim() === '')) {
      setResult(null);
      setError('Enter the survivor-income amount and years, or exclude that stream.');
      return;
    }
    setError(null);
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
            <Text style={styles.help}>Enter the annual support amount and how many years to model. No rate is assumed.</Text>
            <Field label="Annual household support (₹)" value={supportAnnual} onChange={changeDraft(setSupportAnnual)} />
            <Field label="Years (1–100)" value={supportYears} onChange={changeDraft(setSupportYears)} />
            <Field label="Annual growth / inflation % (optional)" value={supportGrowth} onChange={changeDraft(setSupportGrowth)} />

            <Text style={styles.sectionTitle}>Recorded components</Text>
            {components.length === 0 ? <Text style={styles.help}>No usable recorded debts, goals or assets were found.</Text> : null}
            {components.map((item) => (
              <View key={item.id} style={styles.componentRow}>
                <View style={styles.componentHeading}>
                  <View style={styles.componentCopy}>
                    <Text style={styles.componentLabel}>{item.label}</Text>
                    <Text style={styles.source}>{item.source}</Text>
                  </View>
                  <Switch accessibilityLabel={`Include ${item.label}`} value={item.included} onValueChange={(value) => updateComponent(item.id, value)} />
                </View>
                <TextInput
                  accessibilityLabel={`${item.label} amount`}
                  style={[styles.input, !item.included && styles.inputDisabled]}
                  keyboardType="decimal-pad"
                  editable={item.included}
                  value={amountDrafts[item.id] ?? ''}
                  onChangeText={(value) => { setAmountDrafts((drafts) => ({ ...drafts, [item.id]: value })); setResult(null); }}
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
              <Switch accessibilityLabel="Include survivor income" value={includeSurvivorIncome} onValueChange={(value) => { setIncludeSurvivorIncome(value); setResult(null); }} />
            </View>
            {includeSurvivorIncome ? (
              <>
                <Field label="Annual survivor income (₹)" value={survivorAnnual} onChange={changeDraft(setSurvivorAnnual)} />
                <Field label="Years (1–100)" value={survivorYears} onChange={changeDraft(setSurvivorYears)} />
                <Field label="Annual growth % (optional)" value={survivorGrowth} onChange={changeDraft(setSurvivorGrowth)} />
              </>
            ) : null}

            <Text style={styles.sectionTitle}>Existing cover · required</Text>
            {recorded.individualCoverSources.map((source) => <Text key={source} style={styles.source}>Source: {source}</Text>)}
            <Field label="Individual cover (₹)" value={individualCover} onChange={changeDraft(setIndividualCover)} />
            <Field label="Group / employer cover (₹)" value={groupCover} onChange={changeDraft(setGroupCover)} />
            <Field label="Other cover (₹)" value={otherCover} onChange={changeDraft(setOtherCover)} />
            <Text style={styles.help}>Enter 0 only when you have confirmed there is no cover in that category.</Text>

            {error ? <Text accessibilityRole="alert" style={styles.error}>{error}</Text> : null}
            <Pressable style={styles.primaryButton} onPress={calculate}>
              <Text style={styles.primaryButtonText}>Model this scenario</Text>
            </Pressable>

            {result ? <Result result={result} /> : null}
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

function Result({ result }: { result: TermInsuranceResult }) {
  const rows: [string, number][] = [
    ['Household-support stream', result.householdSupportStream],
    ['Selected debts', result.selectedDebts],
    ['Selected goals', result.selectedGoals],
    ['Selected available-asset offsets', -result.selectedAssetOffsets],
    ['Selected survivor-income stream', -result.survivorIncomeStream],
  ];
  return (
    <View style={styles.resultBox} accessibilityLiveRegion="polite">
      <Text style={styles.sectionTitle}>Component result</Text>
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
  resultBox: { marginTop: spacing.xl, borderTopWidth: StyleSheet.hairlineWidth, borderTopColor: colors.line },
  resultRow: { flexDirection: 'row', justifyContent: 'space-between', gap: spacing.md, paddingVertical: spacing.sm },
  resultLabel: { flex: 1, fontFamily: font.ui, color: colors.inkSecondary },
  resultValue: typography.ledgerValue,
  disclosure: { fontFamily: font.ui, color: colors.inkMuted, fontSize: 12, lineHeight: 18, marginTop: spacing.xl },
});
