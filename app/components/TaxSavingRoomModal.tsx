import { useState } from 'react';
import { ActivityIndicator, Modal, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import type { BottomTabNavigationProp } from '@react-navigation/bottom-tabs';
import { TeachingBlock } from './TeachingBlock';
import { colors, figure, font, radius, spacing } from '../design/tokens';
import { typography } from '../design/typography';
import { formatRupees } from '../lib/format';
import { fetchTaxSavingRoom, type TaxSavingRoomResult } from '../lib/taxSavingRoom';
import type { MainTabsParamList } from '../navigation/types';

// D-067's user-triggered entry point + D-070/BRIEF-016's math. Tax regime is asked here,
// in the tool, each time — never stored on the profile (Gap A's resolution).
//
// D-091 (10-Aug-2026): the unused-room figure below is exactly the surface where a verdict
// ("so which instrument should I put this in?") is the natural next thought and nothing else
// on screen addresses it — so it carries an explicit "what we won't say" block, adopted
// verbatim rather than reworded per-context (see docs/decisions/D-091-what-we-wont-say-block.md).
//
// Mockup alignment (Flow 05, 5.3): title reads "Your 80C room"; once computed, a sub-line
// states the fiscal year/regime/provenance and the ledger renders as Ceiling / recorded
// contributions / Unused room (hero, figure.hero) rather than a single card. The mockup's
// literal ledger splits recorded contributions into "EPF (your share)" and "Life policy
// premium" as separate lines — the backend (backend/app/services/tax_saving_room.py) only
// ever returns their sum as `known_contributions`, with no per-category breakdown in the
// API. Splitting them here would mean inventing numbers the backend never computed, so this
// stays one combined line, labelled honestly, until/unless the API is extended (a backend
// change, out of scope for this pass). "Compare the categories" hands that category detail
// to the tutor instead, reusing the same navigate-to-Chat-with-a-prefill pattern already
// used identically in ConsolidatedScreen/LoansScreen/InsuranceScreen/InvestmentsScreen.
export function TaxSavingRoomModal({ userId, onClose }: { userId: string; onClose: () => void }) {
  const navigation = useNavigation<BottomTabNavigationProp<MainTabsParamList>>();
  const [regime, setRegime] = useState<'old' | 'new' | null>(null);
  const [result, setResult] = useState<TaxSavingRoomResult | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const check = async (r: 'old' | 'new') => {
    setRegime(r);
    setLoading(true);
    setError(null);
    setResult(null);
    try {
      const res = await fetchTaxSavingRoom(userId, r);
      setResult(res);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to check');
    } finally {
      setLoading(false);
    }
  };

  const startOver = () => {
    setResult(null);
    setRegime(null);
  };

  const compareCategories = () => {
    onClose();
    navigation.navigate('Chat', {
      prefillQuestion:
        "Can you compare the 80C categories — EPF, life insurance premiums, ELSS and PPF — their lock-in, risk and mechanism?",
    });
  };

  return (
    <Modal visible animationType="slide" onRequestClose={onClose}>
      <ScrollView contentContainerStyle={styles.container}>
        <Text style={styles.title}>Your 80C room</Text>

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
                <Text style={styles.computedSubtitle}>
                  {currentFiscalYearLabel()} · {regime} regime · computed from what you've
                  recorded
                </Text>

                <View style={styles.card}>
                  <LedgerLine label="Ceiling" value={formatRupees(result.cap ?? 150000)} />
                  <LedgerLine
                    label="Recorded contributions (EPF + life policy)"
                    value={formatRupees(result.known_contributions ?? 0)}
                  />
                  <View style={styles.heroBlock}>
                    <Text style={styles.heroLabel}>Unused room</Text>
                    <Text style={styles.heroValue}>{formatRupees(result.unused_room ?? 0)}</Text>
                  </View>
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

                <View style={styles.actionsRow}>
                  <Pressable style={styles.actionButton} onPress={compareCategories}>
                    <Text style={styles.actionButtonText}>Compare the categories</Text>
                  </Pressable>
                  <Pressable style={styles.actionButton} onPress={startOver}>
                    <Text style={styles.actionButtonText}>Old vs new regime</Text>
                  </Pressable>
                </View>
              </>
            ) : (
              <>
                <View style={styles.card}>
                  <Text style={styles.cardNote}>{result.note}</Text>
                </View>
                <Pressable style={styles.tryAgain} onPress={startOver}>
                  <Text style={styles.tryAgainText}>Old vs new regime</Text>
                </Pressable>
              </>
            )}
          </View>
        )}

        <Pressable style={styles.cancel} onPress={onClose}>
          <Text style={styles.cancelText}>Close</Text>
        </Pressable>
      </ScrollView>
    </Modal>
  );
}

// The Ceiling / recorded-contributions rows share this exact row shape — plain ledger
// weight, no color, no valence (P10). The one figure that decides anything here (Unused
// room) is broken out into its own hero block below, not folded into this component.
function LedgerLine({ label, value }: { label: string; value: string }) {
  return (
    <View style={styles.ledgerRow}>
      <Text style={styles.ledgerRowLabel}>{label}</Text>
      <Text style={styles.ledgerRowValue}>{value}</Text>
    </View>
  );
}

// Display-only fiscal-year label (India's FY runs April–March) — a calendar computation,
// not a financial one, purely for the "FY 2026-27 · …" provenance sub-line the mockup
// specifies. No stored data, no tax logic.
function currentFiscalYearLabel(): string {
  const now = new Date();
  const startYear = now.getMonth() >= 3 ? now.getFullYear() : now.getFullYear() - 1;
  const endYearShort = String((startYear + 1) % 100).padStart(2, '0');
  return `FY ${startYear}-${endYearShort}`;
}

const styles = StyleSheet.create({
  container: { padding: spacing.xl, paddingTop: spacing.xxxl, backgroundColor: colors.screen },
  title: typography.pageTitle,
  subtitle: { fontFamily: font.ui, fontSize: 14, color: colors.inkSecondary, marginBottom: spacing.lg },
  // Sub-line device: fiscal year / regime / provenance, once a result exists.
  computedSubtitle: {
    fontFamily: font.mono,
    fontSize: 12,
    letterSpacing: 0.3,
    color: colors.inkMuted,
    marginBottom: spacing.md,
  },
  regimeRow: { flexDirection: 'row', gap: spacing.md },
  regimeButton: {
    flex: 1,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: colors.line,
    borderRadius: radius.sm,
    paddingVertical: spacing.md,
    alignItems: 'center',
  },
  regimeButtonText: { fontFamily: font.uiSemibold, fontSize: 15, color: colors.ink },
  spinner: { marginTop: spacing.xl },
  errorText: { fontFamily: font.ui, color: colors.danger, marginTop: spacing.md },
  results: { gap: spacing.md },
  card: {
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: colors.lineSoft,
    borderRadius: radius.md,
    padding: spacing.lg,
  },
  ledgerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: spacing.sm,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: colors.lineSoft,
  },
  ledgerRowLabel: typography.ledgerLabel,
  ledgerRowValue: typography.ledgerValue,
  // The deciding figure: largest type on the screen (mandatory device #3). Hero scale (1G).
  heroBlock: { marginTop: spacing.md },
  heroLabel: typography.ledgerLabel,
  heroValue: {
    fontFamily: font.monoSemibold, // only 600 loaded for this face
    fontSize: figure.hero,
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
    fontFamily: font.tutorSemibold,
    fontSize: 15,
    lineHeight: 21,
    color: colors.ink,
    marginTop: spacing.sm,
  },
  // "Compare the categories" / "Old vs new regime" — two plain, equal-weight actions,
  // neither styled as primary over the other (no valence, P10).
  actionsRow: { flexDirection: 'row', gap: spacing.md },
  actionButton: {
    flex: 1,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: colors.tutor,
    borderRadius: radius.md,
    paddingVertical: spacing.md,
    alignItems: 'center',
  },
  actionButtonText: typography.secondaryButtonText,
  tryAgain: { alignItems: 'center', paddingVertical: spacing.sm },
  tryAgainText: { fontFamily: font.uiSemibold, color: colors.tutor, fontSize: 13 },
  cancel: { alignItems: 'center', marginTop: spacing.xl },
  cancelText: { fontFamily: font.ui, color: colors.inkMuted },
});
