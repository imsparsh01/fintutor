import { useState } from 'react';
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
import { useRoute } from '@react-navigation/native';
import type { RouteProp } from '@react-navigation/native';
import { colors, font, radius, spacing } from '../design/tokens';
import { formatRupees } from '../lib/format';
import type { CalculatorType, MainTabsParamList } from '../navigation/types';

// BQ-057 (D-105/D-106): 5 calculator screens — all free-form input, pure frontend math.
// Outputs render in font.mono / colors.ink (P10 — no valence colour). Each result card
// includes a mechanism explanation (D-088 tutor voice) so the user understands what the
// number IS, not just what it says.

export function CalculatorScreen() {
  const route = useRoute<RouteProp<MainTabsParamList, 'Calculator'>>();
  const { type } = route.params;

  return (
    <KeyboardAvoidingView
      style={styles.flex}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      {type === 'sip_goal' && <SipGoalCalc />}
      {type === 'emi' && <EmiCalc />}
      {type === 'inflation' && <InflationCalc />}
      {type === 'stepup_sip' && <StepUpSipCalc />}
      {type === 'cagr_backward' && <CagrCalc />}
    </KeyboardAvoidingView>
  );
}

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
        />
        {suffix && <Text style={styles.inputAdorn}>{suffix}</Text>}
      </View>
    </View>
  );
}

function CalcButton({ onPress, disabled }: { onPress: () => void; disabled?: boolean }) {
  return (
    <Pressable
      style={[styles.calcBtn, disabled && styles.calcBtnDisabled]}
      onPress={onPress}
      disabled={disabled}
    >
      <Text style={[styles.calcBtnText, disabled && styles.calcBtnTextDisabled]}>
        Calculate
      </Text>
    </Pressable>
  );
}

function ResultCard({
  value,
  unit,
  mechanismNote,
}: {
  value: string;
  unit: string;
  mechanismNote: string;
}) {
  return (
    <View style={styles.resultCard}>
      <Text style={styles.resultUnit}>{unit}</Text>
      <Text style={styles.resultValue}>{value}</Text>
      <Text style={styles.resultNote}>{mechanismNote}</Text>
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

function SipGoalCalc() {
  const [target, setTarget] = useState('');
  const [years, setYears] = useState('');
  const [rate, setRate] = useState('');
  const [result, setResult] = useState<number | null>(null);

  function calculate() {
    const fv = parseFloat(target);
    const n = parseFloat(years) * 12;
    const r = parseFloat(rate) / 12 / 100;
    if (!fv || !n || !r || r <= 0) return;
    const sip = (fv * r) / (Math.pow(1 + r, n) - 1);
    setResult(sip);
  }

  const ready = target !== '' && years !== '' && rate !== '';

  return (
    <CalcWrapper title="SIP Goal Planner">
      <CalcInput label="Target amount" prefix="₹" value={target} onChange={setTarget} hint="e.g. 5000000" />
      <CalcInput label="Time horizon" suffix="years" value={years} onChange={setYears} hint="e.g. 10" />
      <CalcInput label="Expected annual return" suffix="%" value={rate} onChange={setRate} hint="e.g. 12" />
      <CalcButton onPress={calculate} disabled={!ready} />
      {result !== null && (
        <ResultCard
          unit="Monthly SIP needed"
          value={formatRupees(result)}
          mechanismNote={`At ${rate}% annual return over ${years} years, this monthly SIP compounds to your target. The formula is the inverse of the standard SIP corpus formula — it works backwards from your goal.`}
        />
      )}
    </CalcWrapper>
  );
}

// ─── C-10: Home Loan EMI ──────────────────────────────────────────────────
// Formula: EMI = P × r × (1+r)^n / ((1+r)^n − 1)

function EmiCalc() {
  const [principal, setPrincipal] = useState('');
  const [rate, setRate] = useState('');
  const [tenure, setTenure] = useState('');
  const [result, setResult] = useState<{ emi: number; totalInterest: number } | null>(null);

  function calculate() {
    const p = parseFloat(principal);
    const r = parseFloat(rate) / 12 / 100;
    const n = parseFloat(tenure) * 12;
    if (!p || !r || !n || r <= 0) return;
    const emi = (p * r * Math.pow(1 + r, n)) / (Math.pow(1 + r, n) - 1);
    const totalInterest = emi * n - p;
    setResult({ emi, totalInterest });
  }

  const ready = principal !== '' && rate !== '' && tenure !== '';

  return (
    <CalcWrapper title="Home Loan EMI">
      <CalcInput label="Loan amount" prefix="₹" value={principal} onChange={setPrincipal} hint="e.g. 5000000" />
      <CalcInput label="Annual interest rate" suffix="%" value={rate} onChange={setRate} hint="e.g. 8.5" />
      <CalcInput label="Loan tenure" suffix="years" value={tenure} onChange={setTenure} hint="e.g. 20" />
      <CalcButton onPress={calculate} disabled={!ready} />
      {result !== null && (
        <>
          <ResultCard
            unit="Monthly EMI"
            value={formatRupees(result.emi)}
            mechanismNote={`Each EMI pays the interest accrued that month first; the remainder reduces the principal. Early in the tenure most of each payment goes toward interest.`}
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

function InflationCalc() {
  const [present, setPresent] = useState('');
  const [inflationRate, setInflationRate] = useState('');
  const [years, setYears] = useState('');
  const [result, setResult] = useState<number | null>(null);

  function calculate() {
    const p = parseFloat(present);
    const i = parseFloat(inflationRate) / 100;
    const n = parseFloat(years);
    if (!p || !i || !n) return;
    setResult(p * Math.pow(1 + i, n));
  }

  const ready = present !== '' && inflationRate !== '' && years !== '';

  return (
    <CalcWrapper title="Inflation Impact">
      <CalcInput label="Today's cost" prefix="₹" value={present} onChange={setPresent} hint="e.g. 50000" />
      <CalcInput label="Annual inflation rate" suffix="%" value={inflationRate} onChange={setInflationRate} hint="e.g. 6" />
      <CalcInput label="Years from now" suffix="years" value={years} onChange={setYears} hint="e.g. 10" />
      <CalcButton onPress={calculate} disabled={!ready} />
      {result !== null && (
        <ResultCard
          unit={`Equivalent cost in ${years} years`}
          value={formatRupees(result)}
          mechanismNote={`At ${inflationRate}% annual inflation, purchasing power falls by roughly ${inflationRate}% a year. This is the same amount of money's worth, not the same rupee amount.`}
        />
      )}
    </CalcWrapper>
  );
}

// ─── C-22: Step-up SIP Corpus ─────────────────────────────────────────────
// Year-by-year iteration: SIP increases by step-up% each year, compounding monthly.

function StepUpSipCalc() {
  const [sip, setSip] = useState('');
  const [stepup, setStepup] = useState('');
  const [rate, setRate] = useState('');
  const [years, setYears] = useState('');
  const [result, setResult] = useState<{ corpus: number; invested: number } | null>(null);

  function calculate() {
    const sipAmt = parseFloat(sip);
    const su = parseFloat(stepup) / 100;
    const r = parseFloat(rate) / 12 / 100;
    const yrs = parseInt(years, 10);
    if (!sipAmt || !r || !yrs || su < 0) return;

    let corpus = 0;
    let currentSip = sipAmt;
    let totalInvested = 0;
    for (let y = 0; y < yrs; y++) {
      for (let m = 0; m < 12; m++) {
        corpus = (corpus + currentSip) * (1 + r);
        totalInvested += currentSip;
      }
      currentSip = currentSip * (1 + su);
    }
    setResult({ corpus, invested: totalInvested });
  }

  const ready = sip !== '' && stepup !== '' && rate !== '' && years !== '';

  return (
    <CalcWrapper title="Step-up SIP">
      <CalcInput label="Starting monthly SIP" prefix="₹" value={sip} onChange={setSip} hint="e.g. 5000" />
      <CalcInput label="Annual step-up" suffix="%" value={stepup} onChange={setStepup} hint="e.g. 10" />
      <CalcInput label="Expected annual return" suffix="%" value={rate} onChange={setRate} hint="e.g. 12" />
      <CalcInput label="Investment period" suffix="years" value={years} onChange={setYears} hint="e.g. 15" />
      <CalcButton onPress={calculate} disabled={!ready} />
      {result !== null && (
        <>
          <ResultCard
            unit="Corpus at end of period"
            value={formatRupees(result.corpus)}
            mechanismNote={`Your SIP starts at ${formatRupees(parseFloat(sip))}/month and increases by ${stepup}% each year. The step-up means later years contribute proportionally more to the final corpus than early years.`}
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

function CagrCalc() {
  const [initial, setInitial] = useState('');
  const [final, setFinal] = useState('');
  const [years, setYears] = useState('');
  const [result, setResult] = useState<number | null>(null);

  function calculate() {
    const iv = parseFloat(initial);
    const fv = parseFloat(final);
    const n = parseFloat(years);
    if (!iv || !fv || !n || iv <= 0 || n <= 0) return;
    setResult((Math.pow(fv / iv, 1 / n) - 1) * 100);
  }

  const ready = initial !== '' && final !== '' && years !== '';

  return (
    <CalcWrapper title="CAGR Calculator">
      <CalcInput label="Initial investment" prefix="₹" value={initial} onChange={setInitial} hint="e.g. 100000" />
      <CalcInput label="Current value" prefix="₹" value={final} onChange={setFinal} hint="e.g. 185000" />
      <CalcInput label="Years held" suffix="years" value={years} onChange={setYears} hint="e.g. 5" />
      <CalcButton onPress={calculate} disabled={!ready} />
      {result !== null && (
        <ResultCard
          unit="Annualised return (CAGR)"
          value={`${result.toFixed(2)}%`}
          mechanismNote={`CAGR (Compound Annual Growth Rate) is the year-on-year rate at which an investment grew as if it compounded smoothly. It describes what happened, not what will happen next.`}
        />
      )}
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
  calcBtn: {
    backgroundColor: colors.tutor,
    borderRadius: radius.md,
    paddingVertical: 14,
    alignItems: 'center',
    marginTop: spacing.lg,
    marginBottom: spacing.xl,
  },
  calcBtnDisabled: { backgroundColor: colors.line },
  calcBtnText: { fontFamily: font.uiSemibold, fontSize: 15, color: colors.canvas },
  calcBtnTextDisabled: { color: colors.inkMuted },
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
});
