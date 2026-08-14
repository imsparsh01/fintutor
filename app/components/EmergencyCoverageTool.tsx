import { useEffect, useRef, useState } from 'react';
import { AccessibilityInfo, findNodeHandle, Platform, Pressable, ScrollView, StyleSheet, Text, TextInput, View } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import type { BottomTabNavigationProp } from '@react-navigation/bottom-tabs';
import { colors, font, radius, spacing } from '../design/tokens';
import { fetchBudget } from '../lib/budget';
import { calculateEmergencyCoverage, emergencyBudgetPrefill, emergencyCoverageSignature, emergencyFixedDepositPrefill, emergencyPrefillWhenUntouched, shouldEmitEmergencyCoverage } from '../lib/emergencyCoverage';
import { formatRupees } from '../lib/format';
import { fetchHoldings } from '../lib/holdings';
import type { MainTabsParamList } from '../navigation/types';

type Props = { userId: string | null; surface: 'scenario' | 'calculator'; onComputed: () => void };

export function EmergencyCoverageTool({ userId, surface, onComputed }: Props) {
  const navigation = useNavigation<BottomTabNavigationProp<MainTabsParamList>>();
  const generation = useRef(0);
  const resultHeading = useRef<Text>(null);
  const onComputedRef = useRef(onComputed);
  const lastEmittedSignature = useRef<string | null>(null);
  const fdTouchedRef = useRef(false);
  const outgoingsTouchedRef = useRef(false);
  const [cash, setCash] = useState('');
  const [fixedDeposits, setFixedDeposits] = useState('');
  const [other, setOther] = useState('');
  const [outgoings, setOutgoings] = useState('');
  const [fdTouched, setFdTouched] = useState(false);
  const [outgoingsTouched, setOutgoingsTouched] = useState(false);
  const [fdLoadFailed, setFdLoadFailed] = useState(false);
  const [budgetLoadFailed, setBudgetLoadFailed] = useState(false);
  const [result, setResult] = useState<{ value: NonNullable<ReturnType<typeof calculateEmergencyCoverage>>; signature: string } | null>(null);
  const [notice, setNotice] = useState<string | null>(null);

  useEffect(() => {
    onComputedRef.current = onComputed;
  }, [onComputed]);

  useEffect(() => {
    const active = ++generation.current;
    setCash(''); setFixedDeposits(''); setOther(''); setOutgoings('');
    fdTouchedRef.current = false; outgoingsTouchedRef.current = false;
    setFdTouched(false); setOutgoingsTouched(false); setFdLoadFailed(false); setBudgetLoadFailed(false);
    setResult(null); setNotice(null);
    if (!userId) return () => { generation.current += 1; };
    fetchHoldings(userId).then((items) => {
      const prefill = emergencyPrefillWhenUntouched(fdTouchedRef.current, emergencyFixedDepositPrefill(items));
      if (generation.current === active && prefill !== null) {
        setFixedDeposits(String(Math.round(prefill)));
        setResult(null); setNotice(null);
      }
    }).catch(() => { if (generation.current === active) setFdLoadFailed(true); });
    fetchBudget(userId).then((budget) => {
      const prefill = emergencyPrefillWhenUntouched(outgoingsTouchedRef.current, emergencyBudgetPrefill(budget));
      if (generation.current === active && prefill !== null) {
        setOutgoings(String(Math.round(prefill)));
        setResult(null); setNotice(null);
      }
    }).catch(() => { if (generation.current === active) setBudgetLoadFailed(true); });
    return () => { generation.current += 1; };
  }, [userId]);

  function edit(setter: (value: string) => void, touched?: (value: boolean) => void) {
    return (value: string) => { touched?.(true); setter(value); setResult(null); setNotice(null); };
  }

  function calculate() {
    const inputs = {
      cashAndBank: Number(cash || 0), fixedDeposits: Number(fixedDeposits || 0),
      otherAccessible: Number(other || 0), monthlyOutgoings: Number(outgoings),
    };
    const next = calculateEmergencyCoverage(inputs);
    if (!next) { setResult(null); setNotice('Enter non-negative balances and monthly outgoings greater than zero.'); return; }
    setNotice(null); setResult({ value: next, signature: emergencyCoverageSignature(inputs) });
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
    <Field label="Recorded fixed-deposit principal" value={fixedDeposits} onChange={edit(setFixedDeposits, (value) => { fdTouchedRef.current = value; setFdTouched(value); })} prefilled={!fdTouched && !fdLoadFailed} />
    {fdLoadFailed && <Text style={styles.loadNote} accessibilityLiveRegion="polite">Recorded fixed deposits could not be loaded. You can still enter an amount manually.</Text>}
    <Text style={styles.note}>Premature closure of a fixed deposit can reduce or delay the proceeds available.</Text>
    <Field label="Other amount you know you could access (optional)" value={other} onChange={edit(setOther)} />
    <Field label="Monthly outgoings" value={outgoings} onChange={edit(setOutgoings, (value) => { outgoingsTouchedRef.current = value; setOutgoingsTouched(value); })} prefilled={!outgoingsTouched && !budgetLoadFailed} />
    {budgetLoadFailed && <Text style={styles.loadNote} accessibilityLiveRegion="polite">Budget outgoings could not be loaded. You can still enter an amount manually.</Text>}
    <Pressable style={styles.button} onPress={calculate} accessibilityRole="button"><Text style={styles.buttonText}>{surface === 'scenario' ? 'Run this scenario' : 'Calculate'}</Text></Pressable>
    {notice && <Text style={styles.loadNote} accessibilityLiveRegion="polite">{notice}</Text>}
    {result && <View style={styles.result} accessibilityLiveRegion="polite">
      <Text ref={resultHeading} style={styles.resultUnit} accessibilityRole="header">Months covered</Text>
      <Text style={styles.resultValue}>{result.value.months.toFixed(1)}</Text>
      <Text style={styles.note}>{formatRupees(result.value.accessibleBalances)} divided by {formatRupees(Number(outgoings))} of monthly outgoings.</Text>
      <Text style={styles.counted}>Counted: cash and bank balance, fixed-deposit principal, and any other accessible amount you entered.</Text>
    </View>}
    <View style={styles.teaching}><Text style={styles.teachingHeading}>What this does not model</Text><Text style={styles.note}>Taxes, penalties, access delays, returns, or changing expenses. Monthly outgoings stay editable; FinTutor does not decide which expenses you would cut. This result is not a target or a statement that the number of months is enough, safe, or adequate.</Text></View>
  </ScrollView>;
}

function Field({ label, value, onChange, prefilled }: { label: string; value: string; onChange: (v: string) => void; prefilled?: boolean }) {
  return <View style={styles.field}><View style={styles.labelRow}><Text style={styles.label}>{label}</Text>{prefilled && <Text style={styles.tag}>from your data</Text>}</View><View style={styles.inputRow}><Text style={styles.adorn}>₹</Text><TextInput style={styles.input} value={value} onChangeText={onChange} keyboardType="decimal-pad" accessibilityLabel={label} placeholder="0" placeholderTextColor={colors.inkMuted} /></View></View>;
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: colors.screen }, content: { padding: spacing.lg, paddingBottom: spacing.xxl },
  back: { minHeight: 44, alignSelf: 'flex-start', justifyContent: 'center', marginBottom: spacing.sm }, backText: { fontFamily: font.uiMedium, color: colors.tutor, fontSize: 16 },
  heading: { fontFamily: font.uiSemibold, fontSize: 28, color: colors.ink, marginBottom: spacing.sm }, question: { fontFamily: font.ui, fontSize: 16, lineHeight: 24, color: colors.inkSecondary, marginBottom: spacing.lg },
  field: { marginBottom: spacing.md }, labelRow: { flexDirection: 'row', justifyContent: 'space-between', gap: spacing.sm }, label: { flex: 1, fontFamily: font.uiMedium, color: colors.ink, marginBottom: spacing.xs }, tag: { fontFamily: font.ui, fontSize: 12, color: colors.inkMuted },
  inputRow: { flexDirection: 'row', alignItems: 'center', borderWidth: 1, borderColor: colors.line, borderRadius: radius.md, backgroundColor: colors.screen }, adorn: { paddingLeft: spacing.md, color: colors.inkSecondary }, input: { flex: 1, minHeight: 48, padding: spacing.md, fontFamily: font.mono, color: colors.ink },
  note: { fontFamily: font.ui, fontSize: 14, lineHeight: 21, color: colors.inkSecondary }, loadNote: { fontFamily: font.ui, fontSize: 14, lineHeight: 20, color: colors.inkSecondary, marginBottom: spacing.md },
  button: { minHeight: 48, alignItems: 'center', justifyContent: 'center', backgroundColor: colors.tutor, borderRadius: radius.md, marginVertical: spacing.lg }, buttonText: { fontFamily: font.uiMedium, color: colors.screen },
  result: { backgroundColor: colors.screen, borderWidth: 1, borderColor: colors.line, borderRadius: radius.lg, padding: spacing.lg, marginBottom: spacing.lg }, resultUnit: { fontFamily: font.uiMedium, color: colors.inkSecondary }, resultValue: { fontFamily: font.mono, fontSize: 36, color: colors.ink, marginVertical: spacing.sm }, counted: { fontFamily: font.ui, color: colors.ink, marginTop: spacing.md, lineHeight: 20 },
  teaching: { borderTopWidth: 1, borderTopColor: colors.line, paddingTop: spacing.lg }, teachingHeading: { fontFamily: font.uiSemibold, fontSize: 18, color: colors.ink, marginBottom: spacing.sm },
});
