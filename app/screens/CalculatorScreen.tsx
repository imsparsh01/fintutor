import { useCallback, useEffect, useRef, useState } from 'react';
import {
  AccessibilityInfo,
  findNodeHandle,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import { useRoute } from '@react-navigation/native';
import type { RouteProp } from '@react-navigation/native';
import { colors, font, radius, spacing } from '../design/tokens';
import { EmergencyCoverageTool } from '../components/EmergencyCoverageTool';
import { useAuth } from '../lib/AuthContext';
import { calculateCompoundGrowth } from '../lib/compoundGrowth';
import { calculateCagr, calculateHomeLoanEmi, calculateInflationImpact, calculateSipGoal } from '../lib/calculatorEngines';
import { calculateCreditCardPayoff, PAYOFF_MONTH_CAP } from '../lib/creditCardPayoff';
import { calculateGoalAffordability } from '../lib/goalAffordability';
import { calculateStepUpSip } from '../lib/stepUpSip';
import { formatRupees } from '../lib/format';
import { recordCalculatorCompleted } from '../lib/progression';
import { parseScenarioNumber } from '../lib/scenarioNumbers';
import type { CalculatorType, MainTabsParamList } from '../navigation/types';

// BQ-057 + BQ-078: calculator screens — all free-form input, pure frontend math.
// Outputs render in font.mono / colors.ink (P10 — no valence colour). Each result card
// includes a mechanism explanation (D-088 tutor voice) so the user understands what the
// number IS, not just what it says.

export function CalculatorScreen() {
  const route = useRoute<RouteProp<MainTabsParamList, 'Calculator'>>();
  const { type } = route.params;
  const { userId } = useAuth();

  // BQ-071: fires only when a calculator actually produced a result, never on screen
  // entry — D-117 awards the result, not the visit. Fire-and-forget: nothing below
  // branches on it, and no calculator output changes because of it.
  const onComputed = useCallback(() => {
    if (!userId) return;
    recordCalculatorCompleted(userId, type);
  }, [userId, type]);

  return (
    <KeyboardAvoidingView
      style={styles.flex}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      {type === 'sip_goal' && <SipGoalCalc onComputed={onComputed} />}
      {type === 'emi' && <EmiCalc onComputed={onComputed} />}
      {type === 'inflation' && <InflationCalc onComputed={onComputed} />}
      {type === 'stepup_sip' && <StepUpSipCalc onComputed={onComputed} />}
      {type === 'cagr_backward' && <CagrCalc onComputed={onComputed} />}
      {type === 'compound_growth' && <CompoundGrowthCalc onComputed={onComputed} />}
      {type === 'credit_card_payoff' && <CreditCardPayoffCalc onComputed={onComputed} />}
      {type === 'emergency_coverage' && <EmergencyCoverageTool key={userId ?? 'signed-out'} userId={userId} surface="calculator" onComputed={onComputed} />}
      {type === 'goal_affordability' && <GoalAffordabilityCalc onComputed={onComputed} />}
    </KeyboardAvoidingView>
  );
}

// Every calculator passes this to its primary ResultCard. The card emits from an effect,
// after React has committed the valid result to the screen.
type CalcProps = { onComputed: () => void };
const INPUTS_CHANGED_NOTICE = 'Inputs changed — run again to see a result for these values.';

const parseCalculatorInputs = (...raw: string[]): number[] | null => {
  const parsed = raw.map((value) => parseScenarioNumber(value)?.value);
  return parsed.every((value): value is number => value !== undefined) ? parsed : null;
};

// ─── Shared sub-components ────────────────────────────────────────────────────

function CalcInput({
  label,
  hint,
  value,
  onChange,
  prefix,
  suffix,
}: {
  label: string;
  hint?: string;
  value: string;
  onChange: (v: string) => void;
  prefix?: string;
  suffix?: string;
}) {
  return (
    <View style={styles.fieldGroup}>
      <Text style={styles.fieldLabel}>{label}</Text>
      <View style={styles.inputRow}>
        {prefix && <Text style={styles.inputAdorn}>{prefix}</Text>}
        <TextInput
          style={[styles.input, prefix && styles.inputWithPrefix, suffix && styles.inputWithSuffix]}
          value={value}
          onChangeText={onChange}
          keyboardType="decimal-pad"
          placeholder={hint ?? '0'}
          placeholderTextColor={colors.inkMuted}
          accessibilityLabel={label}
          accessibilityHint={hint ? `Example: ${hint.replace(/^e\.g\.\s*/, '')}` : undefined}
        />
        {suffix && <Text style={styles.inputAdorn}>{suffix}</Text>}
      </View>
    </View>
  );
}

function CalcButton({ onPress, onReset, disabled }: { onPress: () => void; onReset: () => void; disabled?: boolean }) {
  return (
    <View style={styles.calcActions}>
      <Pressable
        style={[styles.calcBtn, disabled && styles.calcBtnDisabled]}
        onPress={onPress}
        disabled={disabled}
        accessibilityRole="button"
        accessibilityState={{ disabled: Boolean(disabled) }}
      >
        <Text style={[styles.calcBtnText, disabled && styles.calcBtnTextDisabled]}>Calculate</Text>
      </Pressable>
      <Pressable style={styles.resetBtn} onPress={onReset} accessibilityRole="button">
        <Text style={styles.resetBtnText}>Reset scenario</Text>
      </Pressable>
    </View>
  );
}

function editAndInvalidate(setter: (value: string) => void, clear: () => void) {
  return (value: string) => { setter(value); clear(); };
}

function ResultCard({
  value,
  unit,
  inputsUsed,
  mechanismNote,
  roundingAndOmissions,
  onRendered,
}: {
  value: string;
  unit: string;
  inputsUsed: string;
  mechanismNote: string;
  roundingAndOmissions: string;
  onRendered?: () => void;
}) {
  const headingRef = useRef<Text>(null);
  useEffect(() => {
    AccessibilityInfo.announceForAccessibility(`${unit}: ${value}`);
    if (Platform.OS !== 'web') {
      const handle = findNodeHandle(headingRef.current);
      if (handle) AccessibilityInfo.setAccessibilityFocus(handle);
    }
    onRendered?.();
  }, [onRendered, unit, value]);
  return (
    <View style={styles.resultCard} accessibilityLiveRegion="polite">
      <Text ref={headingRef} style={styles.resultUnit} accessibilityRole="header">{unit}</Text>
      <Text style={styles.resultValue}>{value}</Text>
      <Text style={styles.evidenceHeading}>Inputs used</Text>
      <Text style={styles.resultNote}>{inputsUsed}</Text>
      <Text style={styles.evidenceHeading}>Formula and convention</Text>
      <Text style={styles.resultNote}>{mechanismNote}</Text>
      <Text style={styles.evidenceHeading}>Rounding, caps and omissions</Text>
      <Text style={styles.resultNote}>{roundingAndOmissions}</Text>
    </View>
  );
}

function CalcWrapper({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <ScrollView style={styles.screen} contentContainerStyle={styles.content}>
      <Text style={styles.heading}>{title}</Text>
      {children}
    </ScrollView>
  );
}

// ─── C-04: SIP Goal Planner ────────────────────────────────────────────────
// Formula: monthly SIP = FV × r / ((1+r)^n − 1)
// where r = annual_rate / 12 / 100, n = years × 12

function SipGoalCalc({ onComputed }: CalcProps) {
  const [target, setTarget] = useState('');
  const [years, setYears] = useState('');
  const [rate, setRate] = useState('');
  const [result, setResult] = useState<number | null>(null);
  const [error, setError] = useState<string | null>(null);
  const invalidate = () => { setError(result !== null ? INPUTS_CHANGED_NOTICE : null); setResult(null); };

  function calculate() {
    const values = parseCalculatorInputs(target, rate, years);
    if (!values) { setResult(null); setError('Enter ordinary finite numbers in every field.'); return; }
    const outcome = calculateSipGoal(values[0], values[1], values[2]);
    setResult(outcome.ok ? outcome.result.monthlyContribution : null);
    setError(outcome.ok ? null : outcome.error === 'overflow' ? 'This combination exceeds the calculator’s safe numeric range.' : 'Use a target above zero, a rate from 0% to 1,000%, and a horizon that rounds to 1–2,400 months.');
  }

  const ready = target !== '' && years !== '' && rate !== '';

  return (
    <CalcWrapper title="SIP Goal Planner">
      <CalcInput label="Target amount" prefix="₹" value={target} onChange={editAndInvalidate(setTarget, invalidate)} hint="e.g. 5000000" />
      <CalcInput label="Time horizon" suffix="years" value={years} onChange={editAndInvalidate(setYears, invalidate)} hint="e.g. 10" />
      <CalcInput label="Expected annual return" suffix="%" value={rate} onChange={editAndInvalidate(setRate, invalidate)} hint="e.g. 12" />
      <CalcButton onPress={calculate} disabled={!ready} onReset={() => { setTarget(''); setYears(''); setRate(''); setResult(null); setError(null); }} />
      {error && <Text accessibilityRole="alert" style={styles.calcError}>{error}</Text>}
      {result !== null && (
        <ResultCard
          unit="Monthly SIP needed"
          value={formatRupees(result)}
          inputsUsed={`${formatRupees(parseScenarioNumber(target)!.value)} target · ${rate}% annual return · ${years} years — all entered by you.`}
          mechanismNote={`At ${rate}% annual return over ${years} years, this monthly SIP compounds to your target. Contributions are modeled at each month end and begin compounding in the following month. The formula is the inverse of the standard SIP corpus formula — it works backwards from your goal.`}
          roundingAndOmissions="The horizon rounds to modeled months and rupees display to two decimals. Tax, fees, volatility, rate changes and missed contributions are omitted."
          onRendered={onComputed}
        />
      )}
    </CalcWrapper>
  );
}

// ─── C-10: Home Loan EMI ──────────────────────────────────────────────────
// Formula: EMI = P × r × (1+r)^n / ((1+r)^n − 1)

function EmiCalc({ onComputed }: CalcProps) {
  const [principal, setPrincipal] = useState('');
  const [rate, setRate] = useState('');
  const [tenure, setTenure] = useState('');
  const [result, setResult] = useState<{ emi: number; totalInterest: number } | null>(null);
  const [error, setError] = useState<string | null>(null);
  const invalidate = () => { setError(result !== null ? INPUTS_CHANGED_NOTICE : null); setResult(null); };

  function calculate() {
    const values = parseCalculatorInputs(principal, rate, tenure);
    if (!values) { setResult(null); setError('Enter ordinary finite numbers in every field.'); return; }
    const outcome = calculateHomeLoanEmi(values[0], values[1], values[2]);
    setResult(outcome.ok ? outcome.result : null);
    setError(outcome.ok ? null : outcome.error === 'overflow' ? 'This combination exceeds the calculator’s safe numeric range.' : 'Use a principal above zero, a rate from 0% to 1,000%, and a tenure that rounds to 1–600 months.');
  }

  const ready = principal !== '' && rate !== '' && tenure !== '';

  return (
    <CalcWrapper title="Home Loan EMI">
      <CalcInput label="Loan amount" prefix="₹" value={principal} onChange={editAndInvalidate(setPrincipal, invalidate)} hint="e.g. 5000000" />
      <CalcInput label="Annual interest rate" suffix="%" value={rate} onChange={editAndInvalidate(setRate, invalidate)} hint="e.g. 8.5" />
      <CalcInput label="Loan tenure" suffix="years" value={tenure} onChange={editAndInvalidate(setTenure, invalidate)} hint="e.g. 20" />
      <CalcButton onPress={calculate} disabled={!ready} onReset={() => { setPrincipal(''); setRate(''); setTenure(''); setResult(null); setError(null); }} />
      {error && <Text accessibilityRole="alert" style={styles.calcError}>{error}</Text>}
      {result !== null && (
        <>
          <ResultCard
            unit="Monthly EMI"
            value={formatRupees(result.emi)}
            inputsUsed={`${formatRupees(parseScenarioNumber(principal)!.value)} principal · ${rate}% annual rate · ${tenure} years — all entered by you.`}
            mechanismNote={`Each EMI pays the interest accrued that month first; the remainder reduces the principal. Early in the tenure most of each payment goes toward interest.`}
            roundingAndOmissions="Tenure rounds to modeled months and rupees display to two decimals. Fees, prepayment, changing rates and lender-specific daily rounding are omitted."
            onRendered={onComputed}
          />
          <View style={styles.secondaryResult}>
            <Text style={styles.secondaryLabel}>Total interest paid</Text>
            <Text style={styles.secondaryValue}>{formatRupees(result.totalInterest)}</Text>
          </View>
        </>
      )}
    </CalcWrapper>
  );
}

// ─── C-17: Inflation Impact ────────────────────────────────────────────────
// Formula: future = present × (1 + inflation/100)^years

function InflationCalc({ onComputed }: CalcProps) {
  const [present, setPresent] = useState('');
  const [inflationRate, setInflationRate] = useState('');
  const [years, setYears] = useState('');
  const [result, setResult] = useState<number | null>(null);
  const [error, setError] = useState<string | null>(null);
  const invalidate = () => { setError(result !== null ? INPUTS_CHANGED_NOTICE : null); setResult(null); };

  function calculate() {
    const values = parseCalculatorInputs(present, inflationRate, years);
    if (!values) { setResult(null); setError('Enter ordinary finite numbers in every field.'); return; }
    const outcome = calculateInflationImpact(values[0], values[1], values[2]);
    setResult(outcome.ok ? outcome.result.futureCost : null);
    setError(outcome.ok ? null : outcome.error === 'overflow' ? 'This combination exceeds the calculator’s safe numeric range.' : 'Use a present cost above zero, an annual rate from −100% to 1,000%, and a horizon from 0 to 200 years.');
  }

  const ready = present !== '' && inflationRate !== '' && years !== '';

  return (
    <CalcWrapper title="Inflation Impact">
      <CalcInput label="Today's cost" prefix="₹" value={present} onChange={editAndInvalidate(setPresent, invalidate)} hint="e.g. 50000" />
      <CalcInput label="Annual inflation rate" suffix="%" value={inflationRate} onChange={editAndInvalidate(setInflationRate, invalidate)} hint="e.g. 6" />
      <CalcInput label="Years from now" suffix="years" value={years} onChange={editAndInvalidate(setYears, invalidate)} hint="e.g. 10" />
      <CalcButton onPress={calculate} disabled={!ready} onReset={() => { setPresent(''); setInflationRate(''); setYears(''); setResult(null); setError(null); }} />
      {error && <Text accessibilityRole="alert" style={styles.calcError}>{error}</Text>}
      {result !== null && (
        <ResultCard
          unit={`Equivalent cost in ${years} years`}
          value={formatRupees(result)}
          inputsUsed={`${formatRupees(parseScenarioNumber(present)!.value)} present cost · ${inflationRate}% annual inflation · ${years} years — all entered by you.`}
          mechanismNote={`At ${inflationRate}% annual inflation, purchasing power falls by roughly ${inflationRate}% a year. This is the same amount of money's worth, not the same rupee amount.`}
          roundingAndOmissions="The entered fractional-year horizon is preserved and rupees display to two decimals. Category variation and tax are omitted; the rate stays fixed."
          onRendered={onComputed}
        />
      )}
    </CalcWrapper>
  );
}

// ─── C-22: Step-up SIP Corpus ─────────────────────────────────────────────
// Year-by-year iteration: SIP increases by step-up% each year, compounding monthly.

function StepUpSipCalc({ onComputed }: CalcProps) {
  const [sip, setSip] = useState('');
  const [stepup, setStepup] = useState('');
  const [rate, setRate] = useState('');
  const [years, setYears] = useState('');
  const [result, setResult] = useState<{ corpus: number; invested: number } | null>(null);
  const [error, setError] = useState<string | null>(null);
  const invalidate = () => { setError(result !== null ? INPUTS_CHANGED_NOTICE : null); setResult(null); };

  function calculate() {
    const values = parseCalculatorInputs(sip, stepup, rate, years);
    if (!values) { setResult(null); setError('Enter ordinary finite numbers in every field.'); return; }
    const next = calculateStepUpSip(values[0], values[1], values[2], values[3]);
    setResult(next); setError(next ? null : 'Use a positive starting contribution, rates from 0% to 1,000%, and a whole-year horizon from 1 to 200.');
  }

  const ready = sip !== '' && stepup !== '' && rate !== '' && years !== '';

  return (
    <CalcWrapper title="Step-up SIP">
      <CalcInput label="Starting monthly SIP" prefix="₹" value={sip} onChange={editAndInvalidate(setSip, invalidate)} hint="e.g. 5000" />
      <CalcInput label="Annual step-up" suffix="%" value={stepup} onChange={editAndInvalidate(setStepup, invalidate)} hint="e.g. 10" />
      <CalcInput label="Expected annual return" suffix="%" value={rate} onChange={editAndInvalidate(setRate, invalidate)} hint="e.g. 12" />
      <CalcInput label="Investment period" suffix="years" value={years} onChange={editAndInvalidate(setYears, invalidate)} hint="e.g. 15" />
      <CalcButton onPress={calculate} disabled={!ready} onReset={() => { setSip(''); setStepup(''); setRate(''); setYears(''); setResult(null); setError(null); }} />
      {error && <Text accessibilityRole="alert" style={styles.calcError}>{error}</Text>}
      {result !== null && (
        <>
          <ResultCard
            unit="Corpus at end of period"
            value={formatRupees(result.corpus)}
            inputsUsed={`${formatRupees(parseScenarioNumber(sip)!.value)} starting monthly contribution · ${stepup}% yearly step · ${rate}% annual return · ${years} whole years — all entered by you.`}
            mechanismNote={`Your SIP starts at ${formatRupees(parseScenarioNumber(sip)?.value ?? 0)}/month and increases by ${stepup}% each year. Contributions are modeled at each month end and begin compounding in the following month; each annual step-up starts with the first contribution of the new 12-month block.`}
            roundingAndOmissions="Only whole years are modeled; rupees display to two decimals. Fees, tax, volatility, rate/step changes and missed contributions are omitted."
            onRendered={onComputed}
          />
          <View style={styles.secondaryResult}>
            <Text style={styles.secondaryLabel}>Total amount invested</Text>
            <Text style={styles.secondaryValue}>{formatRupees(result.invested)}</Text>
          </View>
        </>
      )}
    </CalcWrapper>
  );
}

// ─── C-24: CAGR Backward ──────────────────────────────────────────────────
// Formula: CAGR = (final / initial)^(1/years) − 1

function CagrCalc({ onComputed }: CalcProps) {
  const [initial, setInitial] = useState('');
  const [final, setFinal] = useState('');
  const [years, setYears] = useState('');
  const [result, setResult] = useState<number | null>(null);
  const [error, setError] = useState<string | null>(null);
  const invalidate = () => { setError(result !== null ? INPUTS_CHANGED_NOTICE : null); setResult(null); };

  function calculate() {
    const values = parseCalculatorInputs(initial, final, years);
    if (!values) { setResult(null); setError('Enter ordinary finite numbers in every field.'); return; }
    const outcome = calculateCagr(values[0], values[1], values[2]);
    setResult(outcome.ok ? outcome.result.annualRatePercent : null);
    setError(outcome.ok ? null : outcome.error === 'overflow' ? 'This combination exceeds the calculator’s safe numeric range.' : 'Use positive initial and final values and a horizon above zero up to 200 years.');
  }

  const ready = initial !== '' && final !== '' && years !== '';

  return (
    <CalcWrapper title="CAGR Calculator">
      <CalcInput label="Initial investment" prefix="₹" value={initial} onChange={editAndInvalidate(setInitial, invalidate)} hint="e.g. 100000" />
      <CalcInput label="Current value" prefix="₹" value={final} onChange={editAndInvalidate(setFinal, invalidate)} hint="e.g. 185000" />
      <CalcInput label="Years held" suffix="years" value={years} onChange={editAndInvalidate(setYears, invalidate)} hint="e.g. 5" />
      <CalcButton onPress={calculate} disabled={!ready} onReset={() => { setInitial(''); setFinal(''); setYears(''); setResult(null); setError(null); }} />
      {error && <Text accessibilityRole="alert" style={styles.calcError}>{error}</Text>}
      {result !== null && (
        <ResultCard
          unit="Annualised return (CAGR)"
          value={`${result.toFixed(2)}%`}
          inputsUsed={`${formatRupees(parseScenarioNumber(initial)!.value)} initial value · ${formatRupees(parseScenarioNumber(final)!.value)} final value · ${years} years — all entered by you.`}
          mechanismNote={`CAGR (Compound Annual Growth Rate) is the year-on-year rate at which an investment grew as if it compounded smoothly. It describes what happened, not what will happen next.`}
          roundingAndOmissions="The percentage displays to two decimals. Interim cash flows, fees and tax are omitted; this is not a forecast."
          onRendered={onComputed}
        />
      )}
    </CalcWrapper>
  );
}

// ─── D-128: Compound Growth ───────────────────────────────────────────────
function CompoundGrowthCalc({ onComputed }: CalcProps) {
  const [lumpSum, setLumpSum] = useState('');
  const [monthly, setMonthly] = useState('');
  const [rate, setRate] = useState('');
  const [years, setYears] = useState('');
  const [result, setResult] = useState<Extract<ReturnType<typeof calculateCompoundGrowth>, { ok: true }>['result'] | null>(null);
  const [error, setError] = useState<string | null>(null);
  const edit = (setter: (value: string) => void) => (value: string) => {
    setter(value); setError(result ? INPUTS_CHANGED_NOTICE : null); setResult(null);
  };

  function calculate() {
    const values = parseCalculatorInputs(lumpSum, monthly, rate, years);
    const next = values
      ? calculateCompoundGrowth(values[0], values[1], values[2], values[3])
      : { ok: false as const, error: 'non_finite' as const };
    if (!next.ok) {
      setResult(null);
      const messages = {
        non_finite: 'Enter ordinary finite numbers in every field.',
        amount_required: 'Enter a positive starting amount or monthly contribution.',
        negative_value: 'Amounts, rate, and horizon cannot be negative.',
        amount_too_large: 'Each amount must be no more than ₹1 lakh crore.',
        rate_out_of_range: 'Enter an annual rate from 0% to 1,000%.',
        horizon_out_of_range: 'Enter a horizon no greater than 200 years.',
        horizon_rounds_to_zero: 'Enter a horizon that rounds to at least one modeled month—about 0.042 years or more.',
        numeric_overflow: 'This combination grows beyond the calculator’s safe numeric range. Reduce an amount, rate, or horizon.',
      } as const;
      setError(messages[next.error]);
      return;
    }
    setError(null);
    setResult(next.result);
  }

  const ready = lumpSum !== '' && monthly !== '' && rate !== '' && years !== '';
  return (
    <CalcWrapper title="Compound Growth">
      <CalcInput label="Starting lump sum" prefix="₹" value={lumpSum} onChange={edit(setLumpSum)} />
      <CalcInput label="Monthly contribution" prefix="₹" value={monthly} onChange={edit(setMonthly)} />
      <CalcInput label="Annual rate" suffix="%" value={rate} onChange={edit(setRate)} />
      <CalcInput label="Time horizon" suffix="years" value={years} onChange={edit(setYears)} />
      <CalcButton onPress={calculate} disabled={!ready} onReset={() => { setLumpSum(''); setMonthly(''); setRate(''); setYears(''); setResult(null); setError(null); }} />
      {error ? <Text accessibilityRole="alert" style={styles.calcError}>{error}</Text> : null}
      {result ? (
        <>
          <ResultCard
            unit="Modeled amount at end"
            value={formatRupees(result.endingAmount)}
            inputsUsed={`${formatRupees(parseScenarioNumber(lumpSum)!.value)} starting amount · ${formatRupees(parseScenarioNumber(monthly)!.value)} monthly contribution · ${rate}% annual rate · ${years} years — all entered by you.`}
            mechanismNote={`This is a conditional model using your fixed ${rate}% annual rate, compounded monthly. Contributions are added at each month end and begin compounding in the following month.`}
            roundingAndOmissions="The horizon rounds to modeled months and rupees display to two decimals. Volatility, fees, tax, missed contributions and changing rates are omitted."
            onRendered={onComputed}
          />
          <View style={styles.secondaryResult}><Text style={styles.secondaryLabel}>Total contributed</Text><Text style={styles.secondaryValue}>{formatRupees(result.totalContributed)}</Text></View>
          <View style={styles.secondaryResult}><Text style={styles.secondaryLabel}>Arithmetic difference</Text><Text style={styles.secondaryValue}>{formatRupees(result.arithmeticDifference)}</Text></View>
          <Text style={styles.disclosure}>This model holds your rate and contribution constant. It excludes volatility, fees, tax, missed contributions, and changing rates. It is not a forecast or recommendation.</Text>
        </>
      ) : null}
    </CalcWrapper>
  );
}

// ─── D-145: Neutral goal contribution gap ─────────────────────────────────
function GoalAffordabilityCalc({ onComputed }: CalcProps) {
  const [target, setTarget] = useState('');
  const [current, setCurrent] = useState('');
  const [plannedMonthly, setPlannedMonthly] = useState('');
  const [rate, setRate] = useState('');
  const [years, setYears] = useState('');
  const [outcome, setOutcome] = useState<ReturnType<typeof calculateGoalAffordability> | null>(null);
  const [notice, setNotice] = useState<string | null>(null);
  const edit = (setter: (value: string) => void) => (value: string) => {
    setter(value);
    setNotice(outcome?.ok ? INPUTS_CHANGED_NOTICE : null);
    setOutcome(null);
  };

  const calculate = () => {
    const values = parseCalculatorInputs(target, current, plannedMonthly, rate, years);
    setOutcome(values
      ? calculateGoalAffordability(values[0], values[1], values[2], values[3], values[4])
      : { ok: false, error: 'non_finite' });
    setNotice(null);
  };
  const result = outcome?.ok ? outcome.result : null;
  const errorCopy = outcome && !outcome.ok ? {
    non_finite: 'Enter ordinary finite numbers in every field.',
    target_required: 'Enter a target amount above zero.',
    negative_value: 'Amounts, rate, and horizon cannot be negative.',
    amount_too_large: 'Each amount must be no more than ₹1 lakh crore.',
    rate_out_of_range: 'Enter an annual assumed rate from 0% to 1,000%.',
    horizon_out_of_range: 'Enter a horizon no greater than 200 years.',
    horizon_rounds_to_zero: 'Enter a horizon that rounds to at least one modeled month—about 0.042 years or more.',
    numeric_overflow: 'This combination grows beyond the calculator’s safe numeric range. Reduce an amount, rate, or horizon.',
  }[outcome.error] : null;

  let gapCopy = '';
  if (result) {
    const gap = result.monthlyContributionGap;
    gapCopy = Math.abs(gap) < 0.005
      ? 'Your planned monthly contribution matches the modeled requirement.'
      : gap < 0
        ? `${formatRupees(Math.abs(gap))} more per month closes the modeled gap.`
        : `Your plan is ${formatRupees(gap)} above the modeled monthly requirement.`;
  }

  return (
    <CalcWrapper title="Goal contribution gap">
      <Text style={styles.prefillIntro}>
        Enter one possible goal scenario. Change any value and calculate again to compare a different scenario.
      </Text>
      <CalcInput label="Goal target" prefix="₹" value={target} onChange={edit(setTarget)} />
      <CalcInput label="Current amount earmarked" prefix="₹" value={current} onChange={edit(setCurrent)} />
      <CalcInput label="Planned monthly contribution" prefix="₹" value={plannedMonthly} onChange={edit(setPlannedMonthly)} />
      <CalcInput label="Annual assumed return" suffix="%" value={rate} onChange={edit(setRate)} />
      <CalcInput label="Time horizon" suffix="years" value={years} onChange={edit(setYears)} />
      <CalcButton onPress={calculate} disabled={[target, current, plannedMonthly, rate, years].some((value) => value === '')} onReset={() => { setTarget(''); setCurrent(''); setPlannedMonthly(''); setRate(''); setYears(''); setOutcome(null); setNotice(null); }} />
      {notice ? <Text accessibilityRole="alert" style={styles.calcError}>{notice}</Text> : null}
      {errorCopy ? <Text accessibilityRole="alert" style={styles.calcError}>{errorCopy}</Text> : null}
      {result ? (
        <>
          <ResultCard
            unit="Modeled amount at end"
            value={formatRupees(result.endingValue)}
            inputsUsed={`${formatRupees(parseScenarioNumber(target)!.value)} target · ${formatRupees(parseScenarioNumber(current)!.value)} current amount · ${formatRupees(parseScenarioNumber(plannedMonthly)!.value)} planned monthly contribution · ${rate}% annual rate · ${years} years — all entered by you.`}
            mechanismNote={`Your current amount compounds for ${result.months} months. Each planned contribution enters at month end and begins compounding the following month.`}
            roundingAndOmissions="The horizon rounds to modeled months and rupees display to two decimals. Volatility, fees, tax, inflation, misses and changing rates are omitted."
            onRendered={onComputed}
          />
          <View style={styles.secondaryResult}>
            <Text style={styles.secondaryLabel}>Modeled monthly requirement</Text>
            <Text style={styles.secondaryValue}>{formatRupees(result.requiredMonthlyContribution)}</Text>
          </View>
          <Text style={styles.gapExplanation}>{gapCopy}</Text>
          <Text style={styles.disclosure}>
            This is a conditional model using only the values you entered. It holds the return and monthly contribution constant and excludes volatility, fees, tax, inflation, missed contributions, and changing rates. It is not a forecast or recommendation.
          </Text>
        </>
      ) : null}
    </CalcWrapper>
  );
}

// ─── D-128: Credit-card Payoff ────────────────────────────────────────────
function CreditCardPayoffCalc({ onComputed }: CalcProps) {
  const [balance, setBalance] = useState('');
  const [rate, setRate] = useState('');
  const [payment, setPayment] = useState('');
  const [outcome, setOutcome] = useState<ReturnType<typeof calculateCreditCardPayoff> | null>(null);
  const [notice, setNotice] = useState<string | null>(null);

  const editBalance = (value: string) => {
    setBalance(value);
    setNotice(outcome?.kind === 'paid_off' ? INPUTS_CHANGED_NOTICE : null);
    setOutcome(null);
  };
  const editRate = (value: string) => {
    setRate(value);
    setNotice(outcome?.kind === 'paid_off' ? INPUTS_CHANGED_NOTICE : null);
    setOutcome(null);
  };
  const editPayment = (value: string) => {
    setPayment(value);
    setNotice(outcome?.kind === 'paid_off' ? INPUTS_CHANGED_NOTICE : null);
    setOutcome(null);
  };

  const calculate = () => {
    const values = parseCalculatorInputs(balance, rate, payment);
    setOutcome(values
      ? calculateCreditCardPayoff(values[0], values[1], values[2])
      : { kind: 'invalid', reason: 'non_finite' });
    setNotice(null);
  };
  const validResult = outcome?.kind === 'paid_off' ? outcome : null;
  const errorCopy = outcome?.kind === 'invalid' ? {
    non_finite: 'Enter ordinary finite numbers in every field.',
    balance: 'Enter an outstanding balance above zero.',
    rate: 'Enter an annual rate from 0% to 1,000%.',
    payment: 'Enter a fixed monthly payment above zero.',
    unsafe: 'Use a balance and payment no greater than ₹1 lakh crore.',
  }[outcome.reason] : null;

  return (
    <CalcWrapper title="Credit-card Payoff">
      <Text style={styles.prefillIntro}>Enter the balance, annual rate, and one fixed monthly payment you want to model. FinTutor does not select a card or payment for you.</Text>
      <CalcInput label="Outstanding balance" prefix="₹" value={balance} onChange={editBalance} />
      <CalcInput label="Annual interest rate" suffix="%" value={rate} onChange={editRate} />
      <CalcInput label="Fixed monthly payment" prefix="₹" value={payment} onChange={editPayment} />
      <CalcButton onPress={calculate} disabled={balance === '' || rate === '' || payment === ''} onReset={() => { setBalance(''); setRate(''); setPayment(''); setOutcome(null); setNotice(null); }} />
      {notice ? <Text accessibilityRole="alert" style={styles.calcError}>{notice}</Text> : null}
      {errorCopy ? <Text accessibilityRole="alert" style={styles.calcError}>{errorCopy}</Text> : null}
      {outcome?.kind === 'non_clearing' ? <Text accessibilityRole="alert" style={styles.calcError}>With these inputs, the first month’s interest is at least the fixed payment, so the modeled balance does not reach zero.</Text> : null}
      {outcome?.kind === 'capped' ? <Text accessibilityRole="alert" style={styles.calcError}>This balance does not reach zero within the model’s {PAYOFF_MONTH_CAP.toLocaleString('en-IN')}-month safety limit, so no payoff result is shown.</Text> : null}
      {validResult ? (
        <>
          <ResultCard unit="Modeled payoff time" value={`${validResult.months} months`} inputsUsed={`${formatRupees(parseScenarioNumber(balance)!.value)} balance · ${rate}% annual rate · ${formatRupees(parseScenarioNumber(payment)!.value)} fixed monthly payment — all entered by you.`} mechanismNote="Each month applies interest to the remaining balance first, then subtracts your fixed payment, clamped to the amount due in the final month." roundingAndOmissions={`The model stops without a result after ${PAYOFF_MONTH_CAP.toLocaleString('en-IN')} months. Rupees display to two decimals; new spending, fees, penalty interest, changes and issuer-specific daily rules are omitted.`} onRendered={onComputed} />
          <View style={styles.secondaryResult}><Text style={styles.secondaryLabel}>Total paid</Text><Text style={styles.secondaryValue}>{formatRupees(validResult.totalPaid)}</Text></View>
          <View style={styles.secondaryResult}><Text style={styles.secondaryLabel}>Total interest</Text><Text style={styles.secondaryValue}>{formatRupees(validResult.totalInterest)}</Text></View>
          <View style={styles.secondaryResult}><Text style={styles.secondaryLabel}>Final payment</Text><Text style={styles.secondaryValue}>{formatRupees(validResult.finalPayment)}</Text></View>
          <Text style={styles.disclosure}>This is a fixed-payment model, not a payment recommendation. It excludes new spending, fees, penalty interest, rate or payment changes, and issuer-specific daily interest and rounding.</Text>
        </>
      ) : null}
    </CalcWrapper>
  );
}

// ─── Styles ───────────────────────────────────────────────────────────────

const styles = StyleSheet.create({
  flex: { flex: 1 },
  screen: { flex: 1, backgroundColor: colors.screen },
  content: { padding: spacing.xl, paddingBottom: spacing.xxxl },
  heading: {
    fontFamily: font.uiSemibold,
    fontSize: 22,
    color: colors.ink,
    marginBottom: spacing.xl,
  },
  fieldGroup: { marginBottom: spacing.lg },
  fieldLabel: {
    fontFamily: font.mono,
    fontSize: 11,
    letterSpacing: 1,
    textTransform: 'uppercase',
    color: colors.inkMuted,
    marginBottom: spacing.xs,
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
  calcActions: { marginTop: spacing.lg, marginBottom: spacing.xl },
  calcBtn: {
    backgroundColor: colors.tutor,
    borderRadius: radius.md,
    paddingVertical: 14,
    alignItems: 'center',
  },
  calcBtnDisabled: { backgroundColor: colors.line },
  calcBtnText: { fontFamily: font.uiSemibold, fontSize: 15, color: colors.canvas },
  calcBtnTextDisabled: { color: colors.inkMuted },
  resetBtn: { minHeight: 44, alignItems: 'center', justifyContent: 'center' },
  resetBtnText: { fontFamily: font.uiSemibold, fontSize: 14, color: colors.tutor },
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
  // P10: result value in ink, never coloured by valence.
  resultValue: { fontFamily: font.mono, fontSize: 28, color: colors.ink },
  resultNote: {
    fontFamily: font.tutor,
    fontSize: 14,
    lineHeight: 20,
    color: colors.inkSecondary,
    marginTop: spacing.md,
  },
  evidenceHeading: { fontFamily: font.mono, fontSize: 11, letterSpacing: 0.8, textTransform: 'uppercase', color: colors.ink, marginTop: spacing.lg },
  secondaryResult: {
    marginTop: spacing.lg,
    paddingTop: spacing.lg,
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: colors.line,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  secondaryLabel: { fontFamily: font.ui, fontSize: 13, color: colors.inkSecondary },
  secondaryValue: { fontFamily: font.mono, fontSize: 15, color: colors.ink },
  calcError: { color: colors.danger, fontFamily: font.ui, fontSize: 13, lineHeight: 19, marginBottom: spacing.lg },
  disclosure: { color: colors.inkSecondary, fontFamily: font.tutor, fontSize: 13, lineHeight: 19, marginTop: spacing.lg },
  gapExplanation: { color: colors.ink, fontFamily: font.tutor, fontSize: 15, lineHeight: 21, marginTop: spacing.lg },
  prefillIntro: { color: colors.inkSecondary, fontFamily: font.ui, fontSize: 13, lineHeight: 19, marginBottom: spacing.md },
  prefillStatus: { color: colors.inkMuted, fontFamily: font.ui, fontSize: 13, lineHeight: 19, marginBottom: spacing.md },
  cardChoices: { gap: spacing.sm, marginBottom: spacing.lg },
  cardChoice: { minHeight: 52, justifyContent: 'center', borderWidth: StyleSheet.hairlineWidth, borderColor: colors.line, borderRadius: radius.md, paddingHorizontal: spacing.md, paddingVertical: spacing.sm },
  cardChoiceSelected: { borderColor: colors.tutor, backgroundColor: colors.tutorSoft },
  cardChoiceLabel: { color: colors.ink, fontFamily: font.uiSemibold, fontSize: 14 },
  cardChoiceHint: { color: colors.inkSecondary, fontFamily: font.ui, fontSize: 12, marginTop: 2 },
});
