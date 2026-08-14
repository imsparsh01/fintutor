import { useEffect, useRef, useState } from 'react';
import { ActivityIndicator, Modal, Pressable, ScrollView, StyleSheet, Text, TextInput, View } from 'react-native';
import { colors, font, radius, spacing } from '../design/tokens';
import { typography } from '../design/typography';
import { clearFinancialContext, fetchFinancialContext, saveFinancialContext } from '../lib/financialContext';
import { RequestGeneration } from '../lib/requestGeneration';

export function FinancialContextModal({ visible, onClose }: { visible: boolean; onClose: () => void }) {
  const [dependants, setDependants] = useState('');
  const [months, setMonths] = useState('');
  const [loading, setLoading] = useState(false);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [saved, setSaved] = useState(false);
  const [updatedAt, setUpdatedAt] = useState<string | null>(null);
  const request = useRef(new RequestGeneration());

  useEffect(() => {
    if (!visible) return;
    const generation = request.current.begin();
    setLoading(true); setBusy(false); setError(null); setSaved(false);
    fetchFinancialContext()
      .then((context) => {
        if (!request.current.isCurrent(generation)) return;
        setDependants(context.dependant_count === null ? '' : String(context.dependant_count));
        setMonths(context.emergency_fund_months === null ? '' : String(context.emergency_fund_months));
        setUpdatedAt(context.updated_at);
      })
      .catch((cause) => { if (request.current.isCurrent(generation)) setError(cause instanceof Error ? cause.message : 'Context could not be loaded.'); })
      .finally(() => { if (request.current.isCurrent(generation)) setLoading(false); });
    return () => request.current.cancel();
  }, [visible]);

  const save = async () => {
    const dependantCount = dependants.trim() === '' ? null : Number(dependants);
    const emergencyMonths = months.trim() === '' ? null : Number(months);
    if ((dependantCount !== null && (!Number.isInteger(dependantCount) || dependantCount < 0 || dependantCount > 100))
      || (emergencyMonths !== null && (!Number.isFinite(emergencyMonths) || emergencyMonths < 0 || emergencyMonths > 1200))) {
      setError('Dependants must be a whole number from 0–100; emergency months must be 0–1200.'); return;
    }
    const generation = request.current.begin();
    setBusy(true); setError(null);
    try {
      const context = await saveFinancialContext(dependantCount, emergencyMonths);
      if (!request.current.isCurrent(generation)) return;
      setUpdatedAt(context.updated_at); setSaved(true);
    }
    catch (cause) { if (request.current.isCurrent(generation)) setError(cause instanceof Error ? cause.message : 'Context could not be saved.'); }
    finally { if (request.current.isCurrent(generation)) setBusy(false); }
  };

  const clear = async () => {
    const generation = request.current.begin();
    setBusy(true); setError(null);
    try {
      await clearFinancialContext();
      if (!request.current.isCurrent(generation)) return;
      setDependants(''); setMonths(''); setUpdatedAt(null); setSaved(true);
    }
    catch (cause) { if (request.current.isCurrent(generation)) setError(cause instanceof Error ? cause.message : 'Context could not be cleared.'); }
    finally { if (request.current.isCurrent(generation)) setBusy(false); }
  };

  return (
    <Modal visible={visible} animationType="slide" onRequestClose={onClose}>
      <ScrollView style={styles.screen} contentContainerStyle={styles.content}>
        <View style={styles.header}><Text style={styles.title}>Optional financial context</Text><Pressable onPress={onClose}><Text style={styles.close}>Close</Text></Pressable></View>
        <Text style={styles.body}>These two confirmed values help Arya explain relevant mechanisms and let Portfolio Health calculate emergency-buffer coverage. They are optional; blank means unknown, never zero.</Text>
        {loading ? <ActivityIndicator color={colors.ink} /> : (
          <>
            <Text style={styles.label}>Number of financial dependants</Text>
            <TextInput accessibilityLabel="Number of financial dependants" style={styles.input} keyboardType="number-pad" value={dependants} onChangeText={(v) => { setDependants(v); setSaved(false); }} placeholder="Leave blank if unknown" placeholderTextColor={colors.inkMuted} />
            <Text style={styles.label}>Emergency fund coverage in months</Text>
            <TextInput accessibilityLabel="Emergency fund coverage in months" style={styles.input} keyboardType="decimal-pad" value={months} onChangeText={(v) => { setMonths(v); setSaved(false); }} placeholder="Leave blank if unknown" placeholderTextColor={colors.inkMuted} />
            {updatedAt ? <Text style={styles.confirmedAt}>Last confirmed: {new Date(updatedAt).toLocaleString()}</Text> : null}
            {error ? <Text accessibilityRole="alert" style={styles.error}>{error}</Text> : null}
            {saved ? <Text style={styles.saved}>Context updated.</Text> : null}
            <Pressable style={styles.save} disabled={busy} onPress={save}><Text style={styles.saveText}>{busy ? 'Working…' : 'Save confirmed values'}</Text></Pressable>
            <Pressable style={styles.clear} disabled={busy} onPress={clear}><Text style={styles.clearText}>Clear both values</Text></Pressable>
          </>
        )}
      </ScrollView>
    </Modal>
  );
}

const styles = StyleSheet.create({
  screen: { backgroundColor: colors.screen }, content: { padding: spacing.xl, paddingBottom: spacing.xxxl },
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', gap: spacing.md },
  title: typography.pageTitle, close: { fontFamily: font.uiMedium, color: colors.tutor, padding: spacing.sm },
  body: { fontFamily: font.tutor, fontSize: 16, lineHeight: 23, color: colors.inkSecondary, marginBottom: spacing.xl },
  label: { fontFamily: font.uiMedium, fontSize: 13, color: colors.ink, marginTop: spacing.lg, marginBottom: spacing.xs },
  input: { borderWidth: StyleSheet.hairlineWidth, borderColor: colors.line, borderRadius: radius.md, padding: spacing.md, fontFamily: font.mono, color: colors.ink },
  confirmedAt: { fontFamily: font.mono, fontSize: 11, color: colors.inkMuted, marginTop: spacing.md },
  error: { fontFamily: font.ui, color: colors.danger, marginTop: spacing.md }, saved: { fontFamily: font.ui, color: colors.tutor, marginTop: spacing.md },
  save: { backgroundColor: colors.tutor, borderRadius: radius.md, padding: 14, alignItems: 'center', marginTop: spacing.xl }, saveText: typography.primaryButtonText,
  clear: { borderWidth: StyleSheet.hairlineWidth, borderColor: colors.danger, borderRadius: radius.md, padding: 14, alignItems: 'center', marginTop: spacing.md },
  clearText: { fontFamily: font.uiSemibold, color: colors.danger },
});
