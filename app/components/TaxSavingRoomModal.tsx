import { useState } from 'react';
import { ActivityIndicator, Modal, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { colors, spacing } from '../design/tokens';
import { formatRupees } from '../lib/format';
import { fetchTaxSavingRoom, type TaxSavingRoomResult } from '../lib/taxSavingRoom';

// D-067's user-triggered entry point + D-070/BRIEF-016's math. Tax regime is asked here,
// in the tool, each time — never stored on the profile (Gap A's resolution).
export function TaxSavingRoomModal({ userId, onClose }: { userId: string; onClose: () => void }) {
  const [result, setResult] = useState<TaxSavingRoomResult | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const check = async (regime: 'old' | 'new') => {
    setLoading(true);
    setError(null);
    setResult(null);
    try {
      const r = await fetchTaxSavingRoom(userId, regime);
      setResult(r);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to check');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal visible animationType="slide" onRequestClose={onClose}>
      <ScrollView contentContainerStyle={styles.container}>
        <Text style={styles.title}>Check my 80C room</Text>

        {!result && !loading && (
          <>
            <Text style={styles.subtitle}>Which tax regime are you filing under this year?</Text>
            <View style={styles.regimeRow}>
              <Pressable style={styles.regimeButton} onPress={() => check('old')}>
                <Text style={styles.regimeButtonText}>Old regime</Text>
              </Pressable>
              <Pressable style={styles.regimeButton} onPress={() => check('new')}>
                <Text style={styles.regimeButtonText}>New regime</Text>
              </Pressable>
            </View>
          </>
        )}

        {loading && <ActivityIndicator style={styles.spinner} />}
        {error && <Text style={styles.errorText}>{error}</Text>}

        {result && (
          <View style={styles.results}>
            {result.applicable ? (
              <View style={styles.card}>
                <Text style={styles.cardLabel}>Unused 80C room</Text>
                <Text style={styles.cardValue}>{formatRupees(result.unused_room ?? 0)}</Text>
                <Text style={styles.cardNote}>{result.note}</Text>
              </View>
            ) : (
              <View style={styles.card}>
                <Text style={styles.cardNote}>{result.note}</Text>
              </View>
            )}
            <Pressable style={styles.tryAgain} onPress={() => setResult(null)}>
              <Text style={styles.tryAgainText}>Check the other regime</Text>
            </Pressable>
          </View>
        )}

        <Pressable style={styles.cancel} onPress={onClose}>
          <Text style={styles.cancelText}>Close</Text>
        </Pressable>
      </ScrollView>
    </Modal>
  );
}

const styles = StyleSheet.create({
  container: { padding: spacing.xl, paddingTop: spacing.xxxl, backgroundColor: colors.background },
  title: { fontSize: 20, fontWeight: '600', color: colors.text, marginBottom: spacing.lg },
  subtitle: { fontSize: 14, color: colors.textSecondary, marginBottom: spacing.lg },
  regimeRow: { flexDirection: 'row', gap: spacing.md },
  regimeButton: {
    flex: 1,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: colors.border,
    borderRadius: 10,
    paddingVertical: spacing.md,
    alignItems: 'center',
  },
  regimeButtonText: { fontSize: 15, fontWeight: '600', color: colors.text },
  spinner: { marginTop: spacing.xl },
  errorText: { color: colors.danger, marginTop: spacing.md },
  results: { gap: spacing.md },
  card: {
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: colors.borderLight,
    borderRadius: 12,
    padding: spacing.lg,
  },
  cardLabel: { fontSize: 12, color: colors.textSecondary, textTransform: 'uppercase' },
  cardValue: { fontSize: 22, fontWeight: '700', color: colors.text, marginTop: spacing.xs },
  cardNote: { fontSize: 12, color: colors.textMuted, marginTop: spacing.sm, lineHeight: 17 },
  tryAgain: { alignItems: 'center', paddingVertical: spacing.sm },
  tryAgainText: { color: colors.success, fontWeight: '600', fontSize: 13 },
  cancel: { alignItems: 'center', marginTop: spacing.xl },
  cancelText: { color: colors.textMuted },
});
