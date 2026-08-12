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
import { useAuth } from '../lib/AuthContext';
import { calculateCompoundGrowth } from '../lib/compoundGrowth';
import { calculateCreditCardPayoff, PAYOFF_MONTH_CAP } from '../lib/creditCardPayoff';
import { fetchHoldings, type Holding } from '../lib/holdings';
import { formatRupees } from '../lib/format';
import { recordCalculatorCompleted } from '../lib/progression';
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
      {type === 'credit_card_payoff' && <CreditCardPayoffCalc userId={userId} onComputed={onComputed} />}
    </KeyboardAvoidingView>
  );
}

// Every calculator passes this to its primary ResultCard. The card emits from an effect,
// after React has committed the valid result to the screen.
type CalcProps = { onComputed: () => void };

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

function CalcButton({ onPress, disabled }: { onPress: () => void; disabled?: boolean }) {
  return (
    <Pressable
      style={[styles.calcBtn, disabled && styles.calcBtnDisabled]}
      onPress={onPress}
      disabled={disabled}
      accessibilityRole="button"
      accessibilityState={{ disabled: Boolean(disabled) }}
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
  onRendered,
}: {
  value: string;
  unit: string;
  mechanismNote: string;
  onRendered?: () => void;
}) {
  const headingRef = useRef<Text>(null);
  useEffect(() => {
    AccessibilityInfo.announceForAccessibility(`${unit}: ${value}`);
    const handle = findNodeHandle(headingRef.current);
    if (handle) AccessibilityInfo.setAccessibilityFocus(handle);
    onRendered?.();
  }, [onRendered, unit, value]);
  return (
    <View style={styles.resultCard} accessibilityLiveRegion="polite">
      <Text ref={headingRef} style={styles.resultUnit} accessibilityRole="header">{unit}</Text>
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

function SipGoalCalc({ onComputed }: CalcProps) {
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

  function calculate() {
    const next = calculateCompoundGrowth(Number(lumpSum), Number(monthly), Number(rate), Number(years));
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
      <CalcInput label="Starting lump sum" prefix="₹" value={lumpSum} onChange={setLumpSum} />
      <CalcInput label="Monthly contribution" prefix="₹" value={monthly} onChange={setMonthly} />
      <CalcInput label="Annual rate" suffix="%" value={rate} onChange={setRate} />
      <CalcInput label="Time horizon" suffix="years" value={years} onChange={setYears} />
      <CalcButton onPress={calculate} disabled={!ready} />
      {error ? <Text accessibilityRole="alert" style={styles.calcError}>{error}</Text> : null}
      {result ? (
        <>
          <ResultCard
            unit="Modeled amount at end"
            value={formatRupees(result.endingAmount)}
            mechanismNote={`This is a conditional model using your fixed ${rate}% annual rate, compounded monthly. Contributions are added at each month end and begin compounding in the following month.`}
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

// ─── D-128: Credit-card Payoff ────────────────────────────────────────────
function CreditCardPayoffCalc({ userId, onComputed }: CalcProps & { userId: string | null }) {
  const [cards, setCards] = useState<Holding[]>([]);
  const [cardsLoading, setCardsLoading] = useState(Boolean(userId));
  const [cardsFailed, setCardsFailed] = useState(false);
  const [selectedCardId, setSelectedCardId] = useState<string | null>(null);
  const [balance, setBalance] = useState('');
  const [rate, setRate] = useState('');
  const [payment, setPayment] = useState('');
  const [outcome, setOutcome] = useState<ReturnType<typeof calculateCreditCardPayoff> | null>(null);

  useEffect(() => {
    let active = true;
    // Auth identity is a hard data boundary: synchronously invalidate every
    // prior-user prefill, manual input, and result before starting the new fetch.
    setCards([]);
    setCardsFailed(false);
    setCardsLoading(Boolean(userId));
    setSelectedCardId(null);
    setBalance('');
    setRate('');
    setPayment('');
    setOutcome(null);
    if (!userId) return () => { active = false; };
    fetchHoldings(userId)
      .then((holdings) => {
        if (active) setCards(holdings.filter((holding) => holding.product_type === 'credit_card_debt'));
      })
      .catch(() => { if (active) setCardsFailed(true); })
      .finally(() => { if (active) setCardsLoading(false); });
    return () => { active = false; };
  }, [userId]);

  const selectCard = (card: Holding) => {
    setSelectedCardId(card.id);
    const storedBalance = card.characteristics.outstanding_balance;
    const storedRate = card.characteristics.interest_rate;
    setBalance(typeof storedBalance === 'number' ? String(storedBalance) : '');
    setRate(typeof storedRate === 'number' ? String(storedRate) : '');
    setOutcome(null);
  };

  const editBalance = (value: string) => {
    setBalance(value);
    setSelectedCardId(null);
    setOutcome(null);
  };
  const editRate = (value: string) => {
    setRate(value);
    setSelectedCardId(null);
    setOutcome(null);
  };
  const editPayment = (value: string) => {
    setPayment(value);
    setOutcome(null);
  };

  const calculate = () => setOutcome(calculateCreditCardPayoff(Number(balance), Number(rate), Number(payment)));
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
      <Text style={styles.prefillIntro}>Recorded cards are optional starting points. Selecting one fills only its recorded balance and rate; every field remains editable. Editing either prefilled value clears the selected-card marker because the numbers are then your manual inputs.</Text>
      {cardsLoading ? <Text style={styles.prefillStatus} accessibilityLiveRegion="polite">Loading recorded cards…</Text> : null}
      {cardsFailed ? <Text style={styles.prefillStatus} accessibilityLiveRegion="polite">Recorded cards could not be loaded. Manual entry is still available.</Text> : null}
      {!cardsLoading && !cardsFailed && cards.length === 0 ? <Text style={styles.prefillStatus}>No recorded cards found. Enter values manually.</Text> : null}
      {cards.length > 0 ? (
        <View accessibilityRole="radiogroup" style={styles.cardChoices}>
          {cards.map((card) => (
            <Pressable key={card.id} accessibilityRole="radio" accessibilityState={{ checked: selectedCardId === card.id }} style={[styles.cardChoice, selectedCardId === card.id && styles.cardChoiceSelected]} onPress={() => selectCard(card)}>
              <Text style={styles.cardChoiceLabel}>{card.display_name ?? card.alias}</Text>
              <Text style={styles.cardChoiceHint}>Use recorded balance and rate</Text>
            </Pressable>
          ))}
        </View>
      ) : null}
      <CalcInput label="Outstanding balance" prefix="₹" value={balance} onChange={editBalance} />
      <CalcInput label="Annual interest rate" suffix="%" value={rate} onChange={editRate} />
      <CalcInput label="Fixed monthly payment" prefix="₹" value={payment} onChange={editPayment} />
      <CalcButton onPress={calculate} disabled={balance === '' || rate === '' || payment === ''} />
      {errorCopy ? <Text accessibilityRole="alert" style={styles.calcError}>{errorCopy}</Text> : null}
      {outcome?.kind === 'non_clearing' ? <Text accessibilityRole="alert" style={styles.calcError}>With these inputs, the first month’s interest is at least the fixed payment, so the modeled balance does not reach zero.</Text> : null}
      {outcome?.kind === 'capped' ? <Text accessibilityRole="alert" style={styles.calcError}>This balance does not reach zero within the model’s {PAYOFF_MONTH_CAP.toLocaleString('en-IN')}-month safety limit, so no payoff result is shown.</Text> : null}
      {validResult ? (
        <>
          <ResultCard unit="Modeled payoff time" value={`${validResult.months} months`} mechanismNote="Each month applies interest to the remaining balance first, then subtracts your fixed payment, clamped to the amount due in the final month." onRendered={onComputed} />
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
  calcError: { color: colors.danger, fontFamily: font.ui, fontSize: 13, lineHeight: 19, marginBottom: spacing.lg },
  disclosure: { color: colors.inkSecondary, fontFamily: font.tutor, fontSize: 13, lineHeight: 19, marginTop: spacing.lg },
  prefillIntro: { color: colors.inkSecondary, fontFamily: font.ui, fontSize: 13, lineHeight: 19, marginBottom: spacing.md },
  prefillStatus: { color: colors.inkMuted, fontFamily: font.ui, fontSize: 13, lineHeight: 19, marginBottom: spacing.md },
  cardChoices: { gap: spacing.sm, marginBottom: spacing.lg },
  cardChoice: { minHeight: 52, justifyContent: 'center', borderWidth: StyleSheet.hairlineWidth, borderColor: colors.line, borderRadius: radius.md, paddingHorizontal: spacing.md, paddingVertical: spacing.sm },
  cardChoiceSelected: { borderColor: colors.tutor, backgroundColor: colors.tutorSoft },
  cardChoiceLabel: { color: colors.ink, fontFamily: font.uiSemibold, fontSize: 14 },
  cardChoiceHint: { color: colors.inkSecondary, fontFamily: font.ui, fontSize: 12, marginTop: 2 },
});
