import { useCallback, useEffect, useState } from 'react';
import {
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import { useFocusEffect, useNavigation, useRoute } from '@react-navigation/native';
import type { RouteProp } from '@react-navigation/native';
import type { BottomTabNavigationProp } from '@react-navigation/bottom-tabs';
import { TeachingBlock } from '../components/TeachingBlock';
import { EmergencyCoverageTool } from '../components/EmergencyCoverageTool';
import { colors, font, radius, spacing } from '../design/tokens';
import { useAuth } from '../lib/AuthContext';
import { fetchBudget } from '../lib/budget';
import { fetchHoldings } from '../lib/holdings';
import { formatRupees } from '../lib/format';
import { recordScenarioCompleted } from '../lib/progression';
import {
  debtCost,
  derivePrefills,
  idleCashOpportunity,
  monthsToTarget,
  sipIncrease,
} from '../lib/scenarios';
import type { ScenarioPrefills } from '../lib/scenarios';
import type { Holding } from '../lib/holdings';
import type { MainTabsParamList, ScenarioType } from '../navigation/types';

// BQ-056 (D-106): scenario modelling batch 1 — S-05, S-03, S-06, S-07, S-01.
//
// Same shape as CalculatorScreen (hidden tab, entered from ToolsScreen with {type, label}),
// with one addition: each scenario prefills its inputs from the user's real budget/holdings
// and says so. Every prefilled field stays editable — the prefill is a starting point the
// user can disagree with, not an assertion.
//
// Every rate is a user input. The app does not supply an expected return, an inflation rate,
// or a savings-account rate anywhere on this screen (see app/lib/scenarios.ts header).
// Figures render in font.mono / colors.ink — no valence styling (P10, D-087).

export function ScenarioScreen() {
  const route = useRoute<RouteProp<MainTabsParamList, 'Scenario'>>();
  const { type } = route.params;
  const { userId } = useAuth();
  const [prefills, setPrefills] = useState<ScenarioPrefills | null>(null);

  const loadData = useCallback(() => {
    if (!userId || type === 'emergency_runway') return;
    Promise.all([
      fetchBudget(userId).catch(() => null),
      fetchHoldings(userId).catch((): Holding[] | null => null),
    ]).then(([budget, holdings]) => {
      setPrefills(derivePrefills(budget, holdings));
    });
  }, [type, userId]);

  useFocusEffect(loadData);

  // BQ-071: fires only when a scenario produced an honest number. Every compute function
  // in app/lib/scenarios.ts returns null when it cannot, and those cases must not earn
  // progress — D-117 awards a rendered result, not a screen visit.
  const onComputed = useCallback(() => {
    if (!userId) return;
    recordScenarioCompleted(userId, type);
  }, [userId, type]);

  return (
    <KeyboardAvoidingView style={styles.flex} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
      {type === 'emergency_runway' && (
        <EmergencyCoverageTool key={userId ?? 'signed-out'} userId={userId} surface="scenario" onComputed={onComputed} />
      )}
      {type === 'sip_increase' && (
        <SipIncreaseScenario prefills={prefills} onComputed={onComputed} />
      )}
      {type === 'debt_cost' && <DebtCostScenario prefills={prefills} onComputed={onComputed} />}
      {type === 'idle_cash' && <IdleCashScenario onComputed={onComputed} />}
      {type === 'corpus_target' && (
        <CorpusTargetScenario prefills={prefills} onComputed={onComputed} />
      )}
    </KeyboardAvoidingView>
  );
}

type ScenarioProps = { prefills: ScenarioPrefills | null; onComputed: () => void };

// ─── Shared sub-components ────────────────────────────────────────────────────

function ScenarioWrapper({
  title,
  question,
  children,
  wontSay,
}: {
  title: string;
  question: string;
  children: React.ReactNode;
  wontSay: string;
}) {
  const navigation = useNavigation<BottomTabNavigationProp<MainTabsParamList>>();
  return (
    <ScrollView style={styles.screen} contentContainerStyle={styles.content}>
      {/* Explicit navigate, not goBack(). A bottom-tab navigator defaults to
          backBehavior: 'firstRoute', so goBack() from a hidden screen lands on Home —
          verified in the web preview — which contradicts the label on this control. */}
      <Pressable style={styles.back} onPress={() => navigation.navigate('Tools')}>
        <Text style={styles.backText}>‹ Tools</Text>
      </Pressable>
      <Text style={styles.heading}>{title}</Text>
      <Text style={styles.question}>{question}</Text>
      {children}
      {/* D-091 standing block — always shown, worded the same way every time. */}
      <TeachingBlock heading="What we won't say" style={styles.teachingBlock}>
        {wontSay}
      </TeachingBlock>
    </ScrollView>
  );
}

function ScenarioInput({
  label,
  hint,
  value,
  onChange,
  prefix,
  suffix,
  prefilled,
}: {
  label: string;
  hint?: string;
  value: string;
  onChange: (v: string) => void;
  prefix?: string;
  suffix?: string;
  prefilled?: boolean;
}) {
  return (
    <View style={styles.fieldGroup}>
      <View style={styles.fieldLabelRow}>
        <Text style={styles.fieldLabel}>{label}</Text>
        {prefilled && <Text style={styles.prefillTag}>from your data</Text>}
      </View>
      <View style={styles.inputRow}>
        {prefix && <Text style={styles.inputAdorn}>{prefix}</Text>}
        <TextInput
          style={[styles.input, prefix && styles.inputWithPrefix, suffix && styles.inputWithSuffix]}
          value={value}
          onChangeText={onChange}
          keyboardType="decimal-pad"
          placeholder={hint ?? '0'}
          placeholderTextColor={colors.inkMuted}
        />
        {suffix && <Text style={styles.inputAdorn}>{suffix}</Text>}
      </View>
    </View>
  );
}

function RunButton({ onPress, disabled }: { onPress: () => void; disabled?: boolean }) {
  return (
    <Pressable
      style={[styles.runBtn, disabled && styles.runBtnDisabled]}
      onPress={onPress}
      disabled={disabled}
    >
      <Text style={[styles.runBtnText, disabled && styles.runBtnTextDisabled]}>Run this scenario</Text>
    </Pressable>
  );
}

function ResultCard({
  unit,
  value,
  mechanismNote,
  onRendered,
}: {
  unit: string;
  value: string;
  mechanismNote: string;
  onRendered?: () => void;
}) {
  useEffect(() => {
    onRendered?.();
  }, [onRendered]);
  return (
    <View style={styles.resultCard}>
      <Text style={styles.resultUnit}>{unit}</Text>
      <Text style={styles.resultValue}>{value}</Text>
      <Text style={styles.resultNote}>{mechanismNote}</Text>
    </View>
  );
}

function SecondaryRow({ label, value }: { label: string; value: string }) {
  return (
    <View style={styles.secondaryResult}>
      <Text style={styles.secondaryLabel}>{label}</Text>
      <Text style={styles.secondaryValue}>{value}</Text>
    </View>
  );
}

function PrefillNote({ children }: { children: string }) {
  return <Text style={styles.prefillNote}>{children}</Text>;
}

// Every compute function returns null when its inputs can't produce an honest number (a runway
// against zero outgoings, a loan with no months left). Without this the button would look
// broken: pressed, nothing appears. Says which input is missing instead.
function Notice({ children }: { children: string }) {
  return (
    <View style={styles.notice}>
      <Text style={styles.noticeText}>{children}</Text>
    </View>
  );
}

// Prefilled fields need to adopt a value that arrives after first render (the fetch resolves
// later) without overwriting an edit the user has already made. `touched` records that.
function usePrefilledField(prefill: number | null | undefined) {
  const [value, setValue] = useState('');
  const [touched, setTouched] = useState(false);
  const shown = touched || prefill === null || prefill === undefined ? value : String(Math.round(prefill));
  const onChange = (v: string) => {
    setTouched(true);
    setValue(v);
  };
  return [shown, onChange] as const;
}

// ─── S-03: What if I increase my SIP? ────────────────────────────────────────

function SipIncreaseScenario({ prefills, onComputed }: ScenarioProps) {
  const [currentSip, setCurrentSip] = usePrefilledField(prefills?.monthlySip);
  const [extra, setExtra] = useState('');
  const [rate, setRate] = useState('');
  const [years, setYears] = useState('');
  const [result, setResult] = useState<ReturnType<typeof sipIncrease>>(null);
  const [notice, setNotice] = useState<string | null>(null);

  function run() {
    const computed = sipIncrease(
      parseFloat(currentSip) || 0,
      parseFloat(extra),
      parseFloat(rate),
      parseFloat(years)
    );
    setResult(computed);
    setNotice(
      computed === null
        ? 'The extra amount and the horizon both need to be more than zero, and the rate cannot be negative.'
        : null
    );
  }

  const ready = extra !== '' && rate !== '' && years !== '';

  return (
    <ScenarioWrapper
      title="If I invest more each month"
      question="What does an extra amount every month do to the corpus at the end of your horizon?"
      wontSay="Whether you should increase your SIP, or what return to expect. What this screen does: compounds the two monthly amounts you enter at the rate you enter, and shows the gap between them."
    >
      <ScenarioInput
        label="Current monthly SIP"
        prefix="₹"
        value={currentSip}
        onChange={setCurrentSip}
        prefilled={prefills?.monthlySip !== null && prefills?.monthlySip !== undefined}
        hint="0"
      />
      <PrefillNote>
        Prefilled from the mutual fund SIPs recorded in Budgeting. Edit it to model a different
        starting point.
      </PrefillNote>
      <ScenarioInput label="Extra each month" prefix="₹" value={extra} onChange={setExtra} hint="e.g. 2000" />
      <ScenarioInput
        label="Assumed annual return"
        suffix="%"
        value={rate}
        onChange={setRate}
        hint="e.g. 12"
      />
      <PrefillNote>
        This rate is yours to set. The app does not supply one — a return it hands you is a
        forecast you would end up relying on.
      </PrefillNote>
      <ScenarioInput label="Time horizon" suffix="years" value={years} onChange={setYears} hint="e.g. 10" />
      <RunButton onPress={run} disabled={!ready} />
      {notice !== null && <Notice>{notice}</Notice>}
      {result !== null && (
        <>
          <ResultCard
            unit={`Difference after ${years} years`}
            value={formatRupees(result.difference)}
            mechanismNote={`The extra ₹${extra} a month puts in ${formatRupees(
              result.extraInvested
            )} of your own money over ${years} years. The rest of the difference is compounding on those contributions at ${rate}%.`}
            onRendered={onComputed}
          />
          <SecondaryRow label="Corpus at current SIP" value={formatRupees(result.base)} />
          <SecondaryRow label="Corpus with the extra" value={formatRupees(result.raised)} />
        </>
      )}
    </ScenarioWrapper>
  );
}

// ─── S-06: What does my debt cost? ───────────────────────────────────────────

function DebtCostScenario({ prefills, onComputed }: ScenarioProps) {
  const [selected, setSelected] = useState<string | null>(null);
  const [outstanding, setOutstanding] = useState('');
  const [rate, setRate] = useState('');
  const [months, setMonths] = useState('');
  const [result, setResult] = useState<ReturnType<typeof debtCost>>(null);
  const [notice, setNotice] = useState<string | null>(null);

  const loans = prefills?.loans ?? [];

  function pickLoan(id: string) {
    const loan = loans.find((l) => l.id === id);
    if (!loan) return;
    setSelected(id);
    setOutstanding(loan.outstanding > 0 ? String(Math.round(loan.outstanding)) : '');
    setRate(loan.interestRate > 0 ? String(loan.interestRate) : '');
    setMonths(loan.tenureMonths > 0 ? String(Math.round(loan.tenureMonths)) : '');
    setResult(null);
  }

  function run() {
    const computed = debtCost(parseFloat(outstanding), parseFloat(rate), parseFloat(months));
    setResult(computed);
    setNotice(
      computed === null
        ? 'A balance and a number of months remaining, both above zero, are needed to amortise this. Credit card entries in particular have no tenure recorded — enter one above.'
        : null
    );
  }

  const ready = outstanding !== '' && rate !== '' && months !== '';

  return (
    <ScenarioWrapper
      title="What my debt costs"
      question="Over the rest of the tenure, how much of what you pay is interest rather than principal?"
      wontSay="Whether to prepay, refinance, or keep paying as scheduled. What this screen does: amortises the balance you enter at the rate you enter, and names the interest inside the payments."
    >
      {loans.length > 0 && (
        <View style={styles.pickerGroup}>
          <Text style={styles.fieldLabel}>Start from a loan you hold</Text>
          <View style={styles.chipRow}>
            {loans.map((loan) => (
              <Pressable
                key={loan.id}
                style={[styles.chip, selected === loan.id && styles.chipSelected]}
                onPress={() => pickLoan(loan.id)}
              >
                <Text style={[styles.chipText, selected === loan.id && styles.chipTextSelected]}>
                  {loan.label}
                </Text>
              </Pressable>
            ))}
          </View>
          <PrefillNote>
            Picking one fills the three fields below from what you recorded. Anything missing there
            stays blank for you to enter.
          </PrefillNote>
        </View>
      )}
      <ScenarioInput
        label="Outstanding balance"
        prefix="₹"
        value={outstanding}
        onChange={setOutstanding}
        hint="e.g. 2500000"
      />
      <ScenarioInput label="Annual interest rate" suffix="%" value={rate} onChange={setRate} hint="e.g. 8.5" />
      <ScenarioInput label="Months remaining" suffix="months" value={months} onChange={setMonths} hint="e.g. 180" />
      <RunButton onPress={run} disabled={!ready} />
      {notice !== null && <Notice>{notice}</Notice>}
      {result !== null && (
        <>
          <ResultCard
            unit="Interest over the next 12 months"
            value={formatRupees(result.nextYearInterest)}
            mechanismNote={`Interest accrues on the balance that is still outstanding, so it falls as the balance falls. This is the sum of the next twelve months of it, not a flat ${rate}% of the balance.`}
            onRendered={onComputed}
          />
          <SecondaryRow label="Interest over the full remaining tenure" value={formatRupees(result.totalInterest)} />
          <SecondaryRow label="Monthly EMI at this balance" value={formatRupees(result.emi)} />
          <SecondaryRow label="Total payable" value={formatRupees(result.totalPayable)} />
        </>
      )}
    </ScenarioWrapper>
  );
}

// ─── S-07: Idle cash over time ───────────────────────────────────────────────
// No prefill: the app has no cash/bank product type (D-079 — the Cash & bank family is
// deferred), so this amount is always the user's to enter.

function IdleCashScenario({ onComputed }: { onComputed: () => void }) {
  const [cash, setCash] = useState('');
  const [savingsRate, setSavingsRate] = useState('');
  const [altRate, setAltRate] = useState('');
  const [years, setYears] = useState('5');
  const [result, setResult] = useState<ReturnType<typeof idleCashOpportunity>>(null);
  const [notice, setNotice] = useState<string | null>(null);

  function run() {
    const computed = idleCashOpportunity(
      parseFloat(cash),
      parseFloat(savingsRate),
      parseFloat(altRate),
      parseFloat(years)
    );
    setResult(computed);
    setNotice(
      computed === null
        ? 'An amount above zero and a period above zero are needed, and neither rate can be negative.'
        : null
    );
  }

  // The rule-of-72 sentence is only true of a rate that actually compounds — at 0% nothing
  // doubles, and the sentence would be a false teaching claim rather than a simplified one.
  const savingsPct = parseFloat(savingsRate);
  const altPct = parseFloat(altRate);
  const doublingApplies = savingsPct > 0 && altPct > 0;

  const ready = cash !== '' && savingsRate !== '' && altRate !== '' && years !== '';

  return (
    <ScenarioWrapper
      title="Inaction tax — idle cash"
      question="What happens to a cash balance over time at two different rates?"
      wontSay="That leaving money in cash is a mistake, or that the alternate rate is achievable. Cash sitting still is sometimes exactly the right call — an emergency buffer is supposed to sit still. What this screen does: compounds one amount at the two rates you enter and names the gap."
    >
      <ScenarioInput label="Cash sitting idle" prefix="₹" value={cash} onChange={setCash} hint="e.g. 500000" />
      <ScenarioInput
        label="Rate it earns today"
        suffix="%"
        value={savingsRate}
        onChange={setSavingsRate}
        hint="e.g. 3.5"
      />
      <ScenarioInput
        label="Rate you're comparing against"
        suffix="%"
        value={altRate}
        onChange={setAltRate}
        hint="e.g. 12"
      />
      <PrefillNote>
        Both rates are yours to set. The second one is a comparison you choose, not a return the
        app is telling you to expect.
      </PrefillNote>
      <ScenarioInput label="Over" suffix="years" value={years} onChange={setYears} hint="e.g. 5" />
      <RunButton onPress={run} disabled={!ready} />
      {notice !== null && <Notice>{notice}</Notice>}
      {result !== null && (
        <>
          <ResultCard
            unit={`Gap after ${years} years`}
            value={formatRupees(result.difference)}
            mechanismNote={
              'Compounding is the whole of this difference — the amount you put in is the same on both sides.' +
              (doublingApplies
                ? ` A ${altRate}% rate doubles roughly every ${(72 / altPct).toFixed(
                    1
                  )} years; a ${savingsRate}% rate takes about ${(72 / savingsPct).toFixed(1)}.`
                : '')
            }
            onRendered={onComputed}
          />
          <SecondaryRow label={`At ${savingsRate}%`} value={formatRupees(result.atSavingsRate)} />
          <SecondaryRow label={`At ${altRate}%`} value={formatRupees(result.atAlternateRate)} />
        </>
      )}
    </ScenarioWrapper>
  );
}

// ─── S-01: When does my corpus reach my target? ──────────────────────────────

function CorpusTargetScenario({ prefills, onComputed }: ScenarioProps) {
  const [corpus, setCorpus] = usePrefilledField(prefills?.investedCorpus);
  const [sip, setSip] = usePrefilledField(prefills?.monthlySip);
  const [rate, setRate] = useState('');
  const [target, setTarget] = useState('');
  const [age, setAge] = useState('');
  const [result, setResult] = useState<ReturnType<typeof monthsToTarget>>(null);
  const [notice, setNotice] = useState<string | null>(null);

  function run() {
    const computed = monthsToTarget(
      parseFloat(corpus) || 0,
      parseFloat(sip) || 0,
      parseFloat(rate),
      parseFloat(target)
    );
    setResult(computed);
    setNotice(
      computed === null
        ? 'A target above zero is needed, and neither the monthly amount nor the rate can be negative.'
        : null
    );
  }

  const ready = target !== '' && rate !== '';
  const currentAge = parseFloat(age);

  return (
    <ScenarioWrapper
      title="When my corpus reaches my target"
      question="At your current savings rate, how long until the corpus reaches the number you set?"
      wontSay="What your target should be. The app does not derive a retirement number from your income or expenses — that figure is yours to choose, and this screen tells you when the maths gets you there."
    >
      <ScenarioInput label="Your corpus target" prefix="₹" value={target} onChange={setTarget} hint="e.g. 20000000" />
      <ScenarioInput
        label="Corpus today"
        prefix="₹"
        value={corpus}
        onChange={setCorpus}
        prefilled={prefills?.investedCorpus !== null && prefills?.investedCorpus !== undefined}
        hint="0"
      />
      <PrefillNote>
        Prefilled from the current value of your funds and stocks, plus PPF/EPF and fixed deposit
        balances.
      </PrefillNote>
      <ScenarioInput
        label="Monthly investment"
        prefix="₹"
        value={sip}
        onChange={setSip}
        prefilled={prefills?.monthlySip !== null && prefills?.monthlySip !== undefined}
        hint="0"
      />
      <ScenarioInput label="Assumed annual return" suffix="%" value={rate} onChange={setRate} hint="e.g. 12" />
      <ScenarioInput label="Your age today (optional)" suffix="years" value={age} onChange={setAge} hint="e.g. 32" />
      <RunButton onPress={run} disabled={!ready} />
      {notice !== null && <Notice>{notice}</Notice>}
      {result !== null && result.alreadyReached && (
        <ResultCard
          unit="Already there"
          value="0 years"
          mechanismNote="The corpus you entered already meets the target you set. Raise the target to model further out."
          onRendered={onComputed}
        />
      )}
      {result !== null && !result.alreadyReached && result.years === null && (
        <ResultCard
          unit="Not reached within 60 years"
          value="—"
          mechanismNote="At this monthly amount and this rate, the balance does not reach your target inside the 60 years this screen models. Changing any of the three inputs changes that."
          onRendered={onComputed}
        />
      )}
      {result !== null && result.years !== null && !result.alreadyReached && (
        <>
          <ResultCard
            unit="Years to your target"
            value={result.years.toFixed(1)}
            mechanismNote={`Each month the balance grows by one month of return at ${rate}% and then your contribution lands on top. The later years move fastest, because the return is being earned on a larger balance.`}
            onRendered={onComputed}
          />
          {!isNaN(currentAge) && currentAge > 0 && (
            <SecondaryRow
              label="Your age at that point"
              value={String(Math.round(currentAge + result.years))}
            />
          )}
        </>
      )}
    </ScenarioWrapper>
  );
}

// ─── Styles ───────────────────────────────────────────────────────────────────

const styles = StyleSheet.create({
  flex: { flex: 1 },
  screen: { flex: 1, backgroundColor: colors.screen },
  content: { padding: spacing.xl, paddingBottom: spacing.xxxl },

  back: { marginBottom: spacing.lg },
  backText: { fontFamily: font.ui, fontSize: 15, color: colors.tutor },

  heading: { fontFamily: font.uiSemibold, fontSize: 22, color: colors.ink, marginBottom: spacing.sm },
  question: {
    fontFamily: font.tutor,
    fontSize: 15,
    lineHeight: 22,
    color: colors.inkSecondary,
    marginBottom: spacing.xl,
  },

  fieldGroup: { marginBottom: spacing.lg },
  fieldLabelRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: spacing.xs,
  },
  fieldLabel: {
    fontFamily: font.mono,
    fontSize: 11,
    letterSpacing: 1,
    textTransform: 'uppercase',
    color: colors.inkMuted,
  },
  prefillTag: {
    fontFamily: font.mono,
    fontSize: 10,
    letterSpacing: 0.5,
    color: colors.tutor,
  },
  inputRow: { flexDirection: 'row', alignItems: 'center' },
  inputAdorn: {
    fontFamily: font.uiSemibold,
    fontSize: 15,
    color: colors.inkSecondary,
    paddingHorizontal: spacing.sm,
    backgroundColor: colors.canvas,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: colors.line,
    paddingVertical: 12,
  },
  input: {
    flex: 1,
    fontFamily: font.mono,
    fontSize: 16,
    color: colors.ink,
    backgroundColor: colors.canvas,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: colors.line,
    paddingHorizontal: spacing.md,
    paddingVertical: 12,
  },
  inputWithPrefix: { borderLeftWidth: 0 },
  inputWithSuffix: { borderRightWidth: 0 },

  prefillNote: {
    fontFamily: font.tutor,
    fontSize: 13,
    lineHeight: 19,
    color: colors.inkSecondary,
    marginTop: -spacing.sm,
    marginBottom: spacing.lg,
  },

  pickerGroup: { marginBottom: spacing.lg },
  chipRow: { flexDirection: 'row', flexWrap: 'wrap', gap: spacing.sm, marginTop: spacing.xs },
  chip: {
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.md,
    borderRadius: radius.pill,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: colors.line,
    backgroundColor: colors.canvas,
  },
  chipSelected: { backgroundColor: colors.tutor, borderColor: colors.tutor },
  chipText: { fontFamily: font.ui, fontSize: 13, color: colors.ink },
  chipTextSelected: { color: colors.canvas },

  runBtn: {
    backgroundColor: colors.tutor,
    borderRadius: radius.md,
    paddingVertical: 14,
    alignItems: 'center',
    marginTop: spacing.sm,
    marginBottom: spacing.xl,
  },
  runBtnDisabled: { backgroundColor: colors.line },
  runBtnText: { fontFamily: font.uiSemibold, fontSize: 15, color: colors.canvas },
  runBtnTextDisabled: { color: colors.inkMuted },

  resultCard: {
    backgroundColor: colors.canvas,
    borderRadius: radius.lg,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: colors.line,
    padding: spacing.lg,
  },
  resultUnit: {
    fontFamily: font.mono,
    fontSize: 11,
    letterSpacing: 1,
    textTransform: 'uppercase',
    color: colors.inkMuted,
    marginBottom: spacing.xs,
  },
  // P10: the figure renders in ink, never coloured by whether it reads as good news.
  resultValue: { fontFamily: font.mono, fontSize: 28, color: colors.ink },
  resultNote: {
    fontFamily: font.tutor,
    fontSize: 14,
    lineHeight: 20,
    color: colors.inkSecondary,
    marginTop: spacing.md,
  },

  secondaryResult: {
    marginTop: spacing.md,
    paddingTop: spacing.md,
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: colors.line,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  secondaryLabel: { fontFamily: font.ui, fontSize: 13, color: colors.inkSecondary, flex: 1 },
  secondaryValue: { fontFamily: font.mono, fontSize: 15, color: colors.ink, marginLeft: spacing.md },

  // Not an error state — the inputs simply don't produce a number yet. Rendered on the recessed
  // canvas rather than in `danger`, which is reserved for genuine failures (tokens.ts).
  notice: {
    backgroundColor: colors.canvas,
    borderRadius: radius.md,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: colors.line,
    padding: spacing.lg,
  },
  noticeText: { fontFamily: font.tutor, fontSize: 14, lineHeight: 20, color: colors.inkSecondary },

  teachingBlock: { marginTop: spacing.xxl },
});
