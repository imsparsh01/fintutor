import { useState } from 'react';
import { ActivityIndicator, Modal, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { TeachingBlock } from './TeachingBlock';
import { colors, figure, font, radius, spacing } from '../design/tokens';
import { formatRupees } from '../lib/format';
import { fetchTaxSavingRoom, type TaxSavingRoomResult } from '../lib/taxSavingRoom';

// D-067's user-triggered entry point + D-070/BRIEF-016's math. Tax regime is asked here,
// in the tool, each time — never stored on the profile (Gap A's resolution).
//
// D-091 (10-Aug-2026): the unused-room figure below is exactly the surface where a verdict
// ("so which instrument should I put this in?") is the natural next thought and nothing else
// on screen addresses it — so it carries an explicit "what we won't say" block, adopted
// verbatim rather than reworded per-context (see docs/decisions/D-091-what-we-wont-say-block.md).
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

        {loading && <ActivityIndicator style={styles.spinner} color={colors.ink} />}
        {error && <Text style={styles.errorText}>{error}</Text>}

        {result && (
          <View style={styles.results}>
            {result.applicable ? (
              <>
                <View style={styles.card}>
                  <Text style={styles.cardLabel}>Unused 80C room</Text>
                  <Text style={styles.cardValue}>{formatRupees(result.unused_room ?? 0)}</Text>
                  <Text style={styles.cardNote}>{result.note}</Text>
                </View>

                <TeachingBlock heading="What we won't say">
                  <Text style={styles.wontSayBody}>
                    Which instrument to fill it with, or whether to fill it at all. Ask about any
                    qualifying category and we'll show you its lock-in, risk and mechanism side by
                    side.
                  </Text>
                  <Text style={styles.wontSayKeyLine}>Room isn't an instruction.</Text>
                </TeachingBlock>
              </>
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
  container: { padding: spacing.xl, paddingTop: spacing.xxxl, backgroundColor: colors.screen },
  title: {
    fontFamily: font.ui,
    fontSize: 20,
    fontWeight: '600',
    color: colors.ink,
    marginBottom: spacing.lg,
  },
  subtitle: { fontFamily: font.ui, fontSize: 14, color: colors.inkSecondary, marginBottom: spacing.lg },
  regimeRow: { flexDirection: 'row', gap: spacing.md },
  regimeButton: {
    flex: 1,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: colors.line,
    borderRadius: radius.sm,
    paddingVertical: spacing.md,
    alignItems: 'center',
  },
  regimeButtonText: { fontFamily: font.ui, fontSize: 15, fontWeight: '600', color: colors.ink },
  spinner: { marginTop: spacing.xl },
  errorText: { fontFamily: font.ui, color: colors.danger, marginTop: spacing.md },
  results: { gap: spacing.md },
  card: {
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: colors.lineSoft,
    borderRadius: radius.md,
    padding: spacing.lg,
  },
  // Ledger label (1D) — font.mono 12 / ls 0.5 / uppercase / inkMuted. Was the retired
  // middle variant (ls 1.0 / inkSecondary).
  cardLabel: {
    fontFamily: font.mono,
    fontSize: 12,
    color: colors.inkMuted,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  cardValue: {
    fontFamily: font.mono,
    fontSize: figure.subHero,
    fontWeight: '700',
    color: colors.ink,
    marginTop: spacing.xs,
  },
  cardNote: {
    fontFamily: font.tutor,
    fontSize: 12,
    color: colors.inkMuted,
    marginTop: spacing.sm,
    lineHeight: 17,
  },
  // D-091 block body — TeachingBlock (1A) supplies the card itself; these two style the
  // two paragraphs inside it (a fixed sentence, then a bolded key line).
  wontSayBody: {
    fontFamily: font.tutor,
    fontSize: 15,
    lineHeight: 22,
    color: colors.ink,
  },
  // font.tutor, not font.ui — this is the tutor's own emphasis, not interface chrome.
  wontSayKeyLine: {
    fontFamily: font.tutor,
    fontSize: 15,
    lineHeight: 21,
    fontWeight: '600',
    color: colors.ink,
    marginTop: spacing.sm,
  },
  tryAgain: { alignItems: 'center', paddingVertical: spacing.sm },
  tryAgainText: { fontFamily: font.ui, color: colors.tutor, fontWeight: '600', fontSize: 13 },
  cancel: { alignItems: 'center', marginTop: spacing.xl },
  cancelText: { fontFamily: font.ui, color: colors.inkMuted },
});
